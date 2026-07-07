const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  // Fail fast on an unreachable/misconfigured SMTP server instead of hanging
  // the awaiting request (e.g. registration) indefinitely.
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Landmark Metropolitan University" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent: ${info.messageId} to ${to}`);
    return info;
  } catch (err) {
    logger.error('Email send failed', { error: err.message, to, subject });
    throw err;
  }
};

const templates = {
  welcomeStudent: (name, studentId, tempPassword) => ({
    subject: 'Welcome to Landmark Metropolitan University — Attendance System',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your student account has been created on the Attendance Management System.</p>
      <p><strong>Student ID:</strong> ${studentId}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p>Please log in and change your password immediately.</p>
      <p>Login at: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
    `,
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'Password Reset Request — Landmark Attendance System',
    html: `
      <h2>Hello, ${name}</h2>
      <p>You requested a password reset. Click the link below (expires in 1 hour):</p>
      <a href="${resetUrl}" style="background:#2563EB;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  }),

  attendanceWarning: (name, course, percentage) => ({
    subject: `Attendance Warning — ${course}`,
    html: `
      <h2>Attendance Alert for ${name}</h2>
      <p>Your attendance in <strong>${course}</strong> has dropped to <strong>${percentage}%</strong>.</p>
      <p>The minimum required attendance is 75%. Please attend classes regularly to avoid academic consequences.</p>
    `,
  }),

  emailVerification: (name, verifyUrl) => ({
    subject: 'Verify Your Email — Landmark Attendance System',
    html: `
      <h2>Hello, ${name}!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verifyUrl}" style="background:#16A34A;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  }),
};

module.exports = { sendEmail, templates };
