const nodemailer = require('nodemailer');

function parseBoolean(value, fallback) {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('Email transport not fully configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS');
  }

  const transportOptions = {
    host,
    port,
    // secure,
    auth: user && pass ? { user, pass } : undefined,
  };

  const transporter = nodemailer.createTransport(transportOptions);

  return transporter;
}

async function verifyTransport() {
  const transporter = createTransport();
  await transporter.verify();
}

async function sendEmail({ to, subject, html, text }) {
  const from = process.env.EMAIL_FROM || 'no-reply@fitnesstrack.local';
  const transporter = createTransport();
  return transporter.sendMail({ from, to, subject, html, text });
}

module.exports = { createTransport, verifyTransport, sendEmail };

