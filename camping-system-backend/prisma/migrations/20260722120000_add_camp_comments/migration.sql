CREATE TABLE "CampComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "campId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CampComment_campId_fkey" FOREIGN KEY ("campId") REFERENCES "Camp" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CampComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "CampComment_campId_createdAt_idx" ON "CampComment"("campId", "createdAt");
CREATE INDEX "CampComment_userId_idx" ON "CampComment"("userId");
