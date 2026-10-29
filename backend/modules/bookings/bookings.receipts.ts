import { findBookingById, saveBookingReceipt } from './bookings.repo.js'
import { fetchStripeReceipt } from './providers/stripe.services.js'

// Stripe can take a few seconds to record the fee, so check again a few times
const RETRY_DELAYS_MS = [2_000, 5_000, 15_000, 30_000, 60_000]

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const recordStripeReceiptLater = async (
  bookingId: string,
  paymentIntentId: string,
  currency: string,
) => {
  for (const delay of RETRY_DELAYS_MS) {
    await wait(delay)

    const receipt = await fetchStripeReceipt(paymentIntentId, currency)
    if (!receipt) continue

    await saveBookingReceipt(bookingId, receipt.feeMinor, receipt.netMinor)

    const booking = await findBookingById(bookingId)

    if (
      booking &&
      booking.chargeCurrency === booking.currency &&
      receipt.netMinor < BigInt(booking.totalMinor)
    ) {
      console.error(
        `[MARGIN SHORTFALL] ${booking.reference}: received ${receipt.netMinor} but needed ${booking.totalMinor} ${booking.currency}`,
      )
    }

    return
  }

  console.error(`[RECEIPT] still no fee details after retries for booking ${bookingId}`)
}