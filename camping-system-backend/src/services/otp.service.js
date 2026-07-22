const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const emailService = require("./email.service");
const smsService = require("./sms.service");

const OTP_TTL_MINUTES = 10;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Generates a new verification code for the user, saves it, and sends it
// via email/SMS (to both if both are available, in parallel and
// independently of each other, as in item 4).
async function generateAndSendOtp(user, purpose, notificationChannel) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: code, otpPurpose: purpose, otpExpiresAt: expiresAt }
  });

  const purposeText = purpose === "REGISTER" ? "verify your account" : purpose === "RESET_PASSWORD" ? "reset your password" : "log in";
  const subject = purpose === "RESET_PASSWORD" ? "Your CampPal password reset code" : "Your CampPal verification code";
  const text =
    `Hello ${user.name},\n\n` +
    `Your verification code to ${purposeText}: ${code}\n\n` +
    `This code will expire in ${OTP_TTL_MINUTES} minutes. If you did not request this, you can ignore this message.`;
  const sms = `CampPal verification code: ${code} (valid for ${OTP_TTL_MINUTES} minutes)`;

  if (notificationChannel === "EMAIL") {
    if (!user.email) throw new AppError("There is no email address registered to this account", 400);
    const result = await emailService.sendEmail({ to: user.email, subject, text });
    if (result.skipped) throw new AppError("The email could not be sent. Please check your SMTP settings.", 503);
  } else if (notificationChannel === "SMS") {
    if (!user.phone) throw new AppError("There is no phone number registered to this account", 400);
    const result = await smsService.sendSms({ to: user.phone, message: sms });
    if (result.skipped) throw new AppError("The SMS could not be sent. Please check your Twilio settings and destination country permissions.", 503);
  } else {
    throw new AppError("Invalid verification channel", 400);
  }

  return { expiresAt, notificationChannel };
}

// Verifies the entered code; consumes it on success (it cannot be reused).
async function verifyOtp(userId, code, expectedPurpose) {
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.otpCode || !user.otpExpiresAt) {
    throw new AppError("There is no pending verification code, please request a new one", 400);
  }

  if (user.otpExpiresAt < new Date()) {
    throw new AppError("The verification code has expired, please request a new one", 400);
  }

  if (user.otpCode !== String(code)) {
    throw new AppError("Incorrect verification code", 400);
  }

  const purpose = user.otpPurpose;
  if (expectedPurpose && purpose !== expectedPurpose) {
    throw new AppError("The verification code is not valid for this operation", 400);
  }

  const updateData = { otpCode: null, otpPurpose: null, otpExpiresAt: null };

  if (purpose === "REGISTER" && !user.contactVerifiedAt) {
    updateData.contactVerifiedAt = new Date();
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updateData
  });

  return { user: updated, purpose };
}

module.exports = {
  generateAndSendOtp,
  verifyOtp
};
