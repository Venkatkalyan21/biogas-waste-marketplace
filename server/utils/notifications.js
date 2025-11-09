const nodemailer = require('nodemailer');
const emailTemplates = require('../templates/emailTemplates');

let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (e) {
  twilioClient = null;
}

const createTransport = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = createTransport();
  if (!transporter) return false;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  });
  return true;
};

const sendSMS = async ({ to, body }) => {
  if (!twilioClient || !process.env.TWILIO_SMS_FROM) return false;
  await twilioClient.messages.create({
    from: process.env.TWILIO_SMS_FROM,
    to,
    body
  });
  return true;
};

const sendWhatsApp = async ({ to, body }) => {
  if (!twilioClient || !process.env.TWILIO_WHATSAPP_FROM) return false;
  await twilioClient.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
    to: `whatsapp:${to}`,
    body
  });
  return true;
};

// Unified notification; tries Email first (free), then optional paid SMS/WhatsApp, then console
const notifyUser = async ({ user, subject, message }) => {
  const phone = user?.phone;
  const email = user?.email;

  // Try Email first (FREE - no cost)
  try {
    if (email) {
      const ok = await sendEmail({ to: email, subject, text: message });
      if (ok) {
        console.log(`✅ Notification sent via Email to ${email}`);
        return { channel: 'email', ok: true };
      }
    }
  } catch (e) {
    console.error('Email notification error:', e);
  }

  // Optional: Try WhatsApp if Twilio is configured (PAID service - optional)
  try {
    if (phone && (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) && process.env.TWILIO_WHATSAPP_FROM) {
      const ok = await sendWhatsApp({ to: phone, body: message });
      if (ok) {
        console.log(`✅ Notification sent via WhatsApp to ${phone}`);
        return { channel: 'whatsapp', ok: true };
      }
    }
  } catch (e) {
    console.error('WhatsApp notification error:', e);
  }

  // Optional: Fallback to SMS if Twilio is configured (PAID service - optional)
  try {
    if (phone && (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) && process.env.TWILIO_SMS_FROM) {
      const ok = await sendSMS({ to: phone, body: message });
      if (ok) {
        console.log(`✅ Notification sent via SMS to ${phone}`);
        return { channel: 'sms', ok: true };
      }
    }
  } catch (e) {
    console.error('SMS notification error:', e);
  }

  // Last resort: log to console (always works, no cost)
  console.log('📧 Notification (console log - no email/SMS configured):', { 
    to: { phone, email }, 
    subject, 
    message 
  });
  return { channel: 'console', ok: true };
};

// Send templated email notifications
const sendTemplatedEmail = async ({ to, templateName, templateData, subject }) => {
  const transporter = createTransport();
  if (!transporter) return false;

  let html;
  switch (templateName) {
    case 'orderPlaced':
      html = emailTemplates.orderPlaced(templateData.order, templateData.userName);
      break;
    case 'orderStatusUpdated':
      html = emailTemplates.orderStatusUpdated(templateData.order, templateData.status, templateData.userName);
      break;
    case 'passwordReset':
      html = emailTemplates.passwordReset(templateData.resetToken, templateData.userName);
      break;
    case 'emailVerification':
      html = emailTemplates.emailVerification(templateData.verificationToken, templateData.userName);
      break;
    case 'paymentReceived':
      html = emailTemplates.paymentReceived(templateData.order, templateData.userName);
      break;
    case 'escrowReleased':
      html = emailTemplates.escrowReleased(templateData.order, templateData.userName);
      break;
    default:
      return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: subject || 'AgriLoop Notification',
      html
    });
    return true;
  } catch (error) {
    console.error('Send templated email error:', error);
    return false;
  }
};

module.exports = { notifyUser, sendTemplatedEmail };


