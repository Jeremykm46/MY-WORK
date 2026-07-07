const { Course, Student, CourseStudent, AttendanceSession, Attendance, User } = require('../../models');
const { generateQRCode, verifyQRPayload } = require('./qr.service');
const { emitToCourse, emitToUser } = require('../../config/socket');
const { getPagination, buildPaginationMeta } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const startSession = async ({ courseId, lecturerId, sessionDate, startTime, endTime, sessionType, locationData }) => {
  // Check lecturer owns this course
  const course = await Course.findOne({ _id: courseId, lecturerId }).lean();
  if (!course) throw Object.assign(new Error('Course not found or you are not assigned to it'), { statusCode: 403 });

  // Resume today's session if one is already open, rather than erroring —
  // a lecturer re-opening the "take attendance" screen should pick up
  // where they left off, with a freshly-signed QR code.
  const openSession = await AttendanceSession.findOne({ courseId, sessionDate, status: 'open' }).lean();
  if (openSession) {
    const { qrDataUrl, expiresAt } = await generateQRCode(openSession._id.toString(), courseId);
    return { sessionId: openSession._id.toString(), qrDataUrl, expiresAt, resumed: true };
  }

  const session = await AttendanceSession.create({
    courseId,
    lecturerId,
    sessionDate,
    startTime,
    endTime: endTime || null,
    sessionType: sessionType || 'lecture',
    locationLat: locationData?.lat || null,
    locationLng: locationData?.lng || null,
    status: 'open',
  });
  const sessionId = session._id.toString();

  const { qrDataUrl, expiresAt } = await generateQRCode(sessionId, courseId);

  // Notify students in the course via Socket.IO
  emitToCourse(courseId, 'attendance:session_started', {
    sessionId,
    courseId,
    courseName: course.name,
    courseCode: course.code,
    sessionDate,
    startTime,
    sessionType,
  });

  return { sessionId, qrDataUrl, expiresAt };
};

const refreshQR = async (sessionId, lecturerId) => {
  const session = await AttendanceSession.findOne({ _id: sessionId, lecturerId, status: 'open' }).lean();
  if (!session) throw Object.assign(new Error('Session not found or not active'), { statusCode: 404 });

  const { qrDataUrl, expiresAt } = await generateQRCode(sessionId, session.courseId.toString());
  return { qrDataUrl, expiresAt };
};

const markAttendance = async ({ sessionId, studentUserId, method, qrPayload, location }) => {
  // Get student record
  const student = await Student.findOne({ userId: studentUserId }).lean();
  if (!student) throw Object.assign(new Error('Student record not found'), { statusCode: 404 });

  // Get and validate session
  const session = await AttendanceSession.findById(sessionId).lean();
  if (!session) throw Object.assign(new Error('Attendance session not found'), { statusCode: 404 });
  if (session.status !== 'open') throw Object.assign(new Error('This attendance session is closed'), { statusCode: 400 });

  // Verify student is enrolled in the course
  const enrolled = await CourseStudent.findOne({ studentId: student._id, courseId: session.courseId }).lean();
  if (!enrolled) throw Object.assign(new Error('You are not enrolled in this course'), { statusCode: 403 });

  // Prevent duplicate submission
  const existing = await Attendance.findOne({ sessionId, studentId: student._id }).lean();
  if (existing) throw Object.assign(new Error('Attendance already marked for this session'), { statusCode: 409 });

  // QR verification
  if (method === 'qr' && qrPayload) {
    const verified = verifyQRPayload(qrPayload);
    if (verified.sessionId !== sessionId) {
      throw Object.assign(new Error('QR code does not match this session'), { statusCode: 400 });
    }
  }

  await Attendance.create({
    sessionId,
    studentId: student._id,
    status: 'present',
    method: method || 'manual',
    markedAt: new Date(),
    locationLat: location?.lat || null,
    locationLng: location?.lng || null,
  });

  // Real-time broadcast to session room
  emitToCourse(session.courseId.toString(), 'attendance:marked', { studentId: student._id.toString(), sessionId, status: 'present' });

  return { message: 'Attendance marked successfully' };
};

const markByLecturer = async (sessionId, lecturerId, studentId, status, editorUserId) => {
  const session = await AttendanceSession.findOne({ _id: sessionId, lecturerId, status: 'open' }).lean();
  if (!session) throw Object.assign(new Error('Session not found or not active'), { statusCode: 404 });

  const enrolled = await CourseStudent.findOne({ studentId, courseId: session.courseId }).lean();
  if (!enrolled) throw Object.assign(new Error('Student is not enrolled in this course'), { statusCode: 403 });

  await Attendance.findOneAndUpdate(
    { sessionId, studentId },
    {
      $setOnInsert: { sessionId, studentId, method: 'manual', markedAt: new Date() },
      $set: { status, editedBy: editorUserId, editedAt: new Date() },
    },
    { upsert: true }
  );

  emitToCourse(session.courseId.toString(), 'attendance:marked', { studentId, sessionId, status });
};

