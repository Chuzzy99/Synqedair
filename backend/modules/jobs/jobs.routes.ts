import { Router } from 'express'
import { runJobsController } from './jobs.controller.js'
import { jobsFailedAuthLimiter, requireJobsSecret } from './jobs.auth.js'

const router = Router()

// The limiter runs first, so it can count the requests the auth check rejects
router.post('/run', jobsFailedAuthLimiter, requireJobsSecret, runJobsController)

export default router