import {
  PENDING_PAYMENT_EXPIRE_AFTER_MINUTES,
} from './bookings.constants.js'
import { fulfillBooking } from './bookings.fufilments.js'
import { confirmBookingPayment } from './bookings.payments.js'
import { recordStripeReceiptLater } from './bookings.receipts.js'
import { findPendingPaymentBookings, markBookingExpired } from './bookings.repo.js'
import { verifyPaystackTransaction } from './providers/paystack.services.js'
import { retrieveStripePayment } from './providers/stripe.services.js'

type PendingBooking = Awaited<ReturnType<typeof findPendingPaymentBookings>>[number]
type ConfirmedPaymentInput = Parameters<typeof confirmBookingPayment>[0]

// What the provider told us about one booking
type Verdict =
  | { kind: 'paid'; payment: ConfirmedPaymentInput }
  | { kind: 'expired'; reason: string }
  | { kind: 'pending' }

export type ReconcileSummary = {
  skipped: boolean
  checked: number
  paid: number
  expired: number
  stillPending: number
  refundRequired: number
  errors: number
}

const isOlderThan = (date: Date, minutes: number) => Date.now() - date.getTime() > minutes * 60_000

// Unpaid and old enough: close it. A late payment can still revive it through the webhook
const expireIfOld = (booking: PendingBooking, reason: string): Verdict =>
  isOlderThan(booking.createdAt, PENDING_PAYMENT_EXPIRE_AFTER_MINUTES)
    ? { kind: 'expired', reason }
    : { kind: 'pending' }

const checkPaystack = async (booking: PendingBooking): Promise<Verdict> => {
  if (!booking.providerReference) return expireIfOld(booking, 'no_provider_reference')

  const transaction = await verifyPaystackTransaction(booking.providerReference)

  if (transaction?.status === 'success') {
    return {
      kind: 'paid',
      payment: {
        providerReference: booking.providerReference,
        amountMinor: transaction.amountMinor,
        currency: transaction.currency,
        providerPaymentId: transaction.providerPaymentId,
        providerFeeMinor: transaction.feeMinor,
        netReceivedMinor: transaction.netMinor,
      },
    }
  }

  // null = Paystack never saw the customer pay. Anything else that isn't success is unpaid too
  return expireIfOld(booking, 'payment_not_completed')
}

const checkStripe = async (booking: PendingBooking): Promise<Verdict> => {
  if (!booking.providerReference) return expireIfOld(booking, 'no_provider_reference')

  // Without the session id we can't ask Stripe. The webhook is still the way this one gets paid
  if (!booking.providerSessionId) {
    console.warn(`[RECONCILE] ${booking.reference} has no Stripe session id`)
    return expireIfOld(booking, 'no_checkout_session')
  }

  const payment = await retrieveStripePayment(booking.providerSessionId)

  if (payment?.paid) {
    // The session must belong to this booking. If not, something is badly wrong, so don't guess
    if (payment.providerReference !== booking.providerReference) {
      throw new Error(`Stripe session reference mismatch on ${booking.reference}`)
    }

    return {
      kind: 'paid',
      payment: {
        providerReference: booking.providerReference,
        amountMinor: payment.amountMinor,
        currency: payment.currency,
        providerPaymentId: payment.providerPaymentId,
        providerFeeMinor: payment.feeMinor,
        netReceivedMinor: payment.netMinor,
      },
    }
  }

  // Stripe closed the session because the customer ran out of time
  if (payment?.sessionStatus === 'expired') return { kind: 'expired', reason: 'checkout_expired' }

  // Stripe doesn't know the session, or it is still open
  return expireIfOld(booking, payment ? 'payment_not_completed' : 'checkout_session_not_found')
}

const checkWithProvider = (booking: PendingBooking): Promise<Verdict> =>
  booking.paymentProvider === 'STRIPE' ? checkStripe(booking) : checkPaystack(booking)

let reconciling = false

/**
 * Finds bookings still waiting for payment whose webhook never arrived, asks the provider
 * what really happened, then confirms and fulfils the paid ones and closes the abandoned ones.
 * Safe to run as often as you like: every database change is atomic, so a webhook
 * arriving at the same moment can never double-pay or double-book.
 */
export const reconcilePendingPayments = async (): Promise<ReconcileSummary> => {
  const summary: ReconcileSummary = {
    skipped: false,
    checked: 0,
    paid: 0,
    expired: 0,
    stillPending: 0,
    refundRequired: 0,
    errors: 0,
  }

  if (reconciling) return { ...summary, skipped: true }
  reconciling = true

  try {
    const pending = await findPendingPaymentBookings()

    for (const booking of pending) {
      summary.checked++

      try {
        const verdict = await checkWithProvider(booking)

        if (verdict.kind === 'pending') {
          summary.stillPending++
          continue
        }

        if (verdict.kind === 'expired') {
          const { count } = await markBookingExpired(booking.id, verdict.reason)
          summary.expired += count
          console.log(`[RECONCILE] ${booking.reference} expired (${verdict.reason})`)
          continue
        }

        const result = await confirmBookingPayment(verdict.payment)

        console.log(`[RECONCILE] ${booking.reference} confirm result`, result.outcome)

        if (result.outcome === 'amount_mismatch') {
          summary.refundRequired++
          continue
        }

        if (result.outcome === 'unknown_booking') {
          summary.errors++
          continue
        }

        if (result.outcome === 'paid') summary.paid++

        // Stripe sometimes hasn't recorded its fee yet. Fetch it in the background
        if (
          result.outcome === 'paid' &&
          booking.paymentProvider === 'STRIPE' &&
          verdict.payment.netReceivedMinor == null
        ) {
          void recordStripeReceiptLater(
            booking.id,
            verdict.payment.providerPaymentId,
            verdict.payment.currency,
          ).catch((error) => console.error('Receipt recording failed:', error))
        }

        // Book in the background, same as the webhook. Duffel can take several seconds,
        // and the fulfilment sweeper catches anything that fails
        void fulfillBooking(booking.id)
          .then((outcome) => console.log(`[RECONCILE] fulfilment finished`, booking.reference, outcome))
          .catch((error) => console.error('Fulfillment error:', error))
      } catch (error) {
        summary.errors++
        console.error(
          `[RECONCILE] failed on ${booking.reference}:`,
          error instanceof Error ? error.message : error,
        )
      }
    }

    return summary
  } finally {
    reconciling = false
  }
}