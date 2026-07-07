const router = require('express').Router();
const ctrl = require('./audit.controller');
const { authenticate } = require('../../middleware/auth');
const { adminOnly } = require('../../middleware/rbac');
const { query } = require('express-validator');
const validate = require('../../middleware/validate');

router.use(authenticate, adminOnly);

const paginationRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

router.get('/', paginationRules, validate, ctrl.getLogs);
router.get('/security', paginationRules, validate, ctrl.getSecurityLogs);
router.get('/activity', paginationRules, validate, ctrl.getActivityLogs);

module.exports = router;
