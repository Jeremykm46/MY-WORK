const { Course, Lecturer, User, CourseStudent, Student, Timetable } = require('../../models');
const { getPagination, buildPaginationMeta, escapeRegExp } = require('../../utils/helpers');

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getAllCourses = async ({ page, limit, search, lecturer_id, department }) => {
  const { page: p, limit: l, offset } = getPagination(page, limit);

  const filter = { isActive: true };
  if (lecturer_id) filter.lecturerId = lecturer_id;
  if (department) filter.department = department;
  if (search) {
    const re = new RegExp(escapeRegExp(search), 'i');
    filter.$or = [{ name: re }, { code: re }];
  }

  const total = await Course.countDocuments(filter);
  const courses = await Course.find(filter).sort({ code: 1 }).skip(offset).limit(l).lean();

  const lecturerIds = courses.map((c) => c.lecturerId).filter(Boolean);
  const lecturers = await Lecturer.find({ _id: { $in: lecturerIds } }).lean();
  const lecturersById = new Map(lecturers.map((lec) => [lec._id.toString(), lec]));
  const lecturerUsers = await User.find({ _id: { $in: lecturers.map((lec) => lec.userId) } })
    .select('name')
    .lean();
  const userNameById = new Map(lecturerUsers.map((u) => [u._id.toString(), u.name]));

  const courseIds = courses.map((c) => c._id);
  const enrollmentCounts = await CourseStudent.aggregate([
    { $match: { courseId: { $in: courseIds } } },
    { $group: { _id: '$courseId', count: { $sum: 1 } } },
  ]);
  const enrollmentByCourse = new Map(enrollmentCounts.map((e) => [e._id.toString(), e.count]));

  const result = courses.map((c) => {
    const lecturer = c.lecturerId ? lecturersById.get(c.lecturerId.toString()) : null;
    return {
      id: c._id.toString(),
      code: c.code,
      name: c.name,
      description: c.description,
      credit_hours: c.creditHours,
      department: c.department,
      semester: c.semester,
      academic_year: c.academicYear,
      lecturer_name: lecturer ? userNameById.get(lecturer.userId.toString()) : null,
      lecturer_id: lecturer ? lecturer._id.toString() : null,
      staff_id: lecturer ? lecturer.staffId : null,
      enrolled_students: enrollmentByCourse.get(c._id.toString()) || 0,
    };
  });

  return { courses: result, pagination: buildPaginationMeta(total, p, l) };
};

const getCourseById = async (id) => {
  const course = await Course.findOne({ _id: id, isActive: true }).lean();
  if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });

  let lecturerName = null;
  if (course.lecturerId) {
    const lecturer = await Lecturer.findById(course.lecturerId).lean();
    if (lecturer) {
      const lecturerUser = await User.findById(lecturer.userId).select('name').lean();
      lecturerName = lecturerUser ? lecturerUser.name : null;
    }
  }

  const enrollments = await CourseStudent.find({ courseId: id }).lean();
  const studentIds = enrollments.map((e) => e.studentId);
  const students = await Student.find({ _id: { $in: studentIds } }).lean();
  const studentUsers = await User.find({ _id: { $in: students.map((s) => s.userId) }, isActive: true })
    .select('name email')
    .lean();
  const studentUsersById = new Map(studentUsers.map((u) => [u._id.toString(), u]));
  const studentList = students
    .filter((s) => studentUsersById.has(s.userId.toString()))
    .map((s) => {
      const u = studentUsersById.get(s.userId.toString());
      return { id: s._id.toString(), student_id: s.studentId, name: u.name, email: u.email };
    });

  const timetables = await Timetable.find({ courseId: id }).lean();
  const schedule = timetables
    .sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek))
    .map((t) => ({
      id: t._id.toString(),
      day_of_week: t.dayOfWeek,
      start_time: t.startTime,
      end_time: t.endTime,
      room: t.room,
      class_type: t.classType,
    }));

  return {
    id: course._id.toString(),
    code: course.code,
    name: course.name,
    description: course.description,
    credit_hours: course.creditHours,
    department: course.department,
    semester: course.semester,
    academic_year: course.academicYear,
    lecturer_name: lecturerName,
    lecturer_id: course.lecturerId ? course.lecturerId.toString() : null,
    students: studentList,
    schedule,
  };
};

const createCourse = async ({ code, name, description, creditHours, department, semester, academicYear, lecturerId }) => {
  const existing = await Course.findOne({ code, academicYear, semester });
  if (existing) throw Object.assign(new Error('Course code already exists for this academic year and semester'), { statusCode: 409 });

  const course = await Course.create({
    code,
    name,
    description: description || null,
    creditHours: creditHours || 3,
    department: department || null,
    semester,
    academicYear,
    lecturerId: lecturerId || null,
  });
  return { id: course._id.toString() };
};

const updateCourse = async (id, data) => {
  const course = await Course.findOne({ _id: id, isActive: true });
  if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });

  const { name, description, creditHours, department, semester, academicYear, lecturerId } = data;
  await Course.updateOne(
    { _id: id },
    {
      name,
      description: description || null,
      creditHours,
      department: department || null,
      semester,
      academicYear,
      lecturerId: lecturerId || null,
    }
  );
};

const deleteCourse = async (id) => {
  const course = await Course.findOne({ _id: id, isActive: true });
  if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });
  await Course.updateOne({ _id: id }, { isActive: false, deletedAt: new Date() });
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
