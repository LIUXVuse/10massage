/*
  Warnings:

  - You are about to drop the `ServiceCustomOption` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceCustomOption" DROP CONSTRAINT "ServiceCustomOption_serviceId_fkey";

-- DropTable
DROP TABLE "ServiceCustomOption";

-- CreateTable
CREATE TABLE "CustomOption" (
    "id" TEXT NOT NULL,
    "bodyPart" TEXT,
    "customDuration" INTEGER,
    "customPrice" DOUBLE PRECISION,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomOption" ADD CONSTRAINT "CustomOption_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
