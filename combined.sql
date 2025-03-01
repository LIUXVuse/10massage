-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Masseur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "category" TEXT NOT NULL DEFAULT 'massage',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRecommend" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_MasseurToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MasseurToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Masseur" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MasseurToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_MasseurToService_AB_unique" ON "_MasseurToService"("A", "B");

-- CreateIndex
CREATE INDEX "_MasseurToService_B_index" ON "_MasseurToService"("B");
/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name", "role", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
-- AlterTable
ALTER TABLE "Masseur" ADD COLUMN "imageScale" REAL DEFAULT 1.0;
ALTER TABLE "Masseur" ADD COLUMN "imageX" REAL DEFAULT 0.0;
ALTER TABLE "Masseur" ADD COLUMN "imageY" REAL DEFAULT 0.0;
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Masseur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "imageScale" REAL DEFAULT 1.0,
    "imageX" REAL DEFAULT 0.0,
    "imageY" REAL DEFAULT 0.0,
    "cropX" REAL,
    "cropY" REAL,
    "cropWidth" REAL,
    "cropHeight" REAL,
    "description" TEXT,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 999,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Masseur" ("createdAt", "description", "experience", "id", "image", "imageScale", "imageX", "imageY", "isActive", "name", "updatedAt") SELECT "createdAt", "description", "experience", "id", "image", "imageScale", "imageX", "imageY", "isActive", "name", "updatedAt" FROM "Masseur";
DROP TABLE "Masseur";
ALTER TABLE "new_Masseur" RENAME TO "Masseur";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
