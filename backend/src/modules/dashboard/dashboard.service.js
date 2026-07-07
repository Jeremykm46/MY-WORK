const { User, Course, Lecturer, Student, CourseStudent, AttendanceSession, Attendance, Notification } = require('../../models');

const todayStr = () => new Date().toISOString().split('T')[0];

const daysAgoStr = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const round2 = (n) => (n === null || n === undefined || Number.isNaN(n) ? null : Math.round(n * 100) / 100);

const getAdminDashboard = async () => {
  const [totalStudents, totalLecturers, totalCourses, sessionsToday] = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'lecturer', isActive: true }),
    Course.countDocuments({ isActive: true }),
    AttendanceSession.countDocuments({ sessionDate: todayStr() }),
  ]);

  const presentToday = await Attendance.countDocuments({
    status: 'present',
    createdAt: { $gte: new Date(new Date().toDateString()) },
  });

  const last30dSessions = await AttendanceSession.find({ sessionDate: { $gte: daysAgoStr(30) } }).select('_id').lean();
  const last30dSessionIds = last30dSessions.map((s) => s._id);
  const last30dRecords = await Attendance.find({ sessionId: { $in: last30dSessionIds } }).lean();
  const bySession = new Map();
  for (const r of last30dRecords) {
    const key = r.sessionId.toString();
    if (!bySession.has(key)) bySession.set(key, { total: 0, present: 0 });
    const s = bySession.get(key);
    s.total += 1;
    if (r.status === 'present') s.present += 1;
  }
  const perSessionPct = [...bySession.values()].filter((s) => s.total > 0).map((s) => (s.present * 100) / s.total);
  const avgAttendance30d = perSessionPct.length ? round2(perSessionPct.reduce((a, b) => a + b, 0) / perSessionPct.length) : null;

  const stats = {
    total_students: totalStudents,
    total_lecturers: totalLecturers,
    total_courses: totalCourses,
    sessions_today: sessionsToday,
    present_today: presentToday,
    avg_attendance_30d: avgAttendance30d,
  };

  const recentSessionDocs = await AttendanceSession.find({ sessionDate: { $gte: daysAgoStr(7) } })
    .sort({ sessionDate: -1, startTime: -1 })
    .limit(10)
    .lean();
  const recentCourseIds = [...new Set(recentSessionDocs.map((s) => s.courseId.toString()))];
  const recentCourses = await Course.find({ _id: { $in: recentCourseIds } }).lean();
  const recentCoursesById = new Map(recentCourses.map((c) => [c._id.toString(), c]));
  const recentLecturerIds = recentSessionDocs.map((s) => s.lecturerId).filter(Boolean);
  const recentLecturers = await Lecturer.find({ _id: { $in: recentLecturerIds } }).lean();
  const recentLecturersById = new Map(recentLecturers.map((l) => [l._id.toString(), l]));
  const recentLecturerUsers = await User.find({ _id: { $in: recentLecturers.map((l) => l.userId) } }).select('name').lean();
  const recentUserNameById = new Map(recentLecturerUsers.map((u) => [u._id.toString(), u.name]));
  const recentSessionIds = recentSessionDocs.map((s) => s._id);
  const recentAttendance = await Attendance.find({ sessionId: { $in: recentSessionIds } }).lean();
  const recentStatsBySession = new Map();
  for (const a of recentAttendance) {
    const key = a.sessionId.toString();
    if (!recentStatsBySession.has(key)) recentStatsBySession.set(key, { total: 0, present: 0 });
    const s = recentStatsBySession.get(key);
    s.total += 1;
    if (a.status === 'present') s.present += 1;
  }

  const recentSessions = recentSessionDocs.map((s) => {
    const course = recentCoursesById.get(s.courseId.toString());
    const lecturer = s.lecturerId ? recentLecturersById.get(s.lecturerId.toString()) : null;
    const stat = recentStatsBySession.get(s._id.toString()) || { total: 0, present: 0 };
    return {
      id: s._id.toString(),
      session_date: s.sessionDate,
      start_time: s.startTime,
      status: s.status,
      code: course ? course.code : null,
      name: course ? course.name : null,
      lecturer: lecturer ? recentUserNameById.get(lecturer.userId.toString()) : null,
      total_students: stat.total,
      present: stat.present,
    };
  });

  // Low attendance: per (student, course) pairs with attendance % < 75
  const activeStudents = await Student.find().lean();
  const activeStudentIds = activeStudents.map((s) => s._id);
  const activeUsers = await User.find({ _id: { $in: activeStudents.map((s) => s.userId) }, isActive: true })
    .select('name')
    .lean();
  const activeUserByStudentUserId = new Map(activeUsers.map((u) => [u._id.toString(), u]));
  const activeStudentById = new Map(activeStudents.map((s) => [s._id.toString(), s]));

  const enrollments = await CourseStudent.find({ studentId: { $in: activeStudentIds } }).lean();
  const allCourses = await Course.find().lean();
  const allCoursesById = new Map(allCourses.map((c) => [c._id.toString(), c]));
  const allSessions = await AttendanceSession.find().select('_id courseId').lean();
  const sessionToCourse = new Map(allSessions.map((s) => [s._id.toString(), s.courseId.toString()]));
  const allAttendance = await Attendance.find({ studentId: { $in: activeStudentIds } }).lean();

  const pairStats = new Map(); // `${studentId}:${courseId}` -> {total, present}
  const enrolledPairs = new Set(enrollments.map((e) => `${e.studentId.toString()}:${e.courseId.toString()}`));
  for (const a of allAttendance) {
    const courseId = sessionToCourse.get(a.sessionId.toString());
    if (!courseId) continue;
    const key = `${a.studentId.toString()}:${courseId}`;
    if (!enrolledPairs.has(key)) continue;
    if (!pairStats.has(key)) pairStats.set(key, { total: 0, present: 0 });
    const stat = pairStats.get(key);
    stat.total += 1;
    if (a.status === 'present') stat.present += 1;
  }

  const lowAttendance = [];
  for (const [key, stat] of pairStats) {
    if (stat.total === 0) continue;
    const pct = (stat.present * 100) / stat.total;
    if (pct >= 75) continue;
    const [studentId, courseId] = key.split(':');
    const student = activeStudentById.get(studentId);
    const user = student ? activeUserByStudentUserId.get(student.userId.toString()) : null;
    const course = allCoursesById.get(courseId);
    if (!user || !course) continue;
    lowAttendance.push({ name: user.name, student_id: student.studentId, code: course.code, pct: round2(pct) });
  }
  lowAttendance.sort((a, b) => a.pct - b.pct);

  return { stats, recentSessions, lowAttendance: lowAttendance.slice(0, 10) };
};

