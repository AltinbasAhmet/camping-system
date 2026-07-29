const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const emailService = require("./email.service");
const smsService = require("./sms.service");

const OTP_TTL_MINUTES = 10;
const OTP_RESEND_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;
const OTP_BLOCK_MINUTES = 15;

function generateCode() { return crypto.randomInt(100000, 1000000).toString(); }

async function generateAndSendOtp(user, purpose, notificationChannel) {
  const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!freshUser) throw new AppError("User not found", 404);
  const now = new Date();
  if (freshUser.otpBlockedUntil && freshUser.otpBlockedUntil > now) {
    throw new AppError("Too many verification attempts. Please try again later.", 429);
  }
  if (freshUser.otpLastSentAt && now.getTime() - freshUser.otpLastSentAt.getTime() < OTP_RESEND_SECONDS * 1000) {
    throw new AppError("Please wait one minute before requesting another code.", 429);
  }

  const code = generateCode();
  const otpHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: otpHash, otpPurpose: purpose, otpExpiresAt: expiresAt, otpAttemptCount: 0, otpLastSentAt: now, otpBlockedUntil: null }
  });

  const purposeText = purpose === "REGISTER" ? "verify your account" : purpose === "RESET_PASSWORD" ? "reset your password" : "log in";
  const subject = purpose === "RESET_PASSWORD" ? "Your CampPal password reset code" : "Your CampPal verification code";
  const text = `Hello ${user.name},\n\nYour verification code to ${purposeText}: ${code}\n\nThis code expires in ${OTP_TTL_MINUTES} minutes.`;
  const sms = `CampPal verification code: ${code} (valid for ${OTP_TTL_MINUTES} minutes)`;

  if (notificationChannel === "EMAIL") {
    if (!user.email) throw new AppError("There is no email address registered to this account", 400);
    const result = await emailService.sendEmail({ to: user.email, subject, text });
    if (result.skipped) throw new AppError("The email could not be sent. Please check your SMTP settings.", 503);
  } else if (notificationChannel === "SMS") {
    if (!user.phone) throw new AppError("There is no phone number registered to this account", 400);
    const result = await smsService.sendSms({ to: user.phone, message: sms });
    if (result.skipped) throw new AppError("The SMS could not be sent. Please check your Twilio settings.", 503);
  } else throw new AppError("Invalid verification channel", 400);
  return { expiresAt, notificationChannel };
}

async function verifyOtp(userId, code, expectedPurpose) {
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) throw new AppError("User not found", 404);
  const now = new Date();
  if (user.otpBlockedUntil && user.otpBlockedUntil > now) throw new AppError("Too many verification attempts. Please try again later.", 429);
  if (!user.otpCode || !user.otpExpiresAt) throw new AppError("There is no pending verification code, please request a new one", 400);
  if (user.otpExpiresAt < now) throw new AppError("The verification code has expired, please request a new one", 400);
  const valid = await bcrypt.compare(String(code), user.otpCode);
  if (!valid) {
    const attempts = user.otpAttemptCount + 1;
    const blocked = attempts >= OTP_MAX_ATTEMPTS ? new Date(Date.now() + OTP_BLOCK_MINUTES * 60 * 1000) : null;
    await prisma.user.update({ where: { id: user.id }, data: { otpAttemptCount: attempts, otpBlockedUntil: blocked } });
    throw new AppError(blocked ? "Too many incorrect codes. Verification is temporarily blocked." : "Incorrect verification code", blocked ? 429 : 400);
  }
  const purpose = user.otpPurpose;
  if (expectedPurpose && purpose !== expectedPurpose) throw new AppError("The verification code is not valid for this operation", 400);
  const updateData = { otpCode: null, otpPurpose: null, otpExpiresAt: null, otpAttemptCount: 0, otpBlockedUntil: null };
  if (purpose === "REGISTER" && !user.contactVerifiedAt) updateData.contactVerifiedAt = now;
  const updated = await prisma.user.update({ where: { id: user.id }, data: updateData });
  return { user: updated, purpose };
}
module.exports = { generateAndSendOtp, verifyOtp };
