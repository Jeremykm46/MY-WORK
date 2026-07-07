const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { withTransaction } = require('../../config/database');
const { User, Student, Lecturer, AuditLog, TokenBlacklist } = require('../../models');
const { sendEmail, templates } = require('../../utils/email');
const { generateToken, addMinutes, isExpired } = require('../../utils/helpers');
const logger = require('../../utils/logger');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

const signJWT = (payload) =>
  jwt.sign({ ...payload, jti: crypto.randomUUID() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async ({ name, email, password, role = 'student', studentId, staffId, department, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 409 });

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const verifyToken = generateToken();
  const verifyExpiry = addMinutes(new Date(), 24 * 60);

  const userId = await withTransaction(async (session) => {
    const [user] = await User.create(
      [{ name, email, passwordHash, role, phone: phone || null, emailVerifyToken: verifyToken, emailVerifyExpires: verifyExpiry }],
      { session }
    );

    if (role === 'student') {
      await Student.create([{ userId: user._id, studentId, department: department || null }], { session });
    } else if (role === 'lecturer') {
      await Lecturer.create([{ userId: user._id, staffId, department: department || null }], { session });
    }

    return user._id.toString();
  });

  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`;
  await sendEmail({ to: email, ...templates.emailVerification(name, verifyUrl) }).catch((e) =>
    logger.warn('Welcome email failed', { error: e.message })
  );

  return { userId, message: 'Registration successful. Please verify your email.' };
};

const login = async (email, password, ipAddress, userAgent) => {
  const user = await User.findOne({ email });

  if (!user) {
    await AuditLog.create({ action: 'LOGIN_FAILED', resource: '/auth/login', ipAddress, userAgent, statusCode: 401 }).catch(() => {});
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  // Account lock check
  if (user.lockedUntil && !isExpired(user.lockedUntil)) {
    throw Object.assign(new Error('Account temporarily locked due to too many failed attempts. Try again later.'), { statusCode: 403 });
  }

  if (!user.isActive) throw Object.assign(new Error('Account deactivated. Contact administrator.'), { statusCode: 403 });

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    const attempts = (user.failedLoginAttempts || 0) + 1;
    const lockedUntil = attempts >= 5 ? addMinutes(new Date(), 30) : null;
    await User.updateOne({ _id: user._id }, { failedLoginAttempts: attempts, lockedUntil });
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  // Reset failed attempts on success
  await User.updateOne({ _id: user._id }, { failedLoginAttempts: 0, lockedUntil: null, lastLogin: new Date() });

  const token = signJWT({ id: user._id.toString(), email: user.email, role: user.role });

  await AuditLog.create({
    userId: user._id,
    action: 'LOGIN',
    resource: '/auth/login',
    ipAddress,
    userAgent,
    statusCode: 200,
  }).catch(() => {});

  return {
    token,
    user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role, isEmailVerified: !!user.isEmailVerified },
  };
};

const logout = async (jti, expiresAt) => {
  await TokenBlacklist.create({ tokenJti: jti, expiresAt });
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email, isActive: true });
  if (!user) return; // silently succeed to prevent email enumeration

  const resetToken = generateToken();
  const expiry = addMinutes(new Date(), 60);

  await User.updateOne({ _id: user._id }, { resetToken, resetTokenExpires: expiry });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  await sendEmail({ to: user.email, ...templates.passwordReset(user.name, resetUrl) });
};

const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({ resetToken: token, isActive: true });
  if (!user || isExpired(user.resetTokenExpires)) {
    throw Object.assign(new Error('Password reset token is invalid or expired.'), { statusCode: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await User.updateOne({ _id: user._id }, { passwordHash, resetToken: null, resetTokenExpires: null });
};

const verifyEmail = async (token) => {
  const user = await User.findOne({ emailVerifyToken: token });
  if (!user || isExpired(user.emailVerifyExpires)) {
    throw Object.assign(new Error('Verification link is invalid or expired.'), { statusCode: 400 });
  }
  await User.updateOne({ _id: user._id }, { isEmailVerified: true, emailVerifyToken: null, emailVerifyExpires: null });
};

const getProfile = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

  const [student, lecturer] = await Promise.all([
    user.role === 'student' ? Student.findOne({ userId: user._id }).lean() : null,
    user.role === 'lecturer' ? Lecturer.findOne({ userId: user._id }).lean() : null,
  ]);

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    is_email_verified: user.isEmailVerified,
    last_login: user.lastLogin,
    created_at: user.createdAt,
    student_id: student ? student.studentId : undefined,
    student_department: student ? student.department : undefined,
    staff_id: lecturer ? lecturer.staffId : undefined,
    lecturer_department: lecturer ? lecturer.department : undefined,
  };
};

const updateProfile = async (userId, role, { name, phone, department, yearOfStudy }) => {
  await User.updateOne(
    { _id: userId },
    { $set: { ...(name ? { name } : {}), ...(phone ? { phone } : {}) } }
  );

  if (role === 'student') {
    await Student.updateOne(
      { userId },
      { $set: { ...(department ? { department } : {}), ...(yearOfStudy ? { yearOfStudy } : {}) } }
    );
  } else if (role === 'lecturer') {
    await Lecturer.updateOne({ userId }, { $set: { ...(department ? { department } : {}) } });
  }

  return getProfile(userId);
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw Object.assign(new Error('Current password is incorrect'), { statusCode: 400 });
  const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await User.updateOne({ _id: userId }, { passwordHash: hash });
};

module.exports = { register, login, logout, forgotPassword, resetPassword, verifyEmail, getProfile, updateProfile, changePassword };
