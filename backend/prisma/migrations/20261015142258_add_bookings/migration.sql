-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'BOOKED', 'FAILED', 'EXPIRED', 'REFUND_REQUIRED');

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "userId" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "failureReason" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "leadLastName" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "offerExpiresAt" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL,
    "airlineAmountMinor" INTEGER NOT NULL,
    "serviceFeeMinor" INTEGER NOT NULL,
    "extrasMinor" INTEGER NOT NULL DEFAULT 0,
    "totalMinor" INTEGER NOT NULL,
    "chargeCurrency" TEXT NOT NULL,
    "chargeAmountMinor" BIGINT NOT NULL,
    "exchangeRate" DECIMAL(18,8),
    "paystackReference" TEXT,
    "paidAt" TIMESTAMP(3),
    "duffelOrderId" TEXT,
    "airlineBookingReference" TEXT,
    "bookedAt" TIMESTAMP(3),
    "passengers" JSONB NOT NULL,
    "services" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_reference_key" ON "bookings"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_paystackReference_key" ON "bookings"("paystackReference");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_duffelOrderId_key" ON "bookings"("duffelOrderId");

-- CreateIndex
CREATE INDEX "bookings_contactEmail_leadLastName_idx" ON "bookings"("contactEmail", "leadLastName");

-- CreateIndex
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId");

-- CreateIndex
CREATE INDEX "bookings_status_createdAt_idx" ON "bookings"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
