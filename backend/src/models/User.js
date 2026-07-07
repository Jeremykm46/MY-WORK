const mongoose = require('mongoose');
const toJSONPlugin = require('./toJSON.plugin');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 150 },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'lecturer', 'student'], default: 'student' },
    phone: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String, default: null },
    emailVerifyExpires: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
    profilePhoto: { type: String, default: null },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, default: null },
    sessionTimeoutMinutes: { type: Number, default: 60 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.plugin(toJSONPlugin);

module.exports = mongoose.model('User', userSchema);
