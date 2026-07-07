const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSON.plugin');

const tokenBlacklistSchema = new mongoose.Schema(
  {
    tokenJti: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// TTL index: MongoDB automatically deletes documents once expiresAt passes —
// replaces the manual "DELETE ... WHERE expires_at < NOW()" cron job.
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
tokenBlacklistSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);
