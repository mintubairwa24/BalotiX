const nodemailer = require('nodemailer');
const { buildVerificationEmail } = require('./verification.email');
const { buildPasswordResetEmail } = require('./resetPassword');

const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration is missing in environment variables');
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: Number(process.env.EMAIL_PORT || 587) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendMail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Advance Auth" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
};

const sendVerificationEmail = async (email, name, token) => {
  const clientUrl = process.env.CLIENT_URL;
  if (!clientUrl) {
    throw new Error('CLIENT_URL is missing in environment variables');
  }

  const verifyUrl = `${clientUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const emailContent = buildVerificationEmail({ name, verifyUrl });

  await sendMail({
    to: email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
};

const sendPasswordResetEmail = async (email, name, token) => {
  const clientUrl = process.env.CLIENT_URL;
  if (!clientUrl) {
    throw new Error('CLIENT_URL is missing in environment variables');
  }

  const resetUrl = `${clientUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const emailContent = buildPasswordResetEmail({ name, resetUrl });

  await sendMail({
    to: email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
