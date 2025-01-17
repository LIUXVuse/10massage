/*
  Warnings:

  - You are about to drop the `Masseur` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_masseurId_fkey";

-- DropForeignKey
ALTER TABLE "Masseur" DROP CONSTRAINT "Masseur_userId_fkey";

-- DropForeignKey
ALTER TABLE "MasseurService" DROP CONSTRAINT "MasseurService_masseurId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_masseurId_fkey";

-- DropTable
DROP TABLE "Masseur";

-- CreateTable
CREATE TABLE "masseurs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "imageScale" DOUBLE PRECISION DEFAULT 1,
    "imageX" DOUBLE PRECISION DEFAULT 0,
    "imageY" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "masseurs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "masseurs_userId_key" ON "masseurs"("userId");

-- AddForeignKey
ALTER TABLE "masseurs" ADD CONSTRAINT "masseurs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasseurService" ADD CONSTRAINT "MasseurService_masseurId_fkey" FOREIGN KEY ("masseurId") REFERENCES "masseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_masseurId_fkey" FOREIGN KEY ("masseurId") REFERENCES "masseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_masseurId_fkey" FOREIGN KEY ("masseurId") REFERENCES "masseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
