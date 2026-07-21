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
 * E-posta gönderir. SMTP bilgileri .env'de tanımlı değilse (örn. yerel
 * geliştirme ortamı), gönderim yapmak yerine konsola loglar ki uygulama
 * kimlik bilgisi eksikliğinde çökmesin. Prodüksiyonda SMTP_HOST/PORT/USER/PASS
 * ve MAIL_FROM tanımlanınca gerçek gönderim otomatik devreye girer.
 */
async function sendEmail({ to, subject, text, html }) {
  if (!to) return { skipped: true, reason: "no-recipient" };

  if (!isEmailConfigured()) {
    if (!loggedMissingConfig) {
      console.log(
        "[email] SMTP yapılandırılmamış (.env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM). " +
          "Gönderimler konsola loglanacak."
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
    console.error(`[email] Gönderim başarısız (${to}):`, error.message);
    return { skipped: true, reason: "send-error", error: error.message };
  }
}

module.exports = {
  sendEmail,
  isEmailConfigured
};
