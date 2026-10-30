import { sendRefundAlerts } from '../bookings/bookings.alerts.js'
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

  // Alerts run last, so a booking that just turned REFUND_REQUIRED is reported in this same run
  try {
    const alerts = await sendRefundAlerts()
    if (alerts.sent > 0 || alerts.failed > 0) console.log('[JOBS] refund alerts', alerts)
  } catch (error) {
    console.error('[JOBS] refund alerts failed:', error)
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