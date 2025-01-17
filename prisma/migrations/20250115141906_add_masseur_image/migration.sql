/*
  Warnings:

  - You are about to drop the column `endTime` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `isPaid` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Service` table. All the data in the column will be lost.
  - Added the required column `datetime` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Service` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "endTime",
DROP COLUMN "isPaid",
DROP COLUMN "notes",
DROP COLUMN "startTime",
ADD COLUMN     "datetime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "durationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Masseur" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "isBooked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "duration",
DROP COLUMN "price",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'SINGLE',
ALTER COLUMN "description" SET NOT NULL;

-- CreateTable
CREATE TABLE "ServiceDuration" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceDuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComboServiceItem" (
    "id" TEXT NOT NULL,
    "comboServiceId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComboServiceItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceDuration" ADD CONSTRAINT "ServiceDuration_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboServiceItem" ADD CONSTRAINT "ComboServiceItem_comboServiceId_fkey" FOREIGN KEY ("comboServiceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComboServiceItem" ADD CONSTRAINT "ComboServiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_durationId_fkey" FOREIGN KEY ("durationId") REFERENCES "ServiceDuration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
