-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "fulfillmentAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fulfillmentLockedAt" TIMESTAMP(3);
