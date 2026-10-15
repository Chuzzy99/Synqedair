import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { sendResponse } from '../../utils/response.js'
import { getFlightOffer, searchFlights } from './flights.services.js'
import type { SearchFlightsInput } from './flights.validation.js'

export const searchFlightsController = asyncHandler(async (req: Request, res: Response) => {
  const result = await searchFlights(req.validatedBody as SearchFlightsInput)
  sendResponse(res, 200, 'Flights fetched successfully', result)
})

export const getFlightOfferController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.validatedParams as { id: string }
  const result = await getFlightOffer(id)
  sendResponse(res, 200, 'Flight offer fetched successfully', result)
})