/*
  Warnings:

  - A unique constraint covering the columns `[provider_session_id]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "provider_session_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_provider_session_id_key" ON "bookings"("provider_session_id");
