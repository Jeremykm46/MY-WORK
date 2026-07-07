const router = require('express').Router();
const ctrl = require('./notification.controller');
const { authenticate } = require('../../middleware/auth');
const { adminOrLecturer, allRoles } = require('../../middleware/rbac');
const { body, param, query } = require('express-validator');
const validate = require('../../middleware/validate');

const sendRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('recipientId').optional().isInt().toInt(),
  body('recipientRole').optional().isIn(['admin', 'lecturer', 'student']).withMessage('Invalid recipient role'),
  body('courseId').optional().isInt().toInt(),
  body('channel').optional().isIn(['email', 'all', 'push', 'sms']).withMessage('Invalid channel'),
  body().custom((value, { req }) => {
    if (req.body.recipientId || req.body.recipientRole || req.body.courseId) return true;
    throw new Error('recipientId, recipientRole or courseId is required');
  }),
];

router.use(authenticate);

router.get('/', allRoles,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('unreadOnly').optional().isBoolean(),
  validate,
  ctrl.getNotifications
);
router.post('/send', adminOrLecturer, sendRules, validate, ctrl.sendNotification);
router.post('/send-warnings', adminOrLecturer,
  [body('threshold').optional().isInt({ min: 0, max: 100 }).toInt()],
  validate,
  ctrl.sendAttendanceWarnings
);
router.delete('/:id', allRoles, param('id').isInt().toInt(), validate, ctrl.deleteNotification);

module.exports = router;
