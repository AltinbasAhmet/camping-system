-- Kayıt/giriş OTP doğrulaması için User'a alanlar eklenir.
ALTER TABLE "User" ADD COLUMN "contactVerifiedAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "otpCode" TEXT;
ALTER TABLE "User" ADD COLUMN "otpPurpose" TEXT;
ALTER TABLE "User" ADD COLUMN "otpExpiresAt" DATETIME;

-- Var olan kullanıcılar zaten aktif olarak kullanılıyor; geriye dönük
-- olarak doğrulanmış sayılırlar ki mevcut hesaplar giriş yapmaya devam
-- edebilsin.
UPDATE "User" SET "contactVerifiedAt" = CURRENT_TIMESTAMP WHERE "contactVerifiedAt" IS NULL;

-- Check-in/check-out hatırlatmalarının tekrar gönderilmesini önlemek için.
ALTER TABLE "CampReservation" ADD COLUMN "checkInReminderSentAt" DATETIME;
ALTER TABLE "CampReservation" ADD COLUMN "checkOutReminderSentAt" DATETIME;
