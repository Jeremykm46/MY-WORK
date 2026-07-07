const { AuditLog } = require('../models');
const logger = require('../utils/logger');

/**
 * Middleware factory — call as auditLog('action') to auto-log after response.
 * Works via response finish event so the action is logged regardless of success.
 */
const auditLog = (action) => (req, res, next) => {
  res.on('finish', async () => {
    try {
      await AuditLog.create({
        userId: req.user?.id || null,
        action,
        resource: req.baseUrl + req.path,
        resourceId: req.params?.id || null,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
        statusCode: res.statusCode,
        requestBody: JSON.stringify(sanitiseBody(req.body)),
      });
    } catch (err) {
      logger.error('Audit log insert failed', { error: err.message, action });
    }
  });
  next();
};

const sensitiveFields = new Set(['password', 'confirmPassword', 'newPassword', 'token', 'secret']);

const sanitiseBody = (body = {}) => {
  const clean = { ...body };
  for (const field of sensitiveFields) {
    if (clean[field] !== undefined) clean[field] = '[REDACTED]';
  }
  return clean;
};

module.exports = { auditLog };
