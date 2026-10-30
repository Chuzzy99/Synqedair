import type { Request, Response } from 'express'
import type Stripe from 'stripe'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { confirmBookingPayment } from './bookings.payments.js'
import { fulfillBooking } from './bookings.fufilments.js'
import { recordStripeReceiptLater } from './bookings.receipts.js'
import { verifyPaystackSignature, verifyPaystackTransaction } from './providers/paystack.services.js'
import { constructStripeEvent, retrieveStripePayment } from './providers/stripe.services.js'

type PaystackEvent = { event?: string; data?: { reference?: string } }

export const paystackWebhookController = asyncHandler(async (req: Request, res: Response) => {
  const rawBody: unknown = req.body

  console.log('[PAYSTACK WEBHOOK] HIT', {
    time: new Date().toISOString(),
    method: req.method,
    contentType: req.headers['content-type'],
  })

  // 1. Only Paystack can produce a valid signature
  if (!Buffer.isBuffer(rawBody) || !verifyPaystackSignature(rawBody, req.header('x-paystack-signature'))) {
    res.status(401).json({ success: false, message: 'Invalid signature' })
    return
  }

  let event: PaystackEvent

  try {
    event = JSON.parse(rawBody.toString('utf8')) as PaystackEvent
  } catch {
    res.status(400).json({ success: false, message: 'Invalid body' })
    return
  }

  // 2. We only act on successful charges. Everything else is acknowledged and ignored
  const reference = event.data?.reference

  if (event.event !== 'charge.success' || typeof reference !== 'string') {
    res.status(200).json({ received: true })
    return
  }

  // 3. Don't trust the webhook body. Ask Paystack what really happened
  //    (an error here returns 5xx, so Paystack retries later)
  const transaction = await verifyPaystackTransaction(reference)

  if (!transaction || transaction.status !== 'success') {
    res.status(200).json({ received: true })
    return
  }

  // 4. Match it to our booking and mark it paid, once
  console.log('[WEBHOOK] confirming payment', { reference, at: new Date().toISOString() })

   const result = await confirmBookingPayment({
    providerReference: reference,
    amountMinor: transaction.amountMinor,
    currency: transaction.currency,
    providerPaymentId: transaction.providerPaymentId,
    providerFeeMinor: transaction.feeMinor,
    netReceivedMinor: transaction.netMinor,
  })

  console.log('[WEBHOOK] confirm result', { reference, ...result, at: new Date().toISOString() })

  // Reply to Paystack right away, then book in the background. Duffel can take several seconds
  if (result.bookingId && (result.outcome === 'paid' || result.outcome === 'already_processed')) {
    console.log('[WEBHOOK] starting fulfilment', result.bookingId, new Date().toISOString())
    void fulfillBooking(result.bookingId)
      .then((outcome) =>
        console.log('[WEBHOOK] fulfilment finished', result.bookingId, outcome, new Date().toISOString()),
      )
      .catch((error) => console.error('Fulfillment error:', error))
  } else {
    console.log('[WEBHOOK] NOT starting fulfilment, outcome was', result.outcome)
  }

  res.status(200).json({ received: true, outcome: result.outcome })
})

// Stripe tells us a Checkout Session was paid. The async event only matters if a
// delayed payment method is ever switched on, but handling it costs nothing
const STRIPE_PAID_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
])

export const stripeWebhookController = asyncHandler(async (req: Request, res: Response) => {
  const rawBody: unknown = req.body

  console.log('[STRIPE WEBHOOK] HIT', {
    time: new Date().toISOString(),
    method: req.method,
    contentType: req.headers['content-type'],
  })

  // 1. Only Stripe can produce a valid signature
  const event = Buffer.isBuffer(rawBody)
    ? constructStripeEvent(rawBody, req.header('stripe-signature'))
    : null

  if (!event) {
    res.status(401).json({ success: false, message: 'Invalid signature' })
    return
  }

  // 2. We only act on paid sessions. Everything else is acknowledged and ignored
  if (!STRIPE_PAID_EVENTS.has(event.type)) {
    res.status(200).json({ received: true })
    return
  }

  const sessionId = (event.data.object as Stripe.Checkout.Session).id

  // 3. Don't trust the webhook body. Ask Stripe what really happened
  //    (an error here returns 5xx, so Stripe retries later)
  const payment = await retrieveStripePayment(sessionId)

  if (!payment || !payment.paid || !payment.providerReference) {
    res.status(200).json({ received: true })
    return
  }

  // 4. Match it to our booking and mark it paid, once
  console.log('[STRIPE WEBHOOK] confirming payment', {
    reference: payment.providerReference,
    at: new Date().toISOString(),
  })

  const result = await confirmBookingPayment({
    providerReference: payment.providerReference,
    amountMinor: payment.amountMinor,
    currency: payment.currency,
    providerPaymentId: payment.providerPaymentId,
    providerFeeMinor: payment.feeMinor,
    netReceivedMinor: payment.netMinor,
  })

  console.log('[STRIPE WEBHOOK] confirm result', {
    reference: payment.providerReference,
    ...result,
    at: new Date().toISOString(),
  })

  // Stripe sometimes hasn't recorded the fee yet. Fetch it in the background and save it
  if (result.outcome === 'paid' && result.bookingId && payment.netMinor === null) {
    void recordStripeReceiptLater(result.bookingId, payment.providerPaymentId, payment.currency).catch(
      (error) => console.error('Receipt recording failed:', error),
    )
  }

  // Reply to Stripe right away, then book in the background. Duffel can take several seconds
  if (result.bookingId && (result.outcome === 'paid' || result.outcome === 'already_processed')) {
    void fulfillBooking(result.bookingId)
      .then((outcome) => console.log('[STRIPE WEBHOOK] fulfilment finished', result.bookingId, outcome))
      .catch((error) => console.error('Fulfillment error:', error))
  } else {
    console.log('[STRIPE WEBHOOK] NOT starting fulfilment, outcome was', result.outcome)
  }

  res.status(200).json({ received: true, outcome: result.outcome })
})