const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSON.plugin');

const timetableSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    startTime: { type: String, required: true }, // "HH:MM"
    endTime: { type: String, required: true },
    room: { type: String, default: null },
    classType: { type: String, enum: ['lecture', 'lab', 'tutorial', 'seminar'], default: 'lecture' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

timetableSchema.index({ courseId: 1 });
timetableSchema.index({ dayOfWeek: 1 });
timetableSchema.index({ room: 1, dayOfWeek: 1 });
timetableSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('Timetable', timetableSchema);
