const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const emailService = require("./email.service");
const smsService = require("./sms.service");

const OTP_TTL_MINUTES = 10;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Kullanıcıya yeni bir doğrulama kodu üretir, kaydeder ve e-posta/SMS
// olarak gönderir (her ikisi de varsa ikisine de, madde 4'teki gibi
// paralel ve birbirinden bağımsız).
async function generateAndSendOtp(user, purpose, notificationChannel) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: code, otpPurpose: purpose, otpExpiresAt: expiresAt }
  });

  const purposeText = purpose === "REGISTER" ? "hesabınızı doğrulamak" : "giriş yapmak";
  const subject = "CampPal doğrulama kodunuz";
  const text =
    `Merhaba ${user.name},\n\n` +
    `${purposeText} için doğrulama kodunuz: ${code}\n\n` +
    `Bu kod ${OTP_TTL_MINUTES} dakika içinde geçerliliğini yitirecektir. Bu işlemi siz yapmadıysanız bu mesajı yok sayabilirsiniz.`;
  const sms = `CampPal dogrulama kodunuz: ${code} (${OTP_TTL_MINUTES} dakika gecerli)`;

  if (notificationChannel === "EMAIL") {
    if (!user.email) throw new AppError("Bu hesapta kayıtlı e-posta adresi yok", 400);
    await emailService.sendEmail({ to: user.email, subject, text });
  } else if (notificationChannel === "SMS") {
    if (!user.phone) throw new AppError("Bu hesapta kayıtlı telefon numarası yok", 400);
    await smsService.sendSms({ to: user.phone, message: sms });
  } else {
    throw new AppError("Geçersiz doğrulama kanalı", 400);
  }

  return { expiresAt, notificationChannel };
}

// Girilen kodu doğrular; başarılıysa kodu tüketir (tekrar kullanılamaz).
async function verifyOtp(userId, code) {
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.otpCode || !user.otpExpiresAt) {
    throw new AppError("Bekleyen bir doğrulama kodu yok, yeni kod isteyin", 400);
  }

  if (user.otpExpiresAt < new Date()) {
    throw new AppError("Doğrulama kodunun süresi doldu, yeni kod isteyin", 400);
  }

  if (user.otpCode !== String(code)) {
    throw new AppError("Doğrulama kodu hatalı", 400);
  }

  const purpose = user.otpPurpose;

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
