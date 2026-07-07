const { AuditLog, User } = require('../../models');
const { getPagination, buildPaginationMeta, escapeRegExp } = require('../../utils/helpers');

const attachUserInfo = async (logs, fields = 'name email role') => {
  const userIds = logs.map((l) => l.userId).filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } }).select(fields).lean();
  return new Map(users.map((u) => [u._id.toString(), u]));
};

const getLogs = async ({ page, limit, action, userId, from, to }) => {
  const { page: p, limit: l, offset } = getPagination(page, limit);

  const filter = {};
  if (action) filter.action = new RegExp(escapeRegExp(action), 'i');
  if (userId) filter.userId = userId;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const total = await AuditLog.countDocuments(filter);
  const logDocs = await AuditLog.find(filter).sort({ createdAt: -1 }).skip(offset).limit(l).lean();
  const usersById = await attachUserInfo(logDocs, 'name email role');

  const logs = logDocs.map((log) => {
    const user = log.userId ? usersById.get(log.userId.toString()) : null;
    return {
      id: log._id.toString(),
      action: log.action,
      resource: log.resource,
      resource_id: log.resourceId,
      ip_address: log.ipAddress,
      status_code: log.statusCode,
      created_at: log.createdAt,
      user_name: user ? user.name : null,
      email: user ? user.email : null,
      role: user ? user.role : null,
    };
  });

  return { logs, pagination: buildPaginationMeta(total, p, l) };
};

const SECURITY_ACTIONS = ['LOGIN_FAILED', 'LOGIN', 'USER_LOGOUT', 'CHANGE_PASSWORD'];

const getSecurityLogs = async ({ page, limit }) => {
  const { page: p, limit: l, offset } = getPagination(page, limit);

  const filter = { $or: [{ action: { $in: SECURITY_ACTIONS } }, { statusCode: { $in: [401, 403, 429] } }] };

  const total = await AuditLog.countDocuments(filter);
  const logDocs = await AuditLog.find(filter).sort({ createdAt: -1 }).skip(offset).limit(l).lean();
  const usersById = await attachUserInfo(logDocs, 'name email');

  const logs = logDocs.map((log) => {
    const user = log.userId ? usersById.get(log.userId.toString()) : null;
    return {
      id: log._id.toString(),
      action: log.action,
      ip_address: log.ipAddress,
      user_agent: log.userAgent,
      status_code: log.statusCode,
      created_at: log.createdAt,
      user_name: user ? user.name : null,
      email: user ? user.email : null,
    };
  });

  return { logs, pagination: buildPaginationMeta(total, p, l) };
};

const getActivityLogs = async ({ userId, page, limit }) => {
  const { page: p, limit: l, offset } = getPagination(page, limit);

  const filter = {};
  if (userId) filter.userId = userId;

  const total = await AuditLog.countDocuments(filter);
  const logDocs = await AuditLog.find(filter).sort({ createdAt: -1 }).skip(offset).limit(l).lean();
  const usersById = await attachUserInfo(logDocs, 'name');

  const logs = logDocs.map((log) => {
    const user = log.userId ? usersById.get(log.userId.toString()) : null;
    return {
      id: log._id.toString(),
      action: log.action,
      resource: log.resource,
      status_code: log.statusCode,
      created_at: log.createdAt,
      name: user ? user.name : null,
    };
  });

  return { logs, pagination: buildPaginationMeta(total, p, l) };
};

module.exports = { getLogs, getSecurityLogs, getActivityLogs };
