const router = require('express').Router();
const ctrl = require('./class.controller');
const { authenticate } = require('../../middleware/auth');
const { adminOnly, adminOrLecturer, allRoles } = require('../../middleware/rbac');
const { auditLog } = require('../../middleware/audit');
const { body, param, query } = require('express-validator');
const validate = require('../../middleware/validate');

const classRules = [
  body('courseId').isInt().toInt(),
  body('dayOfWeek').trim().notEmpty().withMessage('Day of week is required'),
  body('startTime').trim().notEmpty().withMessage('Start time is required'),
  body('endTime').trim().notEmpty().withMessage('End time is required'),
  body('room').trim().notEmpty().withMessage('Room is required'),
  body('classType').optional().isIn(['lecture', 'tutorial', 'lab']).withMessage('Invalid class type'),
];

router.use(authenticate);

router.get('/', allRoles,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('course_id').optional().isInt().toInt(),
  query('lecturer_id').optional().isInt().toInt(),
  query('day').optional().trim(),
  validate,
  ctrl.getAllClasses
);
router.post('/', adminOrLecturer, auditLog('CREATE_CLASS'), classRules, validate, ctrl.createClass);
router.delete('/:id', adminOnly, param('id').isInt().toInt(), validate, auditLog('DELETE_CLASS'), ctrl.deleteClass);

module.exports = router;
