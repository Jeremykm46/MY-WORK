const crypto = require('crypto');

const getPagination = (page = 1, limit = 20) => {
  const safePage = Math.max(1, parseInt(page));
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (safePage - 1) * safeLimit;
  return { page: safePage, limit: safeLimit, offset };
};

const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});

const generateToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>"'&]/g, '');
};

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split('T')[0];
};

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);

const isExpired = (expiryDate) => new Date() > new Date(expiryDate);

/** Escape regex metacharacters so user search input is safe to use in a MongoDB $regex filter. */
const escapeRegExp = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { getPagination, buildPaginationMeta, generateToken, generateOTP, sanitizeString, formatDate, addMinutes, isExpired, escapeRegExp };
