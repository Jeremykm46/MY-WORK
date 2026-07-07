const router = require('express').Router();
const ctrl = require('./course.controller');
const { authenticate } = require('../../middleware/auth');
const { adminOnly, adminOrLecturer, allRoles } = require('../../middleware/rbac');
const { auditLog } = require('../../middleware/audit');
const { body, param, query } = require('express-validator');
const validate = require('../../middleware/validate');

const courseRules = [
  body('name').trim().notEmpty().withMessage('Course name is required'),
  body('code').trim().notEmpty().withMessage('Course code is required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year is required'),
  body('semester').trim().notEmpty().withMessage('Semester is required'),
];

router.use(authenticate);

router.get('/', allRoles, query('page').optional().isInt({ min: 1 }).toInt(), query('limit').optional().isInt({ min: 1, max: 100 }).toInt(), validate, ctrl.getAllCourses);
router.get('/:id', allRoles, param('id').isInt().toInt(), validate, ctrl.getCourseById);
router.post('/', adminOnly, auditLog('CREATE_COURSE'), courseRules, validate, ctrl.createCourse);
router.put('/:id', adminOnly, auditLog('UPDATE_COURSE'), param('id').isInt().toInt(), courseRules, validate, ctrl.updateCourse);
router.delete('/:id', adminOnly, auditLog('DELETE_COURSE'), param('id').isInt().toInt(), validate, ctrl.deleteCourse);

module.exports = router;
