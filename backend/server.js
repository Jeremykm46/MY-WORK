require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/config/socket');
const logger = require('./src/utils/logger');
const { testConnection } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start server after confirming DB connection
(async () => {
  try {
    if (process.env.SKIP_DB === 'true') {
      logger.warn('SKIP_DB is true — skipping database connection check');
    } else {
      await testConnection();
    }
    server.listen(PORT, () => {
      logger.info(`🚀 Landmark Attendance API running on port ${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`📄 API Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    logger.error('Failed to connect to database. Server not started.', { error: err && err.message });
    // If SKIP_DB is set, try to start server anyway (useful for local frontend-only testing)
    if (process.env.SKIP_DB === 'true') {
      logger.warn('Attempting to start server despite DB error because SKIP_DB=true');
      server.listen(PORT, () => {
        logger.info(`🚀 Landmark Attendance API running on port ${PORT} [${process.env.NODE_ENV}]`);
        logger.info(`📄 API Docs: http://localhost:${PORT}/api-docs`);
      });
    } else {
      process.exit(1);
    }
  }
})();

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  process.exit(1);
});
