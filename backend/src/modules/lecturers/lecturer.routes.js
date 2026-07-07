const router = require('express').Router();
const ctrl = require('./lecturer.controller');
const { authenticate } = require('../../middleware/auth');
const { adminOnly, adminOrLecturer } = require('../../middleware/rbac');
const { auditLog } = require('../../middleware/audit');
const { body, param, query } = require('express-validator');
const validate = require('../../middleware/validate');

const createRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('staffId').trim().notEmpty().withMessage('Staff ID is required'),
  body('department').optional().trim(),
  body('specialisation').optional().trim(),
  body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Invalid phone number'),
];

const updateRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('department').optional().trim(),
  body('specialisation').optional().trim(),
  body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Invalid phone number'),
];

router.use(authenticate);

router.get('/', adminOrLecturer,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate,
  ctrl.getAllLecturers
);
router.get('/:id', adminOrLecturer, param('id').isInt().toInt(), validate, ctrl.getLecturerById);
router.post('/', adminOnly, auditLog('CREATE_LECTURER'), createRules, validate, ctrl.createLecturer);
router.put('/:id', adminOnly, param('id').isInt().toInt(), updateRules, validate, auditLog('UPDATE_LECTURER'), ctrl.updateLecturer);
router.delete('/:id', adminOnly, param('id').isInt().toInt(), validate, auditLog('DELETE_LECTURER'), ctrl.deleteLecturer);
router.post('/:id/assign-course', adminOnly, param('id').isInt().toInt(), [body('courseId').isInt().toInt()], validate, auditLog('ASSIGN_LECTURER_COURSE'), ctrl.assignToCourse);

module.exports = router;
