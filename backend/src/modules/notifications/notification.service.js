const { User, Student, CourseStudent, Notification, Course, AttendanceSession, Attendance } = require('../../models');
const { sendEmail } = require('../../utils/email');
const { emitToUser, emitToRole } = require('../../config/socket');
const { getPagination, buildPaginationMeta } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const sendNotification = async ({ senderId, recipientId, recipientRole, title, message, type, channel, courseId }) => {
  // Determine recipients
  let recipientIds = [];

  if (recipientId) {
    recipientIds = [recipientId];
  } else if (recipientRole) {
    const users = await User.find({ role: recipientRole, isActive: true }).select('_id').lean();
    recipientIds = users.map((u) => u._id.toString());
  } else if (courseId) {
    const studentIds = await CourseStudent.find({ courseId }).distinct('studentId');
    const students = await Student.find({ _id: { $in: studentIds } }).select('userId').lean();
    const studentUsers = await User.find({ _id: { $in: students.map((s) => s.userId) }, isActive: true })
      .select('_id')
      .lean();
    recipientIds = studentUsers.map((u) => u._id.toString());
  }

  if (!recipientIds.length) throw Object.assign(new Error('No valid recipients found'), { statusCode: 400 });

  try {
    await Notification.insertMany(
      recipientIds.map((rid) => ({ senderId: senderId || null, recipientId: rid, title, message, type: type || 'info', isRead: false }))
    );
  } catch (err) {
    logger.error('Bulk notifications insert failed', { error: err.message, recipients: recipientIds.length });
    throw err;
  }

  // Real-time delivery
  for (const rid of recipientIds) {
    emitToUser(rid, 'notification:new', { title, message, type });
  }
  if (recipientRole) emitToRole(recipientRole, 'notification:broadcast', { title, message, type });

  // Email channel
  if (channel === 'email' || channel === 'all') {
    const users = await User.find({ _id: { $in: recipientIds } }).select('email name').lean();
    for (const user of users) {
      sendEmail({ to: user.email, subject: title, html: `<p>Dear ${user.name},</p><p>${message}</p>` }).catch((e) =>
        logger.warn('Notification email failed', { error: e.message, to: user.email })
      );
    }
  }

  return { sent: recipientIds.length };
};

const getNotifications = async (userId, { page, limit, unreadOnly }) => {
  const { page: p, limit: l, offset } = getPagination(page, limit);

  const filter = { recipientId: userId };
  if (unreadOnly === 'true') filter.isRead = false;

  const [total, notificationDocs] = await Promise.all([
    Notification.countDocuments(filter),
    Notification.find(filter).sort({ createdAt: -1 }).skip(offset).limit(l).lean(),
  ]);

  const senderIds = notificationDocs.map((n) => n.senderId).filter(Boolean);
  const senders = await User.find({ _id: { $in: senderIds } }).select('name').lean();
  const senderNameById = new Map(senders.map((u) => [u._id.toString(), u.name]));

  const notifications = notificationDocs.map((n) => ({
    id: n._id.toString(),
    title: n.title,
    message: n.message,
    type: n.type,
    is_read: n.isRead,
    created_at: n.createdAt,
    sender_name: n.senderId ? senderNameById.get(n.senderId.toString()) || null : null,
  }));

  // Mark fetched as read
  await Notification.updateMany({ recipientId: userId, isRead: false }, { isRead: true }).catch(() => {});

  return { notifications, pagination: buildPaginationMeta(total, p, l) };
};

const deleteNotification = async (id, userId) => {
  const notif = await Notification.findOne({ _id: id, recipientId: userId });
  if (!notif) throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
  await Notification.deleteOne({ _id: id });
};

const sendAttendanceWarnings = async (threshold = 75) => {
  const enrollments = await CourseStudent.find().lean();
  const students = await Student.find({ _id: { $in: enrollments.map((e) => e.studentId) } }).lean();
  const studentsById = new Map(students.map((s) => [s._id.toString(), s]));
  const activeUsers = await User.find({ _id: { $in: students.map((s) => s.userId) }, isActive: true })
    .select('name email')
    .lean();
  const activeUsersById = new Map(activeUsers.map((u) => [u._id.toString(), u]));

  const courses = await Course.find({ _id: { $in: enrollments.map((e) => e.courseId) } }).lean();
  const coursesById = new Map(courses.map((c) => [c._id.toString(), c]));

  const sessions = await AttendanceSession.find({ courseId: { $in: courses.map((c) => c._id) } }).select('_id courseId').lean();
  const sessionToCourse = new Map(sessions.map((s) => [s._id.toString(), s.courseId.toString()]));

  const attendanceRecords = await Attendance.find({ sessionId: { $in: sessions.map((s) => s._id) } }).lean();

  const pairStats = new Map();
  const enrolledPairs = new Set(enrollments.map((e) => `${e.studentId.toString()}:${e.courseId.toString()}`));
  for (const a of attendanceRecords) {
    const courseId = sessionToCourse.get(a.sessionId.toString());
    const key = `${a.studentId.toString()}:${courseId}`;
    if (!enrolledPairs.has(key)) continue;
    if (!pairStats.has(key)) pairStats.set(key, { total: 0, present: 0 });
    const stat = pairStats.get(key);
    stat.total += 1;
    if (a.status === 'present') stat.present += 1;
  }

  const atRisk = [];
  for (const [key, stat] of pairStats) {
    if (stat.total === 0) continue;
    const percentage = (stat.present * 100) / stat.total;
    if (percentage >= threshold) continue;
    const [studentId, courseId] = key.split(':');
    const student = studentsById.get(studentId);
    const user = student ? activeUsersById.get(student.userId.toString()) : null;
    const course = coursesById.get(courseId);
    if (!user || !course) continue;
    atRisk.push({ user_id: user._id.toString(), name: user.name, email: user.email, course: course.name, course_id: courseId, percentage: Math.round(percentage * 100) / 100 });
  }

  for (const student of atRisk) {
    await sendNotification({
      senderId: null,
      recipientId: student.user_id,
      title: `⚠️ Low Attendance Warning — ${student.course}`,
      message: `Your attendance in ${student.course} is ${student.percentage}%. Minimum required is 75%. Please attend classes.`,
      type: 'warning',
      channel: 'email',
    });
  }

  return { warned: atRisk.length };
};

module.exports = { sendNotification, getNotifications, deleteNotification, sendAttendanceWarnings };
