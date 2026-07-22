-- Kamp sahibi kayıtlarının admin onayına düşebilmesi için User tablosuna
-- verificationStatus alanı eklenir. Varsayılan APPROVED'dır; kayıt sırasında
-- rol CAMP_OWNER ise uygulama katmanı bunu PENDING olarak set eder.
ALTER TABLE "User" ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'APPROVED';
