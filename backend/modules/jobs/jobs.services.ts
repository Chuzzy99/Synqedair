import { retryStuckBookings } from '../bookings/bookings.fufilments.js'
import { reconcilePendingPayments } from '../bookings/bookings.reconciler.js'

let running = false

const runJobs = async () => {
  const startedAt = Date.now()

  // One job failing must never stop the other
  const [reconcile, sweep] = await Promise.allSettled([
    reconcilePendingPayments(),
    retryStuckBookings(),
  ])

  if (reconcile.status === 'fulfilled') {
    console.log('[JOBS] reconcile', reconcile.value)
  } else {
    console.error('[JOBS] reconcile failed:', reconcile.reason)
  }

  if (sweep.status === 'fulfilled') {
    console.log('[JOBS] fulfilment sweep done')
  } else {
    console.error('[JOBS] fulfilment sweep failed:', sweep.reason)
  }

  console.log(`[JOBS] finished in ${Date.now() - startedAt}ms`)
}

// Starts the jobs in the background and returns straight away, because cron-job.org
// gives up on a request after about 30 seconds. Returns false if a run is still going
export const startBackgroundJobs = () => {
  if (running) return false
  running = true

  void runJobs()
    .catch((error) => console.error('[JOBS] run crashed:', error))
    .finally(() => {
      running = false
    })

  return true
}