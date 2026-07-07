const classService = require('./class.service');
const { success, created, paginated } = require('../../utils/response');

const getAllClasses = async (req, res, next) => {
  try {
    const { classes, pagination } = await classService.getAllClasses(req.query);
    return paginated(res, classes, pagination, 'Classes retrieved');
  } catch (err) { next(err); }
};

const createClass = async (req, res, next) => {
  try {
    const result = await classService.createClass(req.body);
    return created(res, result, 'Class schedule created');
  } catch (err) { next(err); }
};

const deleteClass = async (req, res, next) => {
  try {
    await classService.deleteClass(req.params.id);
    return success(res, null, 'Class removed from schedule');
  } catch (err) { next(err); }
};

module.exports = { getAllClasses, createClass, deleteClass };
