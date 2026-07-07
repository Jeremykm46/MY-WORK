const router = require('express').Router();
const ctrl = require('./auth.controller');
const { registerRules, loginRules, forgotPasswordRules, resetPasswordRules, updateProfileRules, changePasswordRules, verifyEmailRules } = require('./auth.validator');
const validate = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { authRateLimiter, passwordResetLimiter } = require('../../middleware/rateLimiter');
const { auditLog } = require('../../middleware/audit');

router.post('/register', authRateLimiter, registerRules, validate, auditLog('USER_REGISTER'), ctrl.register);
router.post('/login', authRateLimiter, loginRules, validate, auditLog('USER_LOGIN'), ctrl.login);
router.post('/logout', authenticate, auditLog('USER_LOGOUT'), ctrl.logout);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordRules, validate, ctrl.forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPasswordRules, validate, ctrl.resetPassword);
router.get('/verify-email', verifyEmailRules, validate, ctrl.verifyEmail);
router.get('/profile', authenticate, ctrl.getProfile);
router.put('/profile', authenticate, updateProfileRules, validate, auditLog('UPDATE_PROFILE'), ctrl.updateProfile);
router.put('/change-password', authenticate, changePasswordRules, validate, auditLog('CHANGE_PASSWORD'), ctrl.changePassword);

module.exports = router;
