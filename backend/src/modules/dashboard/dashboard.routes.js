const router = require('express').Router();
const { getDashboard } = require('./dashboard.controller');
const { authenticate } = require('../../middleware/auth');
const { allRoles } = require('../../middleware/rbac');
const { query } = require('express-validator');
const validate = require('../../middleware/validate');

router.use(authenticate);
router.get('/', allRoles,
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validate,
  getDashboard
);

module.exports = router;
