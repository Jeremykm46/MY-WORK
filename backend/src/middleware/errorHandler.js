const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';

  // MongoDB duplicate key (unique index violation)
  if (err.code === 11000) {
    statusCode = 409;
    message = 'A record with this information already exists.';
  }

  // Mongoose schema validation errors
  if (err.name === 'ValidationError' || err.name === 'CastError') statusCode = 400;

  // Don't leak internal details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred. Please try again later.';
  }

  logger.error('Unhandled error', {
    message: err.message,
    statusCode,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.id,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
