import { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma.js'
import {
  FULFILLMENT_LOCK_MINUTES,
  FULFILLMENT_RETRY_AFTER_MINUTES,
  MAX_FULFILLMENT_ATTEMPTS,
  PENDING_PAYMENT_CHECK_AFTER_MINUTES,
  RECONCILE_BATCH_SIZE,
} from './bookings.constants.js'

export type CreateBookingData = Omit<Prisma.BookingUncheckedCreateInput, 'reference'>

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000)

// Has this fare already been paid for? Used to stop a second payment for the same offer
export const findPaidBookingForOffer = (offerId: string) =>
  prisma.booking.findFirst({
    where: { offerId, status: { in: ['PAID', 'BOOKED'] } },
    select: { id: true },
  })

const isReferenceClash = (error: unknown) => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') return false

  const target = error.meta?.target

  return Array.isArray(target)
    ? target.includes('reference')
    : String(target ?? '').includes('bookings_reference_key')
}

// Reference clashes are very unlikely, but the unique column is the real guard, so retry on a clash
export const createBookingWithReference = async (
  data: CreateBookingData,
  generateReference: () => string,
) => {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.booking.create({
        data: { ...data, reference: generateReference() },
      })
    } catch (error) {
      if (!isReferenceClash(error)) throw error
    }
  }

  throw new Error('Could not generate a unique booking reference')
}

// Only moves a booking that is still waiting for payment, never one that has been paid
export const markBookingFailed = (id: string, reason: string) =>
  prisma.booking.updateMany({
    where: { id, status: 'PENDING_PAYMENT' },
    data: { status: 'FAILED', failureReason: reason },
  })

// Bookings still waiting for payment that are old enough for the webhook to have arrived.
// Oldest first, so nothing is starved
export const findPendingPaymentBookings = () =>
  prisma.booking.findMany({
    where: {
      status: 'PENDING_PAYMENT',
      createdAt: { lt: minutesAgo(PENDING_PAYMENT_CHECK_AFTER_MINUTES) },
    },
    select: {
      id: true,
      reference: true,
      paymentProvider: true,
      providerReference: true,
      providerSessionId: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
    take: RECONCILE_BATCH_SIZE,
  })

// Only closes a booking that is still unpaid. A late payment can still move it to PAID
export const markBookingExpired = (id: string, reason: string) =>
  prisma.booking.updateMany({
    where: { id, status: 'PENDING_PAYMENT' },
    data: { status: 'EXPIRED', failureReason: reason },
  })

export const findBookingByProviderReference = (providerReference: string) =>
  prisma.booking.findUnique({ where: { providerReference } })

// Stripe's own id for the Checkout Session. A background job needs it to ask Stripe
// about a payment whose webhook never arrived. Only fills it in once, never overwrites
export const saveProviderSessionId = (id: string, providerSessionId: string) =>
  prisma.booking.updateMany({
    where: { id, providerSessionId: null },
    data: { providerSessionId },
  })

// Only moves a booking that hasn't been paid yet, so a duplicate webhook changes nothing.
// The receipt (what the provider took and what we received) is saved when it is already known
export const markBookingPaid = (
  id: string,
  providerPaymentId: string,
  receipt?: { providerFeeMinor: bigint | null; netReceivedMinor: bigint | null },
) =>
  prisma.booking.updateMany({
    where: { id, status: { in: ['PENDING_PAYMENT', 'FAILED', 'EXPIRED'] } },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      providerPaymentId,
      failureReason: null,
      providerFeeMinor: receipt?.providerFeeMinor ?? null,
      netReceivedMinor: receipt?.netReceivedMinor ?? null,
    },
  })

// Fills in a receipt that is still empty, so it can never overwrite earlier data
export const saveBookingReceipt = (id: string, providerFeeMinor: bigint, netReceivedMinor: bigint) =>
  prisma.booking.updateMany({
    where: { id, netReceivedMinor: null },
    data: { providerFeeMinor, netReceivedMinor },
  })

// Money arrived but something is wrong. A person must look at it before anything is booked
export const markBookingRefundRequired = (id: string, reason: string, providerPaymentId?: string) =>
  prisma.booking.updateMany({
    where: { id, status: { in: ['PENDING_PAYMENT', 'FAILED', 'EXPIRED'] } },
    data: {
      status: 'REFUND_REQUIRED',
      failureReason: reason,
      paidAt: new Date(),
      ...(providerPaymentId !== undefined && { providerPaymentId }),
    },
  })

