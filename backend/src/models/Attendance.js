const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSON.plugin');

const attendanceSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'present' },
    method: { type: String, enum: ['qr', 'manual', 'gps', 'biometric', 'system'], default: 'manual' },
    markedAt: { type: Date, required: true },
    locationLat: { type: Number, default: null },
    locationLng: { type: Number, default: null },
    remarks: { type: String, default: null },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    editedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
attendanceSchema.index({ studentId: 1 });
attendanceSchema.index({ status: 1 });
attendanceSchema.index({ markedAt: 1 });
attendanceSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('Attendance', attendanceSchema);
