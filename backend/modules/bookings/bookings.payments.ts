import {
  findBookingByProviderReference,
  markBookingPaid,
  markBookingRefundRequired,
} from './bookings.repo.js'

type ConfirmedPayment = {
  providerReference: string
  amountMinor: bigint
  currency: string
  providerPaymentId: string
  providerFeeMinor?: bigint | null
  netReceivedMinor?: bigint | null
}

export type PaymentOutcome = 'paid' | 'already_processed' | 'unknown_booking' | 'amount_mismatch'

/**
 * Called only after a provider has confirmed a payment.
 * Checks the money matches what we asked for, then marks the booking paid exactly once.
 */
export const confirmBookingPayment = async (
  payment: ConfirmedPayment,
): Promise<{ outcome: PaymentOutcome; bookingId?: string }> => {
  const booking = await findBookingByProviderReference(payment.providerReference)

  if (!booking) {
    console.error('Payment received for an unknown reference:', payment.providerReference)
    return { outcome: 'unknown_booking' }
  }

  if (payment.amountMinor !== booking.chargeAmountMinor || payment.currency !== booking.chargeCurrency) {
    console.error(
      `Amount mismatch on ${booking.reference}: expected ${booking.chargeAmountMinor} ${booking.chargeCurrency}, got ${payment.amountMinor} ${payment.currency}`,
    )

    await markBookingRefundRequired(booking.id, 'amount_mismatch', payment.providerPaymentId)
    return { outcome: 'amount_mismatch', bookingId: booking.id }
  }

  const providerFeeMinor = payment.providerFeeMinor ?? null
  const netReceivedMinor = payment.netReceivedMinor ?? null

  const { count } = await markBookingPaid(booking.id, payment.providerPaymentId, {
    providerFeeMinor,
    netReceivedMinor,
  })

  if (count === 0) return { outcome: 'already_processed', bookingId: booking.id }

  if (netReceivedMinor === null) {
    console.warn(`[RECEIPT] no fee details yet for ${booking.reference}`)
  } else if (
    booking.chargeCurrency === booking.currency &&
    netReceivedMinor < BigInt(booking.totalMinor)
  ) {
    // We received less than airline + our fee + extras, so part of the service fee was lost
    console.error(
      `[MARGIN SHORTFALL] ${booking.reference}: received ${netReceivedMinor} but needed ${booking.totalMinor} ${booking.currency}`,
    )
  }

  return { outcome: 'paid', bookingId: booking.id }
}