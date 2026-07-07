const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSON.plugin');

const lecturerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    staffId: { type: String, required: true, unique: true },
    department: { type: String, default: null },
    specialisation: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

lecturerSchema.index({ department: 1 });
lecturerSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('Lecturer', lecturerSchema);
