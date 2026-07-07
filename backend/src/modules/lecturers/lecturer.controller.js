const lecturerService = require('./lecturer.service');
const { success, created, paginated } = require('../../utils/response');

const getAllLecturers = async (req, res, next) => {
  try {
    const { lecturers, pagination } = await lecturerService.getAllLecturers(req.query);
    return paginated(res, lecturers, pagination, 'Lecturers retrieved');
  } catch (err) { next(err); }
};

const getLecturerById = async (req, res, next) => {
  try {
    const lecturer = await lecturerService.getLecturerById(req.params.id);
    return success(res, lecturer, 'Lecturer retrieved');
  } catch (err) { next(err); }
};

const createLecturer = async (req, res, next) => {
  try {
    const result = await lecturerService.createLecturer(req.body);
    return created(res, result, 'Lecturer created successfully');
  } catch (err) { next(err); }
};

const updateLecturer = async (req, res, next) => {
  try {
    await lecturerService.updateLecturer(req.params.id, req.body);
    return success(res, null, 'Lecturer updated successfully');
  } catch (err) { next(err); }
};

const deleteLecturer = async (req, res, next) => {
  try {
    await lecturerService.deleteLecturer(req.params.id);
    return success(res, null, 'Lecturer deactivated successfully');
  } catch (err) { next(err); }
};

const assignToCourse = async (req, res, next) => {
  try {
    await lecturerService.assignToCourse(req.params.id, req.body.courseId);
    return success(res, null, 'Lecturer assigned to course');
  } catch (err) { next(err); }
};

module.exports = { getAllLecturers, getLecturerById, createLecturer, updateLecturer, deleteLecturer, assignToCourse };
