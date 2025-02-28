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
