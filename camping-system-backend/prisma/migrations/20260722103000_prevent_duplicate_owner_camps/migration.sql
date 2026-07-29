-- Aynı owner için normalize edilmiş aynı kamp bilgisinin ikinci kez kaydedilmesini engeller.
ALTER TABLE "Camp" ADD COLUMN "duplicateKey" TEXT;
CREATE UNIQUE INDEX "Camp_ownerId_duplicateKey_key" ON "Camp"("ownerId", "duplicateKey");
