const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSON.plugin');

const courseStudentSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

courseStudentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });
courseStudentSchema.index({ studentId: 1 });
courseStudentSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('CourseStudent', courseStudentSchema);