const closeSession = async (sessionId, lecturerId) => {
  const session = await AttendanceSession.findOne({ _id: sessionId, lecturerId, status: 'open' }).lean();
  if (!session) throw Object.assign(new Error('Session not found or already closed'), { statusCode: 404 });

  // Mark absent for students who didn't attend
  const enrolledStudentIds = await CourseStudent.find({ courseId: session.courseId }).distinct('studentId');
  const markedStudentIds = new Set(
    (await Attendance.find({ sessionId }).distinct('studentId')).map((id) => id.toString())
  );
  const absentees = enrolledStudentIds.filter((id) => !markedStudentIds.has(id.toString()));
  if (absentees.length) {
    await Attendance.insertMany(
      absentees.map((studentId) => ({ sessionId, studentId, status: 'absent', method: 'system', markedAt: new Date() }))
    );
  }

  await AttendanceSession.updateOne({ _id: sessionId }, { status: 'closed', closedAt: new Date() });

  emitToCourse(session.courseId.toString(), 'attendance:session_closed', { sessionId });
};

const editAttendance = async (attendanceId, { status, remarks }, editorId) => {
  const record = await Attendance.findById(attendanceId).lean();
  if (!record) throw Object.assign(new Error('Attendance record not found'), { statusCode: 404 });

  await Attendance.updateOne(
    { _id: attendanceId },
    { status, remarks: remarks || null, editedBy: editorId, editedAt: new Date() }
  );

  // Audit the edit
  logger.info(`Attendance ${attendanceId} edited to '${status}' by user ${editorId}`);
};

const getSessionAttendance = async (sessionId, lecturerId) => {
  const session = await AttendanceSession.findOne({ _id: sessionId, lecturerId }).lean();
  if (!session) throw Object.assign(new Error('Session not found'), { statusCode: 404 });

  const enrollments = await CourseStudent.find({ courseId: session.courseId }).lean();
  const studentIds = enrollments.map((e) => e.studentId);
  const students = await Student.find({ _id: { $in: studentIds } }).lean();
  const studentUsers = await User.find({ _id: { $in: students.map((s) => s.userId) } }).select('name email').lean();
  const usersById = new Map(studentUsers.map((u) => [u._id.toString(), u]));

  const attendanceRecords = await Attendance.find({ sessionId, studentId: { $in: studentIds } }).lean();
  const recordByStudent = new Map(attendanceRecords.map((r) => [r.studentId.toString(), r]));

  const records = students
    .map((s) => {
      const user = usersById.get(s.userId.toString());
      if (!user) return null;
      const record = recordByStudent.get(s._id.toString());
      return {
        id: record ? record._id.toString() : null,
        status: record ? record.status : null,
        method: record ? record.method : null,
        marked_at: record ? record.markedAt : null,
        edited_at: record ? record.editedAt : null,
        student_id: s._id.toString(),
        student_code: s.studentId,
        name: user.name,
        email: user.email,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  const summary = {
    total: records.length,
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent' || !r.status).length,
    late: records.filter((r) => r.status === 'late').length,
  };

  return {
    session: {
      id: session._id.toString(),
      course_id: session.courseId.toString(),
      session_date: session.sessionDate,
      start_time: session.startTime,
      status: session.status,
    },
    records,
    summary,
  };
};

const getStudentAttendanceHistory = async (studentUserId, { courseId, from, to, page, limit }) => {
  const { page: p, limit: l, offset } = getPagination(page, limit);

  const student = await Student.findOne({ userId: studentUserId }).lean();
  if (!student) return { records: [], pagination: buildPaginationMeta(0, p, l) };

  const sessionFilter = {};
  if (courseId) sessionFilter.courseId = courseId;
  if (from || to) {
    sessionFilter.sessionDate = {};
    if (from) sessionFilter.sessionDate.$gte = from;
    if (to) sessionFilter.sessionDate.$lte = to;
  }

  const sessions = await AttendanceSession.find(sessionFilter).lean();
  const sessionIds = sessions.map((s) => s._id);
  const sessionsById = new Map(sessions.map((s) => [s._id.toString(), s]));

  const courseIds = [...new Set(sessions.map((s) => s.courseId.toString()))];
  const courses = await Course.find({ _id: { $in: courseIds } }).select('code name').lean();
  const coursesById = new Map(courses.map((c) => [c._id.toString(), c]));

  const allRecords = await Attendance.find({ studentId: student._id, sessionId: { $in: sessionIds } }).lean();

  const combined = allRecords
    .map((a) => {
      const session = sessionsById.get(a.sessionId.toString());
      const course = session ? coursesById.get(session.courseId.toString()) : null;
      if (!session || !course) return null;
      return {
        id: a._id.toString(),
        status: a.status,
        method: a.method,
        marked_at: a.markedAt,
        session_date: session.sessionDate,
        course_code: course.code,
        course_name: course.name,
        _sortDate: session.sessionDate,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a._sortDate < b._sortDate ? 1 : a._sortDate > b._sortDate ? -1 : 0));

  const total = combined.length;
  const records = combined.slice(offset, offset + l).map(({ _sortDate, ...rest }) => rest);

  return { records, pagination: buildPaginationMeta(total, p, l) };
};

module.exports = { startSession, refreshQR, markAttendance, markByLecturer, closeSession, editAttendance, getSessionAttendance, getStudentAttendanceHistory };
