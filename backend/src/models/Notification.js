const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSON.plugin');

const notificationSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ recipientId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: 1 });
notificationSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('Notification', notificationSchema);
