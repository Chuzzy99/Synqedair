import Stripe from 'stripe'
import { env } from '../../../config/env.js'
import { AppError } from '../../../utils/appError.js'

const STRIPE_TIMEOUT_MS = 15000

// Stripe's minimum is 30 minutes. Keeps an unpaid session from outliving the fare
const CHECKOUT_LIFETIME_MINUTES = 35

// Stripe's fixed fee per charge, in minor units. US account pricing is 30 cents (USD).
// GBP and EUR are approximate equivalents. Tune them against real payments
const STRIPE_FIXED_FEE_MINOR: Record<string, number> = {
  USD: 30,
  GBP: 25,
  EUR: 28,
}

// Stripe adds +1% when the charge currency differs from our settlement currency (USD)
const CURRENCY_CONVERSION_PERCENT = 1

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  timeout: STRIPE_TIMEOUT_MS,
  maxNetworkRetries: 1,
})

/**
 * Adds Stripe's fee on top of the amount we want to receive.
 * Stripe takes (percent x charge + fixed) from the charge, so we solve for the charge:
 * charge = (net + fixed) / (1 - percent), rounded UP so we never receive less than net.
 */
export const addStripeFee = (currency: string, netMinor: number) => {
  const fixed = STRIPE_FIXED_FEE_MINOR[currency]

  if (fixed === undefined) {
    throw new AppError(`No Stripe fee configured for currency: ${currency}`, 500)
  }

  const percent =
    (env.STRIPE_FEE_PERCENT + (currency === 'USD' ? 0 : CURRENCY_CONVERSION_PERCENT)) / 100

  return BigInt(Math.ceil((netMinor + fixed) / (1 - percent)))
}

type CheckoutInput = {
  email: string
  amountMinor: bigint
  currency: string
  providerReference: string
  bookingReference: string
  successUrl: string
  cancelUrl: string
}

export const createStripeCheckoutSession = async (input: CheckoutInput) => {
  const amount = Number(input.amountMinor)

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new AppError('Invalid payment amount', 500)
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // Cards only (Apple Pay and Google Pay still work). Other methods such as
      // Klarna or Affirm cost far more and would break the fee gross-up
      payment_method_types: ['card'],
      customer_email: input.email,
      // Our own per-attempt reference. The webhook uses it to find the booking
      client_reference_id: input.providerReference,
      metadata: { bookingReference: input.bookingReference },
      payment_intent_data: { metadata: { bookingReference: input.bookingReference } },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: input.currency.toLowerCase(),
            unit_amount: amount,
            product_data: { name: `Flight booking ${input.bookingReference}` },
          },
        },
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_LIFETIME_MINUTES * 60,
    })

    if (!session.url) {
      console.error('Stripe session created without a url:', session.id)
      throw new AppError('We could not start your payment. Please try again.', 502)
    }

    return { paymentUrl: session.url, sessionId: session.id }
  } catch (error) {
    if (error instanceof AppError) throw error

    // Log the message only, never the full error object
    console.error('Stripe checkout failed:', error instanceof Error ? error.message : error)
    throw new AppError('We could not start your payment. Please try again.', 502)
  }
}

// Only Stripe can produce a valid signature. Returns null when it is missing or wrong
export const constructStripeEvent = (rawBody: Buffer, signature: string | undefined) => {
  if (!signature) return null

  try {
    return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return null
  }
}

// Asks Stripe directly what happened to a session. Returns null when Stripe doesn't know it
// Reads the fee and net amount Stripe booked for this charge. Null if Stripe hasn't recorded it yet
const readReceipt = (paymentIntent: Stripe.Checkout.Session['payment_intent'], currency: string) => {
  if (!paymentIntent || typeof paymentIntent === 'string') return null

  const charge = paymentIntent.latest_charge
  if (!charge || typeof charge === 'string') return null

  const transaction = charge.balance_transaction
  if (!transaction || typeof transaction === 'string') return null

  // Only comparable when Stripe settled in the same currency we charged
  if (transaction.currency.toUpperCase() !== currency) return null

  return { feeMinor: BigInt(transaction.fee), netMinor: BigInt(transaction.net) }
}

// Asks Stripe directly what happened to a session. Returns null when Stripe doesn't know it
export const retrieveStripePayment = async (sessionId: string) => {
  let session: Stripe.Checkout.Session

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent.latest_charge.balance_transaction'],
    })
  } catch (error) {
    if (
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      error.code === 'resource_missing'
    ) {
      return null
    }

    throw new AppError('Could not verify the payment', 502)
  }

  const paid = session.payment_status === 'paid'

  const paymentIntentId =
    typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id

  if (paid && (session.amount_total === null || !session.currency || !paymentIntentId)) {
    throw new AppError('Could not verify the payment', 502)
  }

  const currency = (session.currency ?? '').toUpperCase()
  const receipt = readReceipt(session.payment_intent, currency)

  return {
    paid,
    providerReference: session.client_reference_id,
    amountMinor: BigInt(session.amount_total ?? 0),
    currency,
    providerPaymentId: paymentIntentId ?? '',
    feeMinor: receipt?.feeMinor ?? null,
    netMinor: receipt?.netMinor ?? null,
  }
}