-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('PAYSTACK', 'STRIPE');

-- Rename instead of drop and re-add, so any existing data is kept
ALTER TABLE "bookings" RENAME COLUMN "paystackReference" TO "providerReference";
ALTER INDEX "bookings_paystackReference_key" RENAME TO "bookings_providerReference_key";

-- Add the new columns. The default fills any existing rows, then is removed
ALTER TABLE "bookings"
  ADD COLUMN "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'PAYSTACK',
  ADD COLUMN "providerPaymentId" TEXT;

ALTER TABLE "bookings" ALTER COLUMN "paymentProvider" DROP DEFAULT;