-- CreateTable
CREATE TABLE "ServiceCustomOption" (
    "id" TEXT NOT NULL,
    "bodyPart" TEXT,
    "customDuration" INTEGER,
    "customPrice" DOUBLE PRECISION,
    "serviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCustomOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ServiceCustomOption" ADD CONSTRAINT "ServiceCustomOption_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
