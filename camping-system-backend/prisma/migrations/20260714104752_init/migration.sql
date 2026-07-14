/*
  Warnings:

  - Made the column `organizerId` on table `CampEvent` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CampEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "campId" INTEGER NOT NULL,
    "organizerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateTime" DATETIME NOT NULL,
    "capacity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CampEvent_campId_fkey" FOREIGN KEY ("campId") REFERENCES "Camp" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CampEvent_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CampEvent" ("campId", "capacity", "createdAt", "dateTime", "description", "id", "organizerId", "price", "title", "updatedAt") SELECT "campId", "capacity", "createdAt", "dateTime", "description", "id", "organizerId", "price", "title", "updatedAt" FROM "CampEvent";
DROP TABLE "CampEvent";
ALTER TABLE "new_CampEvent" RENAME TO "CampEvent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
