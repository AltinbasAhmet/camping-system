-- RedefineTable: CampReservation now defaults to PENDING (owner approval
-- required) instead of CONFIRMED, and gains a respondedAt timestamp.
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_CampReservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "campId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "checkInDate" DATETIME NOT NULL,
    "checkOutDate" DATETIME NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "reservationCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "respondedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CampReservation_campId_fkey" FOREIGN KEY ("campId") REFERENCES "Camp" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CampReservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "new_CampReservation" ("id", "campId", "userId", "checkInDate", "checkOutDate", "plateNumber", "guestCount", "reservationCode", "status", "respondedAt", "createdAt", "updatedAt")
SELECT "id", "campId", "userId", "checkInDate", "checkOutDate", "plateNumber", "guestCount", "reservationCode", "status", NULL, "createdAt", "updatedAt" FROM "CampReservation";

DROP TABLE "CampReservation";

ALTER TABLE "new_CampReservation" RENAME TO "CampReservation";

CREATE UNIQUE INDEX "CampReservation_reservationCode_key" ON "CampReservation"("reservationCode");

PRAGMA foreign_keys=ON;