const getLecturerDashboard = async (userId) => {
  const lecturer = await Lecturer.findOne({ userId }).lean();
  if (!lecturer) throw Object.assign(new Error('Lecturer not found'), { statusCode: 404 });

  const courseDocs = await Course.find({ lecturerId: lecturer._id, isActive: true }).lean();
  const courseIds = courseDocs.map((c) => c._id);

  const enrollmentCounts = await CourseStudent.aggregate([
    { $match: { courseId: { $in: courseIds } } },
    { $group: { _id: '$courseId', count: { $sum: 1 } } },
  ]);
  const enrolledByCourse = new Map(enrollmentCounts.map((e) => [e._id.toString(), e.count]));

  const sessions = await AttendanceSession.find({ courseId: { $in: courseIds } }).lean();
  const sessionsByCourse = new Map();
  for (const s of sessions) {
    const key = s.courseId.toString();
    if (!sessionsByCourse.has(key)) sessionsByCourse.set(key, []);
    sessionsByCourse.get(key).push(s._id);
  }
  const allSessionIds = sessions.map((s) => s._id);
  const attendanceRecords = await Attendance.find({ sessionId: { $in: allSessionIds } }).lean();
  const sessionToCourse = new Map(sessions.map((s) => [s._id.toString(), s.courseId.toString()]));
  const pctSumByCourse = new Map();
  for (const a of attendanceRecords) {
    const courseId = sessionToCourse.get(a.sessionId.toString());
    if (!pctSumByCourse.has(courseId)) pctSumByCourse.set(courseId, { sum: 0, count: 0 });
    const s = pctSumByCourse.get(courseId);
    s.count += 1;
    s.sum += a.status === 'present' ? 100 : 0;
  }

  const courses = courseDocs.map((c) => {
    const key = c._id.toString();
    const pctStat = pctSumByCourse.get(key);
    return {
      id: c._id.toString(),
      code: c.code,
      name: c.name,
      enrolled: enrolledByCourse.get(key) || 0,
      sessions_held: (sessionsByCourse.get(key) || []).length,
      avg_attendance: pctStat ? round2(pctStat.sum / pctStat.count) : null,
    };
  });

  const today = todayStr();
  const todaySessionDocs = await AttendanceSession.find({ lecturerId: lecturer._id, sessionDate: today }).lean();
  const coursesById = new Map(courseDocs.map((c) => [c._id.toString(), c]));
  const todaySessions = todaySessionDocs.map((s) => {
    const course = coursesById.get(s.courseId.toString());
    return {
      id: s._id.toString(),
      session_date: s.sessionDate,
      start_time: s.startTime,
      status: s.status,
      code: course ? course.code : null,
      name: course ? course.name : null,
    };
  });

  return { courses, todaySessions };
};

