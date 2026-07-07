const attendanceService = require('./attendance.service');
const { Lecturer } = require('../../models');
const { success, created } = require('../../utils/response');

const startSession = async (req, res, next) => {
  try {
    const lecturer = await Lecturer.findOne({ userId: req.user.id }).lean();
    if (!lecturer) return next(Object.assign(new Error('Lecturer record not found'), { statusCode: 404 }));

    const result = await attendanceService.startSession({ ...req.body, lecturerId: lecturer._id.toString() });
    return created(res, result, 'Attendance session started');
  } catch (err) { next(err); }
};

const refreshQR = async (req, res, next) => {
  try {
    const lecturer = await Lecturer.findOne({ userId: req.user.id }).lean();
    const result = await attendanceService.refreshQR(req.params.sessionId, lecturer._id.toString());
    return success(res, result, 'QR code refreshed');
  } catch (err) { next(err); }
};

const markAttendance = async (req, res, next) => {
  try {
    const result = await attendanceService.markAttendance({ ...req.body, studentUserId: req.user.id });
    return success(res, result, 'Attendance marked');
  } catch (err) { next(err); }
};

const markByLecturer = async (req, res, next) => {
  try {
    const lecturer = await Lecturer.findOne({ userId: req.user.id }).lean();
    if (!lecturer) return next(Object.assign(new Error('Lecturer record not found'), { statusCode: 404 }));

    await attendanceService.markByLecturer(req.params.sessionId, lecturer._id.toString(), req.body.studentId, req.body.status, req.user.id);
    return success(res, null, 'Attendance updated');
  } catch (err) { next(err); }
};

const closeSession = async (req, res, next) => {
  try {
    const lecturer = await Lecturer.findOne({ userId: req.user.id }).lean();
    await attendanceService.closeSession(req.params.sessionId, lecturer._id.toString());
    return success(res, null, 'Session closed. Absent records generated.');
  } catch (err) { next(err); }
};

const editAttendance = async (req, res, next) => {
  try {
    await attendanceService.editAttendance(req.params.id, req.body, req.user.id);
    return success(res, null, 'Attendance updated');
  } catch (err) { next(err); }
};

const getSessionAttendance = async (req, res, next) => {
  try {
    const lecturer = await Lecturer.findOne({ userId: req.user.id }).lean();
    const result = await attendanceService.getSessionAttendance(req.params.sessionId, lecturer._id.toString());
    return success(res, result, 'Session attendance retrieved');
  } catch (err) { next(err); }
};

const getStudentHistory = async (req, res, next) => {
  try {
    const { records, pagination } = await attendanceService.getStudentAttendanceHistory(req.params.userId || req.user.id, req.query);
    return success(res, { records, pagination }, 'Attendance history retrieved');
  } catch (err) { next(err); }
};

module.exports = { startSession, refreshQR, markAttendance, markByLecturer, closeSession, editAttendance, getSessionAttendance, getStudentHistory };
