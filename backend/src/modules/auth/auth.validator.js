const { body, query } = require('express-validator');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('role').optional().isIn(['student', 'lecturer']).withMessage('Role must be student or lecturer'),
  body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Invalid phone number'),
  body('studentId').if(body('role').equals('student')).notEmpty().withMessage('Student ID required for students'),
  body('staffId').if(body('role').equals('lecturer')).notEmpty().withMessage('Staff ID required for lecturers'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
];

const resetPasswordRules = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
];

const updateProfileRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }),
  body('phone').optional({ checkFalsy: true }).isMobilePhone().withMessage('Invalid phone number'),
  body('department').optional().trim().isLength({ max: 100 }),
  body('yearOfStudy').optional().isInt({ min: 1, max: 8 }).toInt(),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
];

const verifyEmailRules = [
  query('token').notEmpty().withMessage('Verification token is required'),
];

module.exports = { registerRules, loginRules, forgotPasswordRules, resetPasswordRules, updateProfileRules, changePasswordRules, verifyEmailRules };
