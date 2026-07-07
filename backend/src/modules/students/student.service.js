const bcrypt = require('bcryptjs');
const { withTransaction } = require('../../config/database');
const { User, Student, Course, CourseStudent, AttendanceSession, Attendance } = require('../../models');
const { getPagination, buildPaginationMeta, generateToken, escapeRegExp } = require('../../utils/helpers');
const { sendEmail, templates } = require('../../utils/email');
const logger = require('../../utils/logger');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

const getAllStudents = async ({ page, limit, search, department, course_id }) => {
  const { page: p, limit: l, offset } = getPagination(page, limit);

  const studentFilter = {};
  if (department) studentFilter.department = department;
  if (course_id) {
    const enrolledIds = await CourseStudent.find({ courseId: course_id }).distinct('studentId');
    studentFilter._id = { $in: enrolledIds };
  }

  const students = await Student.find(studentFilter).lean();
  const userIds = students.map((s) => s.userId);
  const users = await User.find({ _id: { $in: userIds }, isActive: true }).lean();
  const usersById = new Map(users.map((u) => [u._id.toString(), u]));

  let combined = students
    .filter((s) => usersById.has(s.userId.toString()))
    .map((s) => ({ student: s, user: usersById.get(s.userId.toString()) }));

  if (search) {
    const re = new RegExp(escapeRegExp(search), 'i');
    combined = combined.filter(({ student, user }) => re.test(user.name) || re.test(student.studentId) || re.test(user.email));
  }

  combined.sort((a, b) => a.user.name.localeCompare(b.user.name));

  const total = combined.length;
  const pageItems = combined.slice(offset, offset + l);

  const attendanceByStudent = new Map();
  if (course_id) {
    const sessionIds = await AttendanceSession.find({ courseId: course_id }).distinct('_id');
    const totalSessions = sessionIds.length;
    const records = await Attendance.find({ sessionId: { $in: sessionIds }, status: 'present' }).lean();
    const presentCountByStudent = new Map();
    for (const r of records) {
      const key = r.studentId.toString();
      presentCountByStudent.set(key, (presentCountByStudent.get(key) || 0) + 1);
    }
    for (const { student } of pageItems) {
      const key = student._id.toString();
      const present = presentCountByStudent.get(key) || 0;
      attendanceByStudent.set(key, totalSessions ? Math.round(((present * 100) / totalSessions) * 100) / 100 : null);
    }
  }

  const result = pageItems.map(({ student, user }) => ({
    id: student._id.toString(),
    student_id: student.studentId,
    department: student.department,
    year_of_study: student.yearOfStudy,
    gpa: student.gpa,
    user_id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    created_at: user.createdAt,
    last_login: user.lastLogin,
    ...(course_id ? { attendance_percentage: attendanceByStudent.get(student._id.toString()) ?? null } : {}),
  }));

  return { students: result, pagination: buildPaginationMeta(total, p, l) };
};

const getStudentById = async (id) => {
  const student = await Student.findById(id).lean();
  if (!student) throw Object.assign(new Error('Student not found'), { statusCode: 404 });

  const user = await User.findById(student.userId).lean();
  if (!user) throw Object.assign(new Error('Student not found'), { statusCode: 404 });

  const courseIds = await CourseStudent.find({ studentId: id }).distinct('courseId');
  const courses = await Course.find({ _id: { $in: courseIds } }).select('code name creditHours').lean();

  return {
    id: student._id.toString(),
    student_id: student.studentId,
    department: student.department,
    year_of_study: student.yearOfStudy,
    gpa: student.gpa,
    user_id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    is_active: user.isActive,
    created_at: user.createdAt,
    courses: courses.map((c) => ({ id: c._id.toString(), code: c.code, name: c.name, credit_hours: c.creditHours })),
  };
};

const createStudent = async ({ name, email, studentId, department, yearOfStudy, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error('Email already in use'), { statusCode: 409 });

  const existingId = await Student.findOne({ studentId });
  if (existingId) throw Object.assign(new Error('Student ID already exists'), { statusCode: 409 });

  const tempPassword = generateToken(8);
  const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

  const { id, userId } = await withTransaction(async (session) => {
    const [user] = await User.create(
      [{ name, email, passwordHash, role: 'student', phone: phone || null, isEmailVerified: true, isActive: true }],
      { session }
    );
    const [student] = await Student.create(
      [{ userId: user._id, studentId, department: department || null, yearOfStudy: yearOfStudy || null }],
      { session }
    );
    return { id: student._id.toString(), userId: user._id.toString() };
  });

  await sendEmail({ to: email, ...templates.welcomeStudent(name, studentId, tempPassword) }).catch((e) =>
    logger.warn('Welcome email failed', { error: e.message })
  );

  return { id, userId, studentId, message: 'Student created successfully' };
};

const updateStudent = async (id, { name, department, yearOfStudy, phone, gpa }) => {
  const student = await Student.findById(id);
  if (!student) throw Object.assign(new Error('Student not found'), { statusCode: 404 });

  await User.updateOne({ _id: student.userId }, { name, phone: phone || null });
  await Student.updateOne(
    { _id: id },
    { department: department || null, yearOfStudy: yearOfStudy || null, gpa: gpa || null }
  );
};

const deleteStudent = async (id) => {
  const student = await Student.findById(id);
  if (!student) throw Object.assign(new Error('Student not found'), { statusCode: 404 });
  // Soft delete
  await User.updateOne({ _id: student.userId }, { isActive: false, deletedAt: new Date() });
};

const enrollInCourse = async (studentId, courseId) => {
  const existing = await CourseStudent.findOne({ studentId, courseId });
  if (existing) throw Object.assign(new Error('Student already enrolled in this course'), { statusCode: 409 });
  await CourseStudent.create({ studentId, courseId, enrolledAt: new Date() });
};

const getAttendanceSummary = async (studentId) => {
  const courseIds = await CourseStudent.find({ studentId }).distinct('courseId');
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();

  const sessions = await AttendanceSession.find({ courseId: { $in: courseIds } }).select('_id courseId').lean();
  const sessionToCourse = new Map(sessions.map((s) => [s._id.toString(), s.courseId.toString()]));
  const sessionIds = sessions.map((s) => s._id);

  const records = await Attendance.find({ studentId, sessionId: { $in: sessionIds } }).lean();

  const statsByCourse = new Map();
  for (const r of records) {
    const courseId = sessionToCourse.get(r.sessionId.toString());
    if (!statsByCourse.has(courseId)) statsByCourse.set(courseId, { total: 0, present: 0 });
    const stat = statsByCourse.get(courseId);
    stat.total += 1;
    if (r.status === 'present') stat.present += 1;
  }

  return courses.map((c) => {
    const stat = statsByCourse.get(c._id.toString()) || { total: 0, present: 0 };
    return {
      code: c.code,
      course: c.name,
      total_classes: stat.total,
      present_count: stat.present,
      attendance_percentage: stat.total ? Math.round(((stat.present * 100) / stat.total) * 100) / 100 : null,
    };
  });
};

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent, enrollInCourse, getAttendanceSummary };
