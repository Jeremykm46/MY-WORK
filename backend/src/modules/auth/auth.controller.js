const authService = require('./auth.service');
const { success, created, error } = require('../../utils/response');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return created(res, result, 'Registration successful. Please verify your email.');
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(
      req.body.email,
      req.body.password,
      req.ip,
      req.headers['user-agent']
    );
    return success(res, result, 'Login successful');
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    const decoded = require('jsonwebtoken').decode(req.headers.authorization.split(' ')[1]);
    await authService.logout(decoded.jti, new Date(decoded.exp * 1000));
    return success(res, null, 'Logged out successfully');
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    return success(res, null, 'If an account with that email exists, a reset link has been sent.');
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    return success(res, null, 'Password reset successful. You can now log in.');
  } catch (err) { next(err); }
};

const verifyEmail = async (req, res, next) => {
  try {
    await authService.verifyEmail(req.query.token);
    return success(res, null, 'Email verified successfully.');
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await authService.getProfile(req.user.id);
    return success(res, profile, 'Profile retrieved');
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const profile = await authService.updateProfile(req.user.id, req.user.role, req.body);
    return success(res, profile, 'Profile updated');
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    return success(res, null, 'Password changed successfully');
  } catch (err) { next(err); }
};

module.exports = { register, login, logout, forgotPassword, resetPassword, verifyEmail, getProfile, updateProfile, changePassword };
