import { AppError } from '../../utils/appError.js'
import {
  claimBookingForRefund,
  findBookingByReference,
  markBookingRefunded,
  releaseBookingRefund,
} from './bookings.repo.js'
import { createPaystackRefund } from './providers/paystack.services.js'
import type { RefundResult } from './providers/refund.types.js'
import { createStripeRefund } from './providers/stripe.services.js'

type RefundOptions = {
  // Only needed when a previous ticket attempt may actually have worked
  confirmNoDuffelOrder: boolean
}

/**
 * Refunds the full payment of a REFUND_REQUIRED booking through the provider that took it.
 *
 * The booking moves REFUND_REQUIRED -> REFUNDING before the provider is called, so two people
 * (or two clicks) can never start two refunds. If we can't tell whether the provider accepted
 * the refund, the booking is deliberately left in REFUNDING for a person to check.
 */
export const refundBooking = async (reference: string, options: RefundOptions) => {
  const booking = await findBookingByReference(reference)
  if (!booking) throw new AppError('Booking not found', 404)

  if (booking.status === 'REFUNDED') {
    throw new AppError('This booking has already been refunded', 409)
  }

  if (booking.status === 'REFUNDING') {
    throw new AppError(
      'A refund for this booking is in progress, or its result is unknown. Check the provider dashboard',
      409,
    )
  }

  if (booking.status !== 'REFUND_REQUIRED') {
    throw new AppError(`Only REFUND_REQUIRED bookings can be refunded (this one is ${booking.status})`, 409)
  }

  // A ticket exists at the airline. Refunding the customer now would lose both money and seat
  if (booking.duffelOrderId) {
    throw new AppError('This booking has a Duffel order, so a ticket may exist. Check Duffel first', 409)
  }

  if (booking.failureReason === 'check_duffel_for_existing_order' && !options.confirmNoDuffelOrder) {
    throw new AppError(
      'An earlier attempt may have created a ticket. Check Duffel for an order. If there is none, send {"confirmNoDuffelOrder": true}',
      409,
    )
  }

  const isStripe = booking.paymentProvider === 'STRIPE'

  // Stripe refunds the payment intent. Paystack refunds by the reference we gave it
  const providerPayment = isStripe ? booking.providerPaymentId : booking.providerReference
  if (!providerPayment) throw new AppError('This booking has no payment to refund against', 422)

  const claimed = await claimBookingForRefund(booking.id)
  if (claimed.count === 0) throw new AppError('Another refund is already running for this booking', 409)

  let result: RefundResult

  try {
    result = isStripe
      ? await createStripeRefund(providerPayment, booking.reference, `refund-${booking.id}`)
      : await createPaystackRefund(providerPayment, `Booking ${booking.reference}: ${booking.failureReason ?? 'refund'}`)
  } catch (error) {
    // The provider functions return results instead of throwing, so we truly don't know what happened
    console.error(`[REFUND] unexpected error for ${booking.reference}:`, error)
    result = { ok: false, definite: false, message: 'Unexpected error while refunding' }
  }

  if (!result.ok) {
    if (result.definite) {
      await releaseBookingRefund(booking.id)
      console.error(`[REFUND] ${booking.reference} refused by the provider: ${result.message}`)
      throw new AppError(`The provider refused the refund: ${result.message}`, 422)
    }

    console.error(`CRITICAL: refund outcome unknown for ${booking.reference}: ${result.message}`)
    throw new AppError(
      'We could not confirm the refund. The booking is left in REFUNDING. Check the provider dashboard before doing anything else',
      502,
    )
  }

  try {
    await markBookingRefunded(booking.id, result.refundId, result.status)
  } catch (error) {
    // The money is on its way back but we couldn't record it. The booking stays in REFUNDING,
    // which blocks a second refund
    console.error(
      `CRITICAL: refund ${result.refundId} created for ${booking.reference} but could not be saved`,
      error,
    )
  }

  console.log(`[REFUND] ${booking.reference} refunded via ${booking.paymentProvider} (${result.status})`)

  return {
    reference: booking.reference,
    provider: booking.paymentProvider,
    refundId: result.refundId,
    refundStatus: result.status,
    note: isStripe
      ? 'Stripe does not return its processing fee on refunds.'
      : 'Paystack finishes refunds later. Watch its dashboard for processed or needs-attention.',
  }
}