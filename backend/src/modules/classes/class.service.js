const { Timetable, Course, Lecturer, User } = require('../../models');
const { getPagination, buildPaginationMeta } = require('../../utils/helpers');

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getAllClasses = async ({ page, limit, course_id, day, lecturer_id }) => {
  const { page: p, limit: l, offset } = getPagination(page, limit);

  const filter = {};
  if (course_id) filter.courseId = course_id;
  if (day) filter.dayOfWeek = day;

  const timetables = await Timetable.find(filter).lean();
  const courseIds = [...new Set(timetables.map((t) => t.courseId.toString()))];
  const courses = await Course.find({ _id: { $in: courseIds } }).lean();
  const coursesById = new Map(courses.map((c) => [c._id.toString(), c]));

  const lecturerIds = courses.map((c) => c.lecturerId).filter(Boolean);
  const lecturers = await Lecturer.find({ _id: { $in: lecturerIds } }).lean();
  const lecturersById = new Map(lecturers.map((lec) => [lec._id.toString(), lec]));
  const lecturerUsers = await User.find({ _id: { $in: lecturers.map((lec) => lec.userId) } })
    .select('name')
    .lean();
  const userNameById = new Map(lecturerUsers.map((u) => [u._id.toString(), u.name]));

  let combined = timetables
    .map((t) => ({ t, course: coursesById.get(t.courseId.toString()) }))
    .filter(({ course }) => course);

  if (lecturer_id) {
    combined = combined.filter(({ course }) => course.lecturerId && course.lecturerId.toString() === lecturer_id);
  }

  combined.sort((a, b) => {
    const dayDiff = DAY_ORDER.indexOf(a.t.dayOfWeek) - DAY_ORDER.indexOf(b.t.dayOfWeek);
    if (dayDiff !== 0) return dayDiff;
    return a.t.startTime.localeCompare(b.t.startTime);
  });

  const total = combined.length;
  const pageItems = combined.slice(offset, offset + l);

  const classes = pageItems.map(({ t, course }) => {
    const lecturer = course.lecturerId ? lecturersById.get(course.lecturerId.toString()) : null;
    return {
      id: t._id.toString(),
      day_of_week: t.dayOfWeek,
      start_time: t.startTime,
      end_time: t.endTime,
      room: t.room,
      class_type: t.classType,
      course_id: course._id.toString(),
      course_code: course.code,
      course_name: course.name,
      lecturer_name: lecturer ? userNameById.get(lecturer.userId.toString()) : null,
    };
  });

  return { classes, pagination: buildPaginationMeta(total, p, l) };
};

const createClass = async ({ courseId, dayOfWeek, startTime, endTime, room, classType }) => {
  // Conflict check: same room, same day, overlapping time
  const sameDayRoom = await Timetable.find({ room, dayOfWeek }).lean();
  const conflict = sameDayRoom.some((t) => !(t.endTime <= startTime || t.startTime >= endTime));
  if (conflict) throw Object.assign(new Error('Room already booked for this time slot'), { statusCode: 409 });

  const timetable = await Timetable.create({
    courseId,
    dayOfWeek,
    startTime,
    endTime,
    room,
    classType: classType || 'lecture',
  });
  return { id: timetable._id.toString() };
};

const deleteClass = async (id) => {
  const cls = await Timetable.findById(id);
  if (!cls) throw Object.assign(new Error('Class not found'), { statusCode: 404 });
  await Timetable.deleteOne({ _id: id });
};

module.exports = { getAllClasses, createClass, deleteClass };
