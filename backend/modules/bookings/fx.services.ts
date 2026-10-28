import { env } from '../../config/env.js'
import { AppError } from '../../utils/appError.js'
import { PAYSTACK_CHARGE_CURRENCY } from './bookings.constants.js'

const RATE_TTL_MS = env.FX_CACHE_MINUTES * 60 * 1000
const FETCH_TIMEOUT_MS = 8000

// Paystack local card fees, in kobo. Check these against your own dashboard pricing,
// because negotiated rates differ
const PAYSTACK_FEE_PERCENT = 0.015
const PAYSTACK_FLAT_FEE_KOBO = 10_000 // N100
const PAYSTACK_FLAT_FEE_WAIVED_BELOW_KOBO = 250_000 // N2,500
const PAYSTACK_FEE_CAP_KOBO = 200_000 // N2,000

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

    const body = (await response.json().catch(() => null)) as {
      result?: string
      'error-type'?: string
      conversion_rates?: Record<string, number>
    } | null

    if (!body || body.result !== 'success') {
      throw new Error(`rate provider error: ${body?.['error-type'] ?? `status ${response.status}`}`)
    }

    const rate = body.conversion_rates?.[PAYSTACK_CHARGE_CURRENCY]

    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      throw new Error('rate provider returned no usable naira rate')
    }

    return rate
  } finally {
    clearTimeout(timer)
  }
}

// Never falls back to a hardcoded rate. No live rate means no payment
const getMidRate = async (from: string) => {
  const cached = cache.get(from)

  if (cached && Date.now() - cached.fetchedAt < RATE_TTL_MS) return cached.rate

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
 * Adds Paystack's fee on top of the amount we want to receive, so the fee is paid
 * by the amount charged and not taken out of our settlement.
 * Paystack takes its fee from the amount charged, so we always receive at least netKobo.
 */
const addPaystackFee = (netKobo: number) => {
  const flat = netKobo < PAYSTACK_FLAT_FEE_WAIVED_BELOW_KOBO ? 0 : PAYSTACK_FLAT_FEE_KOBO

  const feeOnNet = PAYSTACK_FEE_PERCENT * netKobo + flat

  if (feeOnNet >= PAYSTACK_FEE_CAP_KOBO) return netKobo + PAYSTACK_FEE_CAP_KOBO

  return Math.ceil((netKobo + flat) / (1 - PAYSTACK_FEE_PERCENT))
}

/**
 * Converts a total in the offer's currency (minor units) into naira (kobo).
 * 1 cent is worth `rate` kobo, so kobo = cents x rate.
 * The margin is added to the rate, then Paystack's fee is added, then the result
 * is rounded UP to a whole naira.
 */
export const getNgnQuote = async (currency: string, totalMinor: number) => {
  const midRate = await getMidRate(currency)
  const effectiveRate = midRate * (1 + env.FX_MARGIN_PERCENT / 100)

  const netKobo = Math.ceil(totalMinor * effectiveRate)
  const grossKobo = addPaystackFee(netKobo)
  const chargeAmountMinor = BigInt(Math.ceil(grossKobo / 100) * 100)

  return {
    chargeCurrency: PAYSTACK_CHARGE_CURRENCY,
    chargeAmountMinor,
    exchangeRate: effectiveRate.toFixed(8),
  }
}