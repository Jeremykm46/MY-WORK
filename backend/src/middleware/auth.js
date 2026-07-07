const jwt = require('jsonwebtoken');
const { User, TokenBlacklist } = require('../models');
const { error } = require('../utils/response');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token is not blacklisted (logged out)
    const blacklisted = await TokenBlacklist.findOne({ tokenJti: decoded.jti, expiresAt: { $gt: new Date() } });
    if (blacklisted) return error(res, 'Token has been invalidated. Please login again.', 401);

    // Load fresh user from DB to catch deactivations
    const user = await User.findById(decoded.id).select('_id email role isActive isEmailVerified').lean();
    if (!user) return error(res, 'User not found.', 401);
    if (!user.isActive) return error(res, 'Account has been deactivated.', 403);

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      is_active: user.isActive,
      is_email_verified: user.isEmailVerified,
      jti: decoded.jti,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return error(res, 'Token expired. Please login again.', 401);
    if (err.name === 'JsonWebTokenError') return error(res, 'Invalid token.', 401);
    logger.error('Auth middleware error', { error: err.message });
    next(err);
  }
};

/** Optional auth — attaches user if token present but doesn't block */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id, isActive: true }).select('_id email role').lean();
    if (user) req.user = { id: user._id.toString(), email: user.email, role: user.role };
  } catch {
    // no-op — token invalid or expired, continue unauthenticated
  }
  next();
};

module.exports = { authenticate, optionalAuth };