const getStudentDashboard = async (userId) => {
  const student = await Student.findOne({ userId }).lean();
  if (!student) throw Object.assign(new Error('Student not found'), { statusCode: 404 });

  const enrollments = await CourseStudent.find({ studentId: student._id }).lean();
  const courseIds = enrollments.map((e) => e.courseId);
  const courseDocs = await Course.find({ _id: { $in: courseIds }, isActive: true }).lean();

  const lecturerIds = courseDocs.map((c) => c.lecturerId).filter(Boolean);
  const lecturers = await Lecturer.find({ _id: { $in: lecturerIds } }).lean();
  const lecturersById = new Map(lecturers.map((l) => [l._id.toString(), l]));
  const lecturerUsers = await User.find({ _id: { $in: lecturers.map((l) => l.userId) } }).select('name').lean();
  const userNameById = new Map(lecturerUsers.map((u) => [u._id.toString(), u.name]));

  const sessions = await AttendanceSession.find({ courseId: { $in: courseDocs.map((c) => c._id) } }).lean();
  const sessionsByCourse = new Map();
  for (const s of sessions) {
    const key = s.courseId.toString();
    if (!sessionsByCourse.has(key)) sessionsByCourse.set(key, []);
    sessionsByCourse.get(key).push(s._id);
  }
  const allSessionIds = sessions.map((s) => s._id);
  const myRecords = await Attendance.find({ studentId: student._id, sessionId: { $in: allSessionIds } }).lean();
  const sessionToCourse = new Map(sessions.map((s) => [s._id.toString(), s.courseId.toString()]));
  const attendedByCourse = new Map();
  for (const a of myRecords) {
    if (a.status !== 'present') continue;
    const courseId = sessionToCourse.get(a.sessionId.toString());
    attendedByCourse.set(courseId, (attendedByCourse.get(courseId) || 0) + 1);
  }

  const courses = courseDocs.map((c) => {
    const key = c._id.toString();
    const lecturer = c.lecturerId ? lecturersById.get(c.lecturerId.toString()) : null;
    const sessionsHeld = (sessionsByCourse.get(key) || []).length;
    const attended = attendedByCourse.get(key) || 0;
    return {
      id: c._id.toString(),
      code: c.code,
      name: c.name,
      lecturer: lecturer ? userNameById.get(lecturer.userId.toString()) : null,
      sessions_held: sessionsHeld,
      attended,
      percentage: sessionsHeld ? round2((attended * 100) / sessionsHeld) : null,
    };
  });

  const coursesById = new Map(courseDocs.map((c) => [c._id.toString(), c]));
  const recentAttendance = myRecords
    .map((a) => {
      const session = sessions.find((s) => s._id.toString() === a.sessionId.toString());
      const course = session ? coursesById.get(session.courseId.toString()) : null;
      if (!session || !course) return null;
      return {
        status: a.status,
        marked_at: a.markedAt,
        session_date: session.sessionDate,
        code: course.code,
        course: course.name,
        _sortKey: `${session.sessionDate} ${a.markedAt?.toISOString?.() || ''}`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a._sortKey < b._sortKey ? 1 : -1))
    .slice(0, 10)
    .map(({ _sortKey, ...rest }) => rest);

  const unreadNotifications = await Notification.countDocuments({ recipientId: userId, isRead: false });

  return { courses, recentAttendance, unreadNotifications };
};

module.exports = { getAdminDashboard, getLecturerDashboard, getStudentDashboard };
