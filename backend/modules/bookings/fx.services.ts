import { env } from '../../config/env.js'
import { AppError } from '../../utils/appError.js'
import { PAYSTACK_CHARGE_CURRENCY } from './bookings.constants.js'

const getRateTtlMs = () => {
  const minutes = Number(process.env.FX_CACHE_MINUTES ?? 60)
  return (Number.isFinite(minutes) && minutes > 0 ? minutes : 60) * 60 * 1000
}
const FETCH_TIMEOUT_MS = 8000

type CachedRate = { rate: number; fetchedAt: number }

const cache = new Map<string, CachedRate>()

const fetchMidRate = async (from: string) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${env.EXCHANGE_RATE_API_KEY}/latest/${from}`,
      { signal: controller.signal },
    )

    if (!response.ok) throw new Error(`rate provider answered ${response.status}`)

    const body = (await response.json()) as {
      result?: string
      conversion_rates?: Record<string, number>
    }

    const rate = body.conversion_rates?.[PAYSTACK_CHARGE_CURRENCY]

    if (body.result !== 'success' || typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      throw new Error('rate provider returned an unusable response')
    }

    return rate
  } finally {
    clearTimeout(timer)
  }
}

// Never falls back to a hardcoded rate. No live rate means no payment
const getMidRate = async (from: string) => {
  const cached = cache.get(from)

    if (cached && Date.now() - cached.fetchedAt < getRateTtlMs()) return cached.rate

  try {
    const rate = await fetchMidRate(from)
    cache.set(from, { rate, fetchedAt: Date.now() })
    return rate
  } catch (error) {
    // Log the message only: the request URL contains the API key
    console.error('Exchange rate lookup failed:', error instanceof Error ? error.message : error)
    throw new AppError('We could not get a live exchange rate. Please try again in a moment.', 503)
  }
}

/**
 * Converts a total in the offer's currency (minor units) into naira (kobo).
 * 1 cent is worth `rate` kobo, so kobo = cents x rate.
 * The margin is added to the rate, and the result is rounded UP to a whole naira.
 */
export const getNgnQuote = async (currency: string, totalMinor: number) => {
  const midRate = await getMidRate(currency)
  const effectiveRate = midRate * (1 + env.FX_MARGIN_PERCENT / 100)

  const koboExact = Math.ceil(totalMinor * effectiveRate)
  const chargeAmountMinor = BigInt(Math.ceil(koboExact / 100) * 100)

  return {
    chargeCurrency: PAYSTACK_CHARGE_CURRENCY,
    chargeAmountMinor,
    exchangeRate: effectiveRate.toFixed(8),
  }
}