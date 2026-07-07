const dashboardService = require('./dashboard.service');
const { success } = require('../../utils/response');
const { ROLES } = require('../../middleware/rbac');

const getDashboard = async (req, res, next) => {
  try {
    let data;
    switch (req.user.role) {
      case ROLES.ADMIN:
        data = await dashboardService.getAdminDashboard();
        break;
      case ROLES.LECTURER:
        data = await dashboardService.getLecturerDashboard(req.user.id);
        break;
      case ROLES.STUDENT:
        data = await dashboardService.getStudentDashboard(req.user.id);
        break;
      default:
        return next(Object.assign(new Error('Unknown role'), { statusCode: 403 }));
    }
    return success(res, data, 'Dashboard data retrieved');
  } catch (err) { next(err); }
};

module.exports = { getDashboard };
