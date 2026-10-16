import { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma.js'

export type CreateBookingData = Omit<Prisma.BookingUncheckedCreateInput, 'reference'>

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
  export const findBookingByProviderReference = (providerReference: string) =>
  prisma.booking.findUnique({ where: { providerReference } })

// Only moves a booking that hasn't been paid yet, so a duplicate webhook changes nothing
export const markBookingPaid = (id: string, providerPaymentId: string) =>
  prisma.booking.updateMany({
    where: { id, status: { in: ['PENDING_PAYMENT', 'FAILED', 'EXPIRED'] } },
    data: { status: 'PAID', paidAt: new Date(), providerPaymentId, failureReason: null },
  })

// Money arrived but something is wrong. A person must look at it before anything is booked
export const markBookingRefundRequired = (id: string, reason: string, providerPaymentId?: string) =>
  prisma.booking.updateMany({
    where: { id, status: { in: ['PENDING_PAYMENT', 'FAILED', 'EXPIRED'] } },
    data: { status: 'REFUND_REQUIRED', failureReason: reason, paidAt: new Date(), ...(providerPaymentId !== undefined && { providerPaymentId }) },
  })