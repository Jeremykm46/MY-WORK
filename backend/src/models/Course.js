const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSON.plugin');

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: null },
    creditHours: { type: Number, default: 3 },
    department: { type: String, default: null },
    semester: { type: String, required: true },
    academicYear: { type: String, required: true },
    lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer', default: null },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

courseSchema.index({ code: 1, academicYear: 1, semester: 1 }, { unique: true });
courseSchema.index({ lecturerId: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ isActive: 1 });
courseSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('Course', courseSchema);
