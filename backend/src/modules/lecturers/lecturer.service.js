const bcrypt = require('bcryptjs');
const { withTransaction } = require('../../config/database');
const { User, Lecturer, Course } = require('../../models');
const { getPagination, buildPaginationMeta, generateToken, escapeRegExp } = require('../../utils/helpers');
const { sendEmail, templates } = require('../../utils/email');
const logger = require('../../utils/logger');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

const getAllLecturers = async ({ page, limit, search, department }) => {
  const { page: p, limit: l, offset } = getPagination(page, limit);

  const lecturerFilter = {};
  if (department) lecturerFilter.department = department;

  const lecturers = await Lecturer.find(lecturerFilter).lean();
  const userIds = lecturers.map((lec) => lec.userId);
  const users = await User.find({ _id: { $in: userIds }, isActive: true }).lean();
  const usersById = new Map(users.map((u) => [u._id.toString(), u]));

  let combined = lecturers
    .filter((lec) => usersById.has(lec.userId.toString()))
    .map((lec) => ({ lecturer: lec, user: usersById.get(lec.userId.toString()) }));

  if (search) {
    const re = new RegExp(escapeRegExp(search), 'i');
    combined = combined.filter(({ lecturer, user }) => re.test(user.name) || re.test(lecturer.staffId) || re.test(user.email));
  }

  combined.sort((a, b) => a.user.name.localeCompare(b.user.name));

  const total = combined.length;
  const pageItems = combined.slice(offset, offset + l);

  const result = pageItems.map(({ lecturer, user }) => ({
    id: lecturer._id.toString(),
    staff_id: lecturer.staffId,
    department: lecturer.department,
    specialisation: lecturer.specialisation,
    user_id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    created_at: user.createdAt,
    last_login: user.lastLogin,
  }));

  return { lecturers: result, pagination: buildPaginationMeta(total, p, l) };
};

const getLecturerById = async (id) => {
  const lecturer = await Lecturer.findById(id).lean();
  if (!lecturer) throw Object.assign(new Error('Lecturer not found'), { statusCode: 404 });

  const user = await User.findById(lecturer.userId).lean();
  if (!user) throw Object.assign(new Error('Lecturer not found'), { statusCode: 404 });

  const courses = await Course.find({ lecturerId: id }).select('code name creditHours').lean();

  return {
    id: lecturer._id.toString(),
    staff_id: lecturer.staffId,
    department: lecturer.department,
    specialisation: lecturer.specialisation,
    user_id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    is_active: user.isActive,
    created_at: user.createdAt,
    courses: courses.map((c) => ({ id: c._id.toString(), code: c.code, name: c.name, credit_hours: c.creditHours })),
  };
};

const createLecturer = async ({ name, email, staffId, department, specialisation, phone }) => {
  const existing = await User.findOne({ email });
  if (existing) throw Object.assign(new Error('Email already in use'), { statusCode: 409 });

  const existingStaff = await Lecturer.findOne({ staffId });
  if (existingStaff) throw Object.assign(new Error('Staff ID already exists'), { statusCode: 409 });

  const tempPassword = generateToken(8);
  const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

  const { id, userId } = await withTransaction(async (session) => {
    const [user] = await User.create(
      [{ name, email, passwordHash, role: 'lecturer', phone: phone || null, isEmailVerified: true, isActive: true }],
      { session }
    );
    const [lecturer] = await Lecturer.create(
      [{ userId: user._id, staffId, department: department || null, specialisation: specialisation || null }],
      { session }
    );
    return { id: lecturer._id.toString(), userId: user._id.toString() };
  });

  await sendEmail({ to: email, ...templates.welcomeStudent(name, staffId, tempPassword) }).catch((e) =>
    logger.warn('Welcome email failed', { error: e.message })
  );

  return { id, userId, staffId };
};

const updateLecturer = async (id, { name, department, specialisation, phone }) => {
  const lecturer = await Lecturer.findById(id);
  if (!lecturer) throw Object.assign(new Error('Lecturer not found'), { statusCode: 404 });

  await User.updateOne({ _id: lecturer.userId }, { name, phone: phone || null });
  await Lecturer.updateOne({ _id: id }, { department: department || null, specialisation: specialisation || null });
};

const deleteLecturer = async (id) => {
  const lecturer = await Lecturer.findById(id);
  if (!lecturer) throw Object.assign(new Error('Lecturer not found'), { statusCode: 404 });
  await User.updateOne({ _id: lecturer.userId }, { isActive: false, deletedAt: new Date() });
};

const assignToCourse = async (lecturerId, courseId) => {
  await Course.updateOne({ _id: courseId }, { lecturerId });
};

module.exports = { getAllLecturers, getLecturerById, createLecturer, updateLecturer, deleteLecturer, assignToCourse };
