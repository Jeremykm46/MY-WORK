const { error } = require('../utils/response');

const ROLES = {
  ADMIN: 'admin',
  LECTURER: 'lecturer',
  STUDENT: 'student',
};

/**
 * authorize(...roles) — returns middleware that allows only the listed roles.
 * Must be used AFTER authenticate middleware.
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return error(res, 'Authentication required.', 401);
  if (!roles.includes(req.user.role)) {
    return error(res, `Access denied. Required role(s): ${roles.join(', ')}.`, 403);
  }
  next();
};

/** Shorthand middleware for single role checks */
const adminOnly = authorize(ROLES.ADMIN);
const lecturerOnly = authorize(ROLES.LECTURER);
const studentOnly = authorize(ROLES.STUDENT);
const adminOrLecturer = authorize(ROLES.ADMIN, ROLES.LECTURER);
const allRoles = authorize(ROLES.ADMIN, ROLES.LECTURER, ROLES.STUDENT);

/**
 * ownerOrAdmin — student/lecturer can only access their own resource;
 * admin can access any. Compares req.params.id with req.user.id.
 */
const ownerOrAdmin = (req, res, next) => {
  if (!req.user) return error(res, 'Authentication required.', 401);
  if (req.user.role === ROLES.ADMIN) return next();
  if (String(req.user.id) === String(req.params.id)) return next();
  return error(res, 'You can only access your own resources.', 403);
};

module.exports = { ROLES, authorize, adminOnly, lecturerOnly, studentOnly, adminOrLecturer, allRoles, ownerOrAdmin };
