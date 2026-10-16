import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { sendResponse } from '../../utils/response.js'
import { initBooking } from './bookings.services.js'
import type { InitBookingInput } from './bookings.validation.js'

export const initBookingController = asyncHandler(async (req: Request, res: Response) => {
  const result = await initBooking(req.validatedBody as InitBookingInput)

  // Payment links must never be cached by a browser or proxy
  res.setHeader('Cache-Control', 'no-store')

  sendResponse(res, 201, 'Booking created. Continue to payment.', result)
})