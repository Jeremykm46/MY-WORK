const router = require('express').Router();
const ctrl = require('./student.controller');
const { authenticate } = require('../../middleware/auth');
const { adminOnly, adminOrLecturer } = require('../../middleware/rbac');
const { auditLog } = require('../../middleware/audit');
const { body, param, query } = require('express-validator');
const validate = require('../../middleware/validate');

const createRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('studentId').trim().notEmpty().withMessage('Student ID is required'),
];

const updateRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('department').optional().trim(),
  body('yearOfStudy').optional().isInt({ min: 1 }).toInt(),
  body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Invalid phone number'),
];

router.use(authenticate);

router.get('/', adminOrLecturer,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().trim().isString().withMessage('Search must be a string'),
  query('department').optional().trim().isString().withMessage('Department must be a string'),
  query('course_id').optional().isInt().toInt(),
  validate,
  ctrl.getAllStudents
);
router.get('/:id', adminOrLecturer, param('id').isInt().toInt(), validate, ctrl.getStudentById);
router.get('/:id/attendance', adminOrLecturer, param('id').isInt().toInt(), validate, ctrl.getAttendanceSummary);
router.post('/', adminOnly, createRules, validate, auditLog('CREATE_STUDENT'), ctrl.createStudent);
router.put('/:id', adminOnly, param('id').isInt().toInt(), updateRules, validate, auditLog('UPDATE_STUDENT'), ctrl.updateStudent);
router.delete('/:id', adminOnly, param('id').isInt().toInt(), validate, auditLog('DELETE_STUDENT'), ctrl.deleteStudent);
router.post('/:id/enroll', adminOnly,
  param('id').isInt().toInt(),
  body('courseId').isInt().toInt(),
  validate,
  auditLog('ENROLL_STUDENT'),
  ctrl.enrollInCourse
);

module.exports = router;
