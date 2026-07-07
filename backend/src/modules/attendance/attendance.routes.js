const router = require('express').Router();
const ctrl = require('./attendance.controller');
const { authenticate } = require('../../middleware/auth');
const { adminOrLecturer, lecturerOnly, studentOnly, allRoles } = require('../../middleware/rbac');
const { auditLog } = require('../../middleware/audit');
const { body, param, query } = require('express-validator');
const validate = require('../../middleware/validate');

router.use(authenticate);

// Lecturer — session management
router.post('/start-session', adminOrLecturer, auditLog('START_SESSION'),
  [
    body('courseId').isInt().toInt(),
    body('sessionDate').isISO8601().withMessage('Valid session date is required'),
    body('startTime').trim().notEmpty().withMessage('Start time is required'),
  ],
  validate, ctrl.startSession
);
router.post('/session/:sessionId/close', adminOrLecturer, param('sessionId').isInt().toInt(), validate, auditLog('CLOSE_SESSION'), ctrl.closeSession);
router.get('/session/:sessionId/qr', adminOrLecturer, param('sessionId').isInt().toInt(), validate, ctrl.refreshQR);
router.get('/session/:sessionId', adminOrLecturer, param('sessionId').isInt().toInt(), validate, ctrl.getSessionAttendance);
router.post('/session/:sessionId/mark', adminOrLecturer, auditLog('LECTURER_MARK_ATTENDANCE'),
  [
    param('sessionId').isInt().toInt(),
    body('studentId').isInt().toInt(),
    body('status').isIn(['present', 'absent', 'late', 'excused']),
  ],
  validate, ctrl.markByLecturer
);

// Student — mark attendance
router.post('/mark', studentOnly, auditLog('MARK_ATTENDANCE'),
  [body('sessionId').isInt().toInt(), body('method').isIn(['qr', 'manual', 'gps'])],
  validate, ctrl.markAttendance
);

// Edit attendance (admin or lecturer)
router.put('/:id', adminOrLecturer, auditLog('EDIT_ATTENDANCE'),
  [param('id').isInt().toInt(), body('status').isIn(['present', 'absent', 'late', 'excused'])],
  validate, ctrl.editAttendance
);

// History
router.get('/history', allRoles,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate,
  ctrl.getStudentHistory
);
router.get('/student/:userId', adminOrLecturer, param('userId').isInt().toInt(), validate, ctrl.getStudentHistory);

module.exports = router;
