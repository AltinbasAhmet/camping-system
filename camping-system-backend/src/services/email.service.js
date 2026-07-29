const nodemailer = require("nodemailer");

let transporter = null;
let loggedMissingConfig = false;

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;
}

/**
 * Sends email. If SMTP details aren't defined in .env (e.g. a local
 * development environment), it logs to the console instead of sending so
 * the app doesn't crash from missing credentials. In production, once
 * SMTP_HOST/PORT/USER/PASS and MAIL_FROM are defined, real sending kicks
 * in automatically.
 */
async function sendEmail({ to, subject, text, html }) {
  if (!to) return { skipped: true, reason: "no-recipient" };

  if (!isEmailConfigured()) {
    if (!loggedMissingConfig) {
      console.log(
        "[email] SMTP is not configured (.env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM). " +
          "Messages will be logged to the console."
      );
      loggedMissingConfig = true;
    }
    console.log(`[email:dev] -> ${to} | ${subject}\n${text}`);
    return { skipped: true, reason: "smtp-not-configured" };
  }

  try {
    const info = await getTransporter().sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html: html || undefined
    });

    return { skipped: false, messageId: info.messageId };
  } catch (error) {
    console.error(`[email] Delivery failed (${to}):`, error.message);
    return { skipped: true, reason: "send-error", error: error.message };
  }
}

module.exports = {
  sendEmail,
  isEmailConfigured
};
