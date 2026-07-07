const studentService = require('./student.service');
const { success, created, paginated } = require('../../utils/response');

const getAllStudents = async (req, res, next) => {
  try {
    const { students, pagination } = await studentService.getAllStudents(req.query);
    return paginated(res, students, pagination, 'Students retrieved');
  } catch (err) { next(err); }
};

const getStudentById = async (req, res, next) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    return success(res, student, 'Student retrieved');
  } catch (err) { next(err); }
};

const createStudent = async (req, res, next) => {
  try {
    const result = await studentService.createStudent(req.body);
    return created(res, result, 'Student created successfully');
  } catch (err) { next(err); }
};

const updateStudent = async (req, res, next) => {
  try {
    await studentService.updateStudent(req.params.id, req.body);
    return success(res, null, 'Student updated successfully');
  } catch (err) { next(err); }
};

const deleteStudent = async (req, res, next) => {
  try {
    await studentService.deleteStudent(req.params.id);
    return success(res, null, 'Student deactivated successfully');
  } catch (err) { next(err); }
};

const enrollInCourse = async (req, res, next) => {
  try {
    await studentService.enrollInCourse(req.params.id, req.body.courseId);
    return success(res, null, 'Student enrolled in course');
  } catch (err) { next(err); }
};

const getAttendanceSummary = async (req, res, next) => {
  try {
    const summary = await studentService.getAttendanceSummary(req.params.id);
    return success(res, summary, 'Attendance summary retrieved');
  } catch (err) { next(err); }
};

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent, enrollInCourse, getAttendanceSummary };
