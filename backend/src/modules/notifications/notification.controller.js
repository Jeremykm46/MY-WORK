const notificationService = require('./notification.service');
const { success, created, paginated } = require('../../utils/response');

const sendNotification = async (req, res, next) => {
  try {
    const result = await notificationService.sendNotification({ ...req.body, senderId: req.user.id });
    return created(res, result, 'Notification sent');
  } catch (err) { next(err); }
};

const getNotifications = async (req, res, next) => {
  try {
    const { notifications, pagination } = await notificationService.getNotifications(req.user.id, req.query);
    return paginated(res, notifications, pagination, 'Notifications retrieved');
  } catch (err) { next(err); }
};

const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user.id);
    return success(res, null, 'Notification deleted');
  } catch (err) { next(err); }
};

const sendAttendanceWarnings = async (req, res, next) => {
  try {
    const result = await notificationService.sendAttendanceWarnings(req.body.threshold);
    return success(res, result, 'Attendance warnings sent');
  } catch (err) { next(err); }
};

module.exports = { sendNotification, getNotifications, deleteNotification, sendAttendanceWarnings };
