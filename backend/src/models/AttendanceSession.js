const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSON.plugin');

const attendanceSessionSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer', required: true },
    sessionDate: { type: String, required: true }, // "YYYY-MM-DD"
    startTime: { type: String, required: true },
    endTime: { type: String, default: null },
    sessionType: { type: String, enum: ['lecture', 'lab', 'tutorial', 'seminar'], default: 'lecture' },
    status: { type: String, enum: ['open', 'closed', 'cancelled'], default: 'open' },
    locationLat: { type: Number, default: null },
    locationLng: { type: Number, default: null },
    closedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

attendanceSessionSchema.index({ courseId: 1, sessionDate: 1 });
attendanceSessionSchema.index({ lecturerId: 1 });
attendanceSessionSchema.index({ sessionDate: 1 });
attendanceSessionSchema.index({ status: 1 });
attendanceSessionSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
