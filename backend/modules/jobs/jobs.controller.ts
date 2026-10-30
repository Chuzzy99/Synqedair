import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { sendResponse } from '../../utils/response.js'
import { startBackgroundJobs } from './jobs.services.js'

export const runJobsController = asyncHandler(async (_req: Request, res: Response) => {
  const started = startBackgroundJobs()

  res.setHeader('Cache-Control', 'no-store')

  sendResponse(res, started ? 202 : 200, started ? 'Jobs started.' : 'Jobs are already running.', {
    started,
  })
})