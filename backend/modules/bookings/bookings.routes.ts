import { Router } from 'express'
import { validate } from '../../middleware/validateMiddleware.js'
import { initBookingController } from './bookings.controller.js'
import { initBookingLimiter } from './bookings.ratelimit.js'
import { initBookingSchema } from './bookings.validation.js'

const router = Router()

// The limiter runs first, so floods of invalid bodies are counted too
router.post('/init', initBookingLimiter, validate({ body: initBookingSchema }), initBookingController)

export default router