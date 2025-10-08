const sgMail = require('@sendgrid/mail');

const apiKey = process.env.SENDGRID_API_KEY;
if (!apiKey) {
  console.warn('SendGrid API key not configured. Set SENDGRID_API_KEY environment variable');
} else {
  sgMail.setApiKey(apiKey);
}

async function verifyTransport() {
  if (!apiKey) {
    throw new Error('SendGrid API key not configured');
  }

  try {
    await sgMail.send({
      to: 'test@example.com',
      from: process.env.EMAIL_FROM || 'no-reply@fitnesstrack.local',
      subject: 'Test',
      text: 'Test',
      mailSettings: {
        sandboxMode: {
          enable: true
        }
      }
    });
  } catch (error) {
    if (error.code === 401) {
      throw new Error('Invalid SendGrid API key');
    }
    // Other errors are expected in sandbox mode
  }
}

async function sendEmail({ to, subject, html, text }) {
  if (!apiKey) {
    throw new Error('SendGrid API key not configured');
  }

  const from = process.env.EMAIL_FROM || 'no-reply@fitnesstrack.local';
  
  const msg = {
    to,
    from,
    subject,
    text,
    html
  };

  try {
    const response = await sgMail.send(msg);
    return response;
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error;
  }
}

module.exports = { verifyTransport, sendEmail };