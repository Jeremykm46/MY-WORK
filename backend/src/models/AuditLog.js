const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSON.plugin');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true },
    resource: { type: String, default: null },
    resourceId: { type: String, default: null },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    statusCode: { type: Number, default: null },
    requestBody: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: 1 });
auditLogSchema.index({ statusCode: 1 });
auditLogSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('AuditLog', auditLogSchema);
