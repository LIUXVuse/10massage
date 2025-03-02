/*
  Warnings:

  - You are about to drop the column `flashSalePercent` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `flashSalePrice` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "flashSalePercent",
DROP COLUMN "flashSalePrice",
ADD COLUMN     "limitedDiscountPercent" INTEGER,
ADD COLUMN     "limitedNote" TEXT,
ADD COLUMN     "limitedSpecialPrice" DOUBLE PRECISION;
