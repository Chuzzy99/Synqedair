import { isEmailConfigured, sendEmail } from '../alerts/email.services.js'
import {
  claimRefundAlert,
  findBookingsNeedingRefundAlert,
  releaseRefundAlert,
} from './bookings.repo.js'

type AlertBooking = Awaited<ReturnType<typeof findBookingsNeedingRefundAlert>>[number]

export type RefundAlertSummary = {
  skipped: boolean
  sent: number
  failed: number
}

// Every currency we charge in (NGN, USD, GBP, EUR) has 2 decimal places
const formatAmount = (amountMinor: bigint, currency: string) =>
  `${(Number(amountMinor) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`

// No names, emails or passport details. Just what you need to find the booking and the payment
const buildEmail = (booking: AlertBooking) => ({
  subject: `Refund required: ${booking.reference}`,
  text: [
    'A customer has paid but cannot be ticketed. Check it and refund them.',
    '',
    `Booking: ${booking.reference}`,
    `Reason: ${booking.failureReason ?? 'unknown'}`,
    `Provider: ${booking.paymentProvider}`,
    `Amount: ${formatAmount(booking.chargeAmountMinor, booking.chargeCurrency)}`,
    `Payment ID: ${booking.providerPaymentId ?? 'none'}`,
    `Paid at: ${booking.paidAt?.toISOString() ?? 'unknown'}`,
  ].join('\n'),
})

let alerting = false

/**
 * Tells you about every booking that has landed in REFUND_REQUIRED.
 * It reads the database rather than hooking each place that sets the status,
 * so no path can be missed, and a failed delivery is retried on the next run.
 */
export const sendRefundAlerts = async (): Promise<RefundAlertSummary> => {
  const summary: RefundAlertSummary = { skipped: false, sent: 0, failed: 0 }

  if (alerting) return { ...summary, skipped: true }
  alerting = true

  try {
    const bookings = await findBookingsNeedingRefundAlert()
    if (bookings.length === 0) return summary

    if (!isEmailConfigured()) {
      console.error(
        `[ALERT] ${bookings.length} booking(s) need a refund but BREVO_API_KEY / ALERT_EMAIL_FROM / ALERT_EMAIL_TO are not set`,
      )
      summary.failed = bookings.length
      return summary
    }

    for (const booking of bookings) {
      // Claim first, so overlapping runs can't send the same alert twice
      const { count } = await claimRefundAlert(booking.id)
      if (count === 0) continue

      const { subject, text } = buildEmail(booking)
      const delivered = await sendEmail(subject, text)

      if (delivered) {
        summary.sent++
        console.log(`[ALERT] refund alert sent for ${booking.reference}`)
      } else {
        summary.failed++
        await releaseRefundAlert(booking.id)
      }
    }

    return summary
  } finally {
    alerting = false
  }
}