const reportService = require('./report.service');
const { Lecturer } = require('../../models');
const { success } = require('../../utils/response');

const getRecords = async (req, res, next) => {
  try {
    const params = { ...req.query };
    if (req.user.role === 'lecturer') {
      const lecturer = await Lecturer.findOne({ userId: req.user.id }).lean();
      if (!lecturer) return next(Object.assign(new Error('Lecturer record not found'), { statusCode: 404 }));
      params.lecturerId = lecturer._id.toString();
    }
    const data = await reportService.getSessionRecords(params);
    return success(res, data, 'Attendance records retrieved');
  } catch (err) { next(err); }
};

const getDaily = async (req, res, next) => {
  try {
    const data = await reportService.getDailyReport(req.query.date);
    return success(res, data, 'Daily report retrieved');
  } catch (err) { next(err); }
};

const getWeekly = async (req, res, next) => {
  try {
    const data = await reportService.getWeeklyReport(req.query);
    return success(res, data, 'Weekly report retrieved');
  } catch (err) { next(err); }
};

const getMonthly = async (req, res, next) => {
  try {
    const data = await reportService.getMonthlyReport(req.query);
    return success(res, data, 'Monthly report retrieved');
  } catch (err) { next(err); }
};

const getStudentReport = async (req, res, next) => {
  try {
    const data = await reportService.getStudentReport(req.params.studentId);
    return success(res, data, 'Student report retrieved');
  } catch (err) { next(err); }
};

const getLowAttendance = async (req, res, next) => {
  try {
    const data = await reportService.getLowAttendanceStudents(req.query.threshold);
    return success(res, data, 'Low attendance students retrieved');
  } catch (err) { next(err); }
};

const exportPDF = (req, res, next) => {
  reportService.exportPDF(req.params.type, req.query, res).catch(next);
};

const exportExcel = (req, res, next) => {
  reportService.exportExcel(req.params.type, req.query, res).catch(next);
};

const exportCSV = (req, res, next) => {
  reportService.exportCSV(req.params.type, req.query, res).catch(next);
};

module.exports = { getRecords, getDaily, getWeekly, getMonthly, getStudentReport, getLowAttendance, exportPDF, exportExcel, exportCSV };
