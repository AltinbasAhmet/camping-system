-- Security hardening: OTP abuse prevention and session invalidation
ALTER TABLE "User" ADD COLUMN "otpAttemptCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "otpLastSentAt" DATETIME;
ALTER TABLE "User" ADD COLUMN "otpBlockedUntil" DATETIME;
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;
