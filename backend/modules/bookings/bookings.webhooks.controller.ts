import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { confirmBookingPayment } from './bookings.payments.js'
import { verifyPaystackSignature, verifyPaystackTransaction } from './providers/paystack.services.js'

type PaystackEvent = { event?: string; data?: { reference?: string } }

export const paystackWebhookController = asyncHandler(async (req: Request, res: Response) => {
  const rawBody: unknown = req.body

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
  const result = await confirmBookingPayment({
    providerReference: reference,
    amountMinor: transaction.amountMinor,
    currency: transaction.currency,
    providerPaymentId: transaction.providerPaymentId,
  })

  // Next step: when result.outcome === 'paid', start creating the Duffel order here

  res.status(200).json({ received: true, outcome: result.outcome })
})