import { PrismaClient } from "@prisma/client";
import { paymentService } from "@/lib/payments";
import { createDuffelOrder, DuffelApiError } from "@/lib/duffel/client";

const prisma = new PrismaClient();

export class BookingService {
  /**
   * Called by the Stripe webhook after `payment_intent.amount_capturable_updated`
   * (i.e. the card has been successfully authorised, funds are on hold).
   *
   * Flow:
   *   1. Load the Booking + its authorised PaymentIntent from the DB.
   *   2. Parse the stored passenger / offer details.
   *   3. Call Duffel to create a confirmed order (ticket issuance).
   *   4a. SUCCESS → save the Duffel order ID + PNR, then capture the PaymentIntent.
   *   4b. FAILURE → cancel/void the Stripe authorisation, mark booking FAILED.
   *       The customer's card hold is released automatically; they are never charged.
   */
  async processAuthorizedBooking(bookingId: string): Promise<void> {
    // ── 1. Load booking ────────────────────────────────────────────────────────
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { paymentIntents: true },
    });

    if (!booking) {
      console.error(`[BookingService] Booking ${bookingId} not found.`);
      throw new Error(`Booking ${bookingId} not found`);
    }

    if (booking.status !== "AUTHORIZED") {
      console.warn(
        `[BookingService] Booking ${bookingId} is in state "${booking.status}"; ` +
          `expected AUTHORIZED. Skipping.`
      );
      return;
    }

    // Take the first (and only) PaymentIntent for this booking.
    const intent = booking.paymentIntents[0];
    if (!intent || intent.status !== "REQUIRES_CAPTURE") {
      const msg =
        `[BookingService] No capturable PaymentIntent for booking ${bookingId}. ` +
        `Intent status: ${intent?.status ?? "none"}`;
      console.error(msg);
      throw new Error(msg);
    }

    // ── 2. Parse stored data ───────────────────────────────────────────────────
    let parsedDetails: { passengers?: Array<Record<string, string>>; services?: Array<{ id: string; quantity: number }> } = {};
    try {
      parsedDetails = JSON.parse(booking.passengerDetails ?? "{}");
    } catch {
      console.error(`[BookingService] Failed to parse passengerDetails for booking ${bookingId}`);
    }

    const rawPassengers = parsedDetails.passengers ?? [];
    const services = parsedDetails.services ?? [];
    const offerId = booking.offerId;

    if (!offerId) {
      console.error(`[BookingService] Booking ${bookingId} has no offerId.`);
      await this.cancelBooking(bookingId, intent.provider, intent.providerId, "No offerId stored");
      return;
    }

    if (rawPassengers.length === 0) {
      console.error(`[BookingService] Booking ${bookingId} has no passengers.`);
      await this.cancelBooking(bookingId, intent.provider, intent.providerId, "No passengers stored");
      return;
    }

    // ── 3. Create Duffel order ─────────────────────────────────────────────────
    //
    // CURRENCY NOTE:
    //   `booking.currency`    = the cardholder's local currency (e.g. NGN, GHS).
    //                           This is what the customer paid via Stripe/Paystack.
    //   `booking.totalAmount` = the amount in the *smallest unit* of that currency.
    //
    //   Duffel is paid from our pre-funded Duffel balance in the offer's own
    //   currency (almost always USD). We store `booking.totalAmount` as the
    //   raw Duffel offer amount × 100 (cents), so we convert it back here.
    //   If the offer currency differs from the charge currency, `settlementCurrency`
    //   should still be "USD" (or whatever the Duffel offer was priced in).
    //
    //   The DUFFEL_SETTLEMENT_CURRENCY env var lets you override the default of
    //   "USD" for future multi-currency Duffel accounts.
    const settlementCurrency =
      process.env.DUFFEL_SETTLEMENT_CURRENCY ?? "USD";

    // totalAmount is stored in smallest unit (cents). Convert back to decimal string.
    const settlementAmount = (booking.totalAmount / 100).toFixed(2);

    try {
      console.info(
        `[BookingService] Issuing ticket for booking ${bookingId} ` +
          `via Duffel offer ${offerId}…`
      );

      const duffelOrder = await createDuffelOrder({
        offerId,
        rawPassengers,
        services: services.map((s) => ({ id: s.id, quantity: s.quantity })),
        settlementCurrency,
        settlementAmount,
      });

      // ── 4a. Ticketing succeeded ──────────────────────────────────────────────
      const pnr = duffelOrder.booking_reference;
      const ticketNumbers = duffelOrder.documents
        .map((d) => d.unique_identifier)
        .join(",");

      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          pnr,
          // Store the Duffel order ID and ticket numbers in metadata field.
          // We reuse passengerDetails as a JSON blob to avoid schema migrations
          // for this iteration; a dedicated `duffelOrderId` column can be added later.
          passengerDetails: JSON.stringify({
            ...parsedDetails,
            _duffelOrderId: duffelOrder.id,
            _ticketNumbers: ticketNumbers,
          }),
        },
      });

      console.info(
        `[BookingService] Ticket issued for booking ${bookingId}: ` +
          `PNR=${pnr}, DuffelOrderId=${duffelOrder.id}, Tickets=${ticketNumbers}`
      );

      // ── 5. Capture the payment ───────────────────────────────────────────────
      const captured = await paymentService.capture(intent.provider, intent.providerId);

      if (!captured) {
        // Extremely rare: Duffel already ticketed but Stripe capture failed.
        // Log critical — ops team must reconcile manually.
        console.error(
          `[BookingService] CRITICAL: Ticket issued (PNR=${pnr}) but Stripe capture ` +
            `FAILED for booking ${bookingId}, PaymentIntent ${intent.providerId}. ` +
            `Manual reconciliation required.`
        );
        // Do NOT cancel the booking — ticket is already issued.
        // The `payment_intent.succeeded` webhook won't fire, so we proactively mark CONFIRMED.
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: "CONFIRMED" },
        });
        return;
      }

      console.info(
        `[BookingService] Payment captured for booking ${bookingId}. ` +
          `Booking CONFIRMED.`
      );
      // The Stripe `payment_intent.succeeded` webhook will also update
      // the booking to CONFIRMED. That's idempotent — no harm.

    } catch (error) {
      // ── 4b. Ticketing failed → void the auth ──────────────────────────────
      const reason =
        error instanceof DuffelApiError
          ? `Duffel error ${error.status}: ${error.message}`
          : String(error);

      console.error(
        `[BookingService] Ticketing FAILED for booking ${bookingId}: ${reason}`
      );

      await this.cancelBooking(bookingId, intent.provider, intent.providerId, reason);
    }
  }

  /**
   * Voids the payment authorisation and marks the booking as CANCELLED.
   * Safe to call on Stripe (cancel the PaymentIntent) or Paystack.
   * The cardholder's hold is released automatically — they are never charged.
   */
  private async cancelBooking(
    bookingId: string,
    provider: string,
    providerId: string,
    reason: string
  ): Promise<void> {
    try {
      await paymentService.cancel(provider, providerId);
      console.info(
        `[BookingService] Authorization voided for booking ${bookingId} ` +
          `(${provider} ${providerId}). Reason: ${reason}`
      );
    } catch (cancelErr) {
      console.error(
        `[BookingService] Failed to void authorization for booking ${bookingId}: `,
        cancelErr
      );
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    console.info(`[BookingService] Booking ${bookingId} marked CANCELLED.`);
  }
}

export const bookingService = new BookingService();
