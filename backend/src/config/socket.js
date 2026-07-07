const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication token required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { id: userId, role } = socket.user;
    logger.info(`Socket connected: user=${userId} role=${role} socket=${socket.id}`);

    // Join role-based rooms
    socket.join(`role:${role}`);
    socket.join(`user:${userId}`);

    // Lecturer joins their course rooms
    socket.on('join:course', (courseId) => {
      socket.join(`course:${courseId}`);
      logger.info(`User ${userId} joined course room ${courseId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: user=${userId} reason=${reason}`);
    });
  });

  logger.info('✅ Socket.IO initialised');
  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialised');
  return io;
};

// ─── Emit helpers ─────────────────────────────────────────────────────────────

const emitToUser = (userId, event, data) => getIO().to(`user:${userId}`).emit(event, data);

const emitToRole = (role, event, data) => getIO().to(`role:${role}`).emit(event, data);

const emitToCourse = (courseId, event, data) => getIO().to(`course:${courseId}`).emit(event, data);

const broadcastAll = (event, data) => getIO().emit(event, data);

module.exports = { initSocket, getIO, emitToUser, emitToRole, emitToCourse, broadcastAll };
