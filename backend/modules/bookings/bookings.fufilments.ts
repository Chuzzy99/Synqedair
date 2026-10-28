import type { Prisma } from '@prisma/client'
import { MAX_FULFILLMENT_ATTEMPTS } from './bookings.constants.js'
import type { BookingPassenger } from './bookings.passengers.js'
import {
  claimBookingForFulfillment,
  failExhaustedBookings,
  findBookingById,
  findBookingsAwaitingFulfillment,
  markBookingBooked,
  markPaidBookingRefundRequired,
  releaseFulfillmentLock,
} from './bookings.repo.js'
import { createDuffelOrder, FulfillmentInputError } from './providers/duffel.orders.js'

export type FulfillmentOutcome = 'booked' | 'skipped' | 'retry_later' | 'refund_required'

const readDuffelError = (error: unknown) => {
  const e = error as { meta?: { status?: number }; errors?: { code?: string; message?: string }[] }

  return {
    status: e?.meta?.status,
    code: e?.errors?.[0]?.code,
    message: e?.errors?.[0]?.message,
  }
}

// Safe-to-log view of the passengers: no names, no passport details
const describePassengers = (passengers: unknown) => {
  if (!Array.isArray(passengers)) return passengers

  return (passengers as BookingPassenger[]).map((p) => ({
    id: p.id,
    type: p.type,
    bornOn: p.bornOn,
    hasPassport: Boolean(p.passport),
  }))
}

// Network problems and Duffel's own outages are worth retrying. Anything the airline rejected is not
const isTemporary = (status: number | undefined) =>
  status === undefined || status >= 500 || status === 429

export const fulfillBooking = async (bookingId: string): Promise<FulfillmentOutcome> => {
  console.log('[FULFIL] start', bookingId, new Date().toISOString())

  // Only one caller can win this. Everyone else walks away
  if (!(await claimBookingForFulfillment(bookingId))) {
    console.log('[FULFIL] claim refused, skipping', bookingId)
    return 'skipped'
  }

  const booking = await findBookingById(bookingId)
  if (!booking) {
    console.log('[FULFIL] booking not found', bookingId)
    return 'skipped'
  }

  try {
    console.log('[FULFIL] calling Duffel', booking.reference, 'attempt', booking.fulfillmentAttempts, new Date().toISOString())
    const order = await createDuffelOrder(booking)
    console.log('[FULFIL] Duffel returned', booking.reference, order.id, new Date().toISOString())

    try {
      // Passport details are no longer needed once the airline has them
      const passengers = (booking.passengers as unknown as BookingPassenger[]).map((p) => ({
        ...p,
        passport: null,
      }))

      const saved = await markBookingBooked(booking.id, {
        duffelOrderId: order.id,
        airlineBookingReference: order.bookingReference,
        passengers: passengers as unknown as Prisma.InputJsonValue,
      })
      console.log('[FULFIL] marked BOOKED', booking.reference, 'rows updated:', saved.count, new Date().toISOString())
    } catch (saveError) {
      // The ticket exists at Duffel but we couldn't record it. This must never be lost
      console.error(
        `CRITICAL: Duffel order ${order.id} created for ${booking.reference} but could not be saved`,
        saveError,
      )
    }

    return 'booked'
  } catch (error) {
    if (error instanceof FulfillmentInputError) {
      console.error(`Cannot build Duffel order for ${booking.reference}: ${error.message}`)
      console.error(`Passengers for ${booking.reference}:`, JSON.stringify(describePassengers(booking.passengers)))
      await markPaidBookingRefundRequired(booking.id, 'invalid_booking_data')
      return 'refund_required'
    }

    const { status, code, message } = readDuffelError(error)

    if (isTemporary(status) && booking.fulfillmentAttempts < MAX_FULFILLMENT_ATTEMPTS) {
      console.error(`Duffel order failed for ${booking.reference}, will retry:`, status ?? 'no status', code, message)
      console.error(`Raw fulfillment error for ${booking.reference}:`, error)
      await releaseFulfillmentLock(booking.id)
      return 'retry_later'
    }

    // A retry that finds the fare gone may mean the first attempt actually worked
    const reason =
      code === 'offer_no_longer_available' && booking.fulfillmentAttempts > 1
        ? 'check_duffel_for_existing_order'
        : isTemporary(status)
          ? 'duffel_retries_exhausted'
          : `duffel_${code ?? status ?? 'error'}`

    console.error(`Duffel order failed for ${booking.reference}, needs review (${reason}):`, message)
    console.error(`Passengers for ${booking.reference}:`, JSON.stringify(describePassengers(booking.passengers)))
    // Full Duffel errors array: includes a `source` pointer like /passengers/1/born_on
    console.error(`Duffel error detail for ${booking.reference}:`, JSON.stringify((error as { errors?: unknown })?.errors))
    await markPaidBookingRefundRequired(booking.id, reason)
    return 'refund_required'
  }
}

let sweeping = false

// Picks up paid bookings whose first attempt hit a temporary problem
export const retryStuckBookings = async () => {
  if (sweeping) return
  sweeping = true

  try {
    await failExhaustedBookings()

    const stuck = await findBookingsAwaitingFulfillment()
    if (stuck.length > 0) console.log('[SWEEP] found stuck bookings:', stuck.length, new Date().toISOString())

    for (const { id } of stuck) {
      await fulfillBooking(id).catch((error) => console.error('Fulfillment retry failed:', error))
    }
  } finally {
    sweeping = false
  }
}

export const startFulfillmentSweeper = () => {
  const timer = setInterval(() => {
    retryStuckBookings().catch((error) => console.error('Fulfillment sweep failed:', error))
  }, 60_000)

  timer.unref()
}