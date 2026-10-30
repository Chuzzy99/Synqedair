import { Router } from 'express'
import { adminFailedAuthLimiter, requireAdminSecret } from './admin.auth.js'
import { refundBookingController } from './admin.controller.js'

const router = Router()

// The limiter runs first, so it can count the requests the auth check rejects
router.use(adminFailedAuthLimiter, requireAdminSecret)

router.post('/bookings/:reference/refund', refundBookingController)

export default router