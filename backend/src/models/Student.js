const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSON.plugin');

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    studentId: { type: String, required: true, unique: true },
    department: { type: String, default: null },
    yearOfStudy: { type: Number, default: null },
    gpa: { type: Number, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

studentSchema.index({ department: 1 });
studentSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('Student', studentSchema);
