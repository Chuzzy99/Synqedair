import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { AppError } from '../../utils/appError.js'
import { sendResponse } from '../../utils/response.js'
import {
  BOOKING_REFERENCE_ALPHABET,
  BOOKING_REFERENCE_LENGTH,
  BOOKING_REFERENCE_PREFIX,
} from '../bookings/bookings.constants.js'
import { refundBooking } from '../bookings/bookings.refunds.js'

// SQ-XXXXXXXX
const REFERENCE_PATTERN = new RegExp(
  `^${BOOKING_REFERENCE_PREFIX}-[${BOOKING_REFERENCE_ALPHABET}]{${BOOKING_REFERENCE_LENGTH}}$`,
)

export const refundBookingController = asyncHandler(async (req: Request, res: Response) => {
  const reference = String(req.params.reference ?? '').toUpperCase()

  if (!REFERENCE_PATTERN.test(reference)) throw new AppError('Invalid booking reference', 400)

  const result = await refundBooking(reference, {
    confirmNoDuffelOrder: req.body?.confirmNoDuffelOrder === true,
  })

  res.setHeader('Cache-Control', 'no-store')

  sendResponse(res, 200, 'Refund started.', result)
})