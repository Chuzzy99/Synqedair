import { randomBytes } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import { AppError } from '../../utils/appError.js'
import { getFrontendUrl } from './bookings.config.js'
import { prepareBooking } from './bookings.prepare.js'
import { generateBookingReference } from './bookings.reference.js'
import {
  createBookingWithReference,
  findPaidBookingForOffer,
  markBookingFailed,
} from './bookings.repo.js'
import { getNgnQuote } from './fx.services.js'
import { initializePaystackTransaction } from './providers/paystack.services.js'
import {
  addStripeFee,
  createStripeCheckoutSession,
} from './providers/stripe.services.js'
import type { InitBookingInput } from './bookings.validation.js'

const ALREADY_BOOKED_MESSAGE = 'This fare has already been booked. Please search again.'

// A fresh reference for every payment attempt, separate from the customer-facing one
const newPaystackReference = () => `SQ-PS-${randomBytes(12).toString('hex')}`
const newStripeReference = () => `SQ-ST-${randomBytes(12).toString('hex')}`

export const initPaystackBooking = async (input: InitBookingInput, userId?: string) => {
  const returnUrlBase = getFrontendUrl()

  // 1. Verify the offer, passengers and extras against Duffel, and price everything
  const prepared = await prepareBooking(input)

  // 2. Never take a second payment for a fare that is already paid for
  if (await findPaidBookingForOffer(prepared.offerId)) {
    throw new AppError(ALREADY_BOOKED_MESSAGE, 409)
  }

  // 3. Convert to naira on the server, with a live rate and our margin
  const quote = await getNgnQuote(prepared.currency, prepared.totalMinor)

  const providerReference = newPaystackReference()

  // 4. Save the booking BEFORE calling Paystack, so a webhook can always find it
  const booking = await createBookingWithReference(
    {
      userId: userId ?? null,

      contactEmail: prepared.contactEmail,
      contactPhone: prepared.contactPhone,
      leadLastName: prepared.leadLastName,

      offerId: prepared.offerId,
      offerExpiresAt: prepared.offerExpiresAt,

      currency: prepared.currency,
      airlineAmountMinor: prepared.airlineAmountMinor,
      serviceFeeMinor: prepared.serviceFeeMinor,
      extrasMinor: prepared.extrasMinor,
      totalMinor: prepared.totalMinor,

      paymentProvider: 'PAYSTACK',
      chargeCurrency: quote.chargeCurrency,
      chargeAmountMinor: quote.chargeAmountMinor,
      exchangeRate: quote.exchangeRate,
      providerReference,

      passengers: prepared.passengers as unknown as Prisma.InputJsonValue,
      services: prepared.services as unknown as Prisma.InputJsonValue,
    },
    generateBookingReference,
  )

  // 5. Start the payment. If this fails the booking is closed, never left hanging
  try {
    const payment = await initializePaystackTransaction({
      email: prepared.contactEmail,
      amountMinor: quote.chargeAmountMinor,
      reference: providerReference,
      callbackUrl: `${returnUrlBase}/booking/${booking.reference}`,
      metadata: { bookingReference: booking.reference },
    })

    return {
      reference: booking.reference,
      provider: 'paystack' as const,
      paymentUrl: payment.authorizationUrl,
      chargeCurrency: quote.chargeCurrency,
      chargeAmountMinor: quote.chargeAmountMinor.toString(),
    }
  } catch (error) {
    await markBookingFailed(booking.id, 'payment_init_failed')
    throw error
  }
}

export const initStripeBooking = async (input: InitBookingInput, userId?: string) => {
  const returnUrlBase = getFrontendUrl()

  // 1. Verify the offer, passengers and extras against Duffel, and price everything
  const prepared = await prepareBooking(input)

  // 2. Never take a second payment for a fare that is already paid for
  if (await findPaidBookingForOffer(prepared.offerId)) {
    throw new AppError(ALREADY_BOOKED_MESSAGE, 409)
  }

  // 3. Stripe charges in the offer's own currency, so no FX call.
  //    We add Stripe's fee on top so we still receive the full total
  const chargeAmountMinor = addStripeFee(prepared.currency, prepared.totalMinor)

  const providerReference = newStripeReference()

  // 4. Save the booking BEFORE calling Stripe, so a webhook can always find it
  const booking = await createBookingWithReference(
    {
      userId: userId ?? null,

      contactEmail: prepared.contactEmail,
      contactPhone: prepared.contactPhone,
      leadLastName: prepared.leadLastName,

      offerId: prepared.offerId,
      offerExpiresAt: prepared.offerExpiresAt,

      currency: prepared.currency,
      airlineAmountMinor: prepared.airlineAmountMinor,
      serviceFeeMinor: prepared.serviceFeeMinor,
      extrasMinor: prepared.extrasMinor,
      totalMinor: prepared.totalMinor,

      paymentProvider: 'STRIPE',
      chargeCurrency: prepared.currency,
      chargeAmountMinor,
      providerReference,

      passengers: prepared.passengers as unknown as Prisma.InputJsonValue,
      services: prepared.services as unknown as Prisma.InputJsonValue,
    },
    generateBookingReference,
  )

  // 5. Start the payment. If this fails the booking is closed, never left hanging
  try {
    const bookingUrl = `${returnUrlBase}/booking/${booking.reference}`

    const payment = await createStripeCheckoutSession({
      email: prepared.contactEmail,
      amountMinor: chargeAmountMinor,
      currency: prepared.currency,
      providerReference,
      bookingReference: booking.reference,
      successUrl: bookingUrl,
      cancelUrl: `${bookingUrl}?payment=cancelled`,
    })

    return {
      reference: booking.reference,
      provider: 'stripe' as const,
      paymentUrl: payment.paymentUrl,
      chargeCurrency: prepared.currency,
      chargeAmountMinor: chargeAmountMinor.toString(),
    }
  } catch (error) {
    await markBookingFailed(booking.id, 'payment_init_failed')
    throw error
  }
}

export const initBooking = async (input: InitBookingInput) => {
  if (input.paymentProvider === 'paystack') {
    return initPaystackBooking(input)
  }

  if (input.paymentProvider === 'stripe') {
    return initStripeBooking(input)
  }

  throw new AppError('This payment method is not available yet.', 501)
}