// REFUND_REQUIRED bookings nobody has been told about yet. Oldest first
export const findBookingsNeedingRefundAlert = () =>
  prisma.booking.findMany({
    where: { status: 'REFUND_REQUIRED', refundAlertSentAt: null },
    select: {
      id: true,
      reference: true,
      paymentProvider: true,
      providerPaymentId: true,
      chargeAmountMinor: true,
      chargeCurrency: true,
      failureReason: true,
      paidAt: true,
    },
    orderBy: { updatedAt: 'asc' },
    take: 20,
  })

// Only one caller gets count 1, so the same booking is never alerted twice
export const claimRefundAlert = (id: string) =>
  prisma.booking.updateMany({
    where: { id, status: 'REFUND_REQUIRED', refundAlertSentAt: null },
    data: { refundAlertSentAt: new Date() },
  })

// The alert couldn't be delivered, so make the next run try again
export const releaseRefundAlert = (id: string) =>
  prisma.booking.updateMany({
    where: { id, status: 'REFUND_REQUIRED' },
    data: { refundAlertSentAt: null },
  })

export const findBookingById = (id: string) => prisma.booking.findUnique({ where: { id } })

// Atomic claim: only one caller gets `true`, so only one worker ever talks to Duffel
export const claimBookingForFulfillment = async (id: string) => {
  const { count } = await prisma.booking.updateMany({
    where: {
      id,
      status: 'PAID',
      fulfillmentAttempts: { lt: MAX_FULFILLMENT_ATTEMPTS },
      OR: [
        { fulfillmentLockedAt: null },
        { fulfillmentLockedAt: { lt: minutesAgo(FULFILLMENT_LOCK_MINUTES) } },
      ],
    },
    data: { fulfillmentLockedAt: new Date(), fulfillmentAttempts: { increment: 1 } },
  })

  return count === 1
}

// Temporary failure: let the sweeper try again later
export const releaseFulfillmentLock = (id: string) =>
  prisma.booking.updateMany({
    where: { id, status: 'PAID' },
    data: { fulfillmentLockedAt: null },
  })

export const markBookingBooked = (
  id: string,
  data: {
    duffelOrderId: string
    airlineBookingReference: string | null
    passengers: Prisma.InputJsonValue
  },
) =>
  prisma.booking.updateMany({
    where: { id, status: 'PAID' },
    data: { status: 'BOOKED', bookedAt: new Date(), fulfillmentLockedAt: null, ...data },
  })

// Paid, but we can't deliver the ticket. A person must look at it
export const markPaidBookingRefundRequired = (id: string, reason: string) =>
  prisma.booking.updateMany({
    where: { id, status: 'PAID' },
    data: { status: 'REFUND_REQUIRED', failureReason: reason, fulfillmentLockedAt: null },
  })

export const findBookingsAwaitingFulfillment = () =>
  prisma.booking.findMany({
    where: {
      status: 'PAID',
      fulfillmentAttempts: { lt: MAX_FULFILLMENT_ATTEMPTS },
      updatedAt: { lt: minutesAgo(FULFILLMENT_RETRY_AFTER_MINUTES) },
      OR: [
        { fulfillmentLockedAt: null },
        { fulfillmentLockedAt: { lt: minutesAgo(FULFILLMENT_LOCK_MINUTES) } },
      ],
    },
    select: { id: true },
    orderBy: { paidAt: 'asc' },
    take: 20,
  })

// Out of attempts, so stop retrying and hand it to a person
export const failExhaustedBookings = () =>
  prisma.booking.updateMany({
    where: {
      status: 'PAID',
      fulfillmentAttempts: { gte: MAX_FULFILLMENT_ATTEMPTS },
      OR: [
        { fulfillmentLockedAt: null },
        { fulfillmentLockedAt: { lt: minutesAgo(FULFILLMENT_LOCK_MINUTES) } },
      ],
    },
    data: { status: 'REFUND_REQUIRED', failureReason: 'duffel_retries_exhausted', fulfillmentLockedAt: null },
  })