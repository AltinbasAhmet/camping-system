-- Kampçıların da etkinlik oluşturabilmesi için CampEvent'e organizerId eklenir.
-- Mevcut kayıtlar geriye dönük olarak kampın sahibiyle doldurulur.
ALTER TABLE "CampEvent" ADD COLUMN "organizerId" INTEGER;

UPDATE "CampEvent"
SET "organizerId" = (SELECT "ownerId" FROM "Camp" WHERE "Camp"."id" = "CampEvent"."campId")
WHERE "organizerId" IS NULL;
