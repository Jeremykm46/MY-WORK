const courseService = require('./course.service');
const { success, created, paginated } = require('../../utils/response');

const getAllCourses = async (req, res, next) => {
  try {
    const { courses, pagination } = await courseService.getAllCourses(req.query);
    return paginated(res, courses, pagination, 'Courses retrieved');
  } catch (err) { next(err); }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    return success(res, course, 'Course retrieved');
  } catch (err) { next(err); }
};

const createCourse = async (req, res, next) => {
  try {
    const result = await courseService.createCourse(req.body);
    return created(res, result, 'Course created successfully');
  } catch (err) { next(err); }
};

const updateCourse = async (req, res, next) => {
  try {
    await courseService.updateCourse(req.params.id, req.body);
    return success(res, null, 'Course updated successfully');
  } catch (err) { next(err); }
};

const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteCourse(req.params.id);
    return success(res, null, 'Course deleted successfully');
  } catch (err) { next(err); }
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
