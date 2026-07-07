const auditService = require('./audit.service');
const { paginated } = require('../../utils/response');

const getLogs = async (req, res, next) => {
  try {
    const { logs, pagination } = await auditService.getLogs(req.query);
    return paginated(res, logs, pagination, 'Audit logs retrieved');
  } catch (err) { next(err); }
};

const getSecurityLogs = async (req, res, next) => {
  try {
    const { logs, pagination } = await auditService.getSecurityLogs(req.query);
    return paginated(res, logs, pagination, 'Security logs retrieved');
  } catch (err) { next(err); }
};

const getActivityLogs = async (req, res, next) => {
  try {
    const { logs, pagination } = await auditService.getActivityLogs(req.query);
    return paginated(res, logs, pagination, 'Activity logs retrieved');
  } catch (err) { next(err); }
};

module.exports = { getLogs, getSecurityLogs, getActivityLogs };
