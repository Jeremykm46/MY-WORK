const router = require('express').Router();
const ctrl = require('./report.controller');
const { authenticate } = require('../../middleware/auth');
const { adminOrLecturer, adminOnly } = require('../../middleware/rbac');
const { reportLimiter } = require('../../middleware/rateLimiter');
const { param, query } = require('express-validator');
const validate = require('../../middleware/validate');

router.use(authenticate, adminOrLecturer, reportLimiter);

router.get('/records',
  query('from').optional().isISO8601().withMessage('Invalid from date'),
  query('to').optional().isISO8601().withMessage('Invalid to date'),
  query('courseId').optional().isInt().toInt(),
  validate,
  ctrl.getRecords
);
router.get('/daily', query('date').optional().isISO8601().withMessage('Invalid date'), validate, ctrl.getDaily);
router.get('/weekly',
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  validate,
  ctrl.getWeekly
);
router.get('/monthly',
  query('month').optional().isInt({ min: 1, max: 12 }).toInt(),
  query('year').optional().isInt({ min: 1900 }).toInt(),
  validate,
  ctrl.getMonthly
);
router.get('/student/:studentId', param('studentId').isInt().toInt(), validate, ctrl.getStudentReport);
router.get('/low-attendance', query('threshold').optional().isInt({ min: 0, max: 100 }).toInt(), validate, ctrl.getLowAttendance);

// Export routes — :type can be 'daily', 'weekly', 'monthly', 'student', 'low-attendance'
const reportTypeRules = [param('type').isIn(['daily', 'weekly', 'monthly', 'student', 'low-attendance'])];
router.get('/export/pdf/:type', reportTypeRules, validate, ctrl.exportPDF);
router.get('/export/excel/:type', reportTypeRules, validate, ctrl.exportExcel);
router.get('/export/csv/:type', reportTypeRules, validate, ctrl.exportCSV);

module.exports = router;
