import { Router } from 'express'
import { validate } from '../../middleware/validateMiddleware.js'
import { flightOfferParamsSchema, searchFlightsSchema } from './flights.validation.js'
import { getFlightOfferController, searchFlightsController } from './flights.contoller.js'

const router = Router()

router.post('/search', validate({ body: searchFlightsSchema }), searchFlightsController)

router.get('/offers/:id', validate({ params: flightOfferParamsSchema }), getFlightOfferController)

export default router