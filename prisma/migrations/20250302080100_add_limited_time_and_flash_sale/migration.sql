-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "flashSaleNote" TEXT,
ADD COLUMN     "flashSalePercent" INTEGER,
ADD COLUMN     "flashSalePrice" DOUBLE PRECISION,
ADD COLUMN     "isFlashSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLimitedTime" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "limitedEndDate" TIMESTAMP(3),
ADD COLUMN     "limitedStartDate" TIMESTAMP(3);
