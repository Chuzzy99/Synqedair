import { createHmac, timingSafeEqual } from 'node:crypto'
import { env } from '../../../config/env.js'
import { AppError } from '../../../utils/appError.js'

const PAYSTACK_TIMEOUT_MS = 15000

type InitializeInput = {
  email: string
  amountMinor: bigint
  reference: string
  callbackUrl: string
  metadata: Record<string, string>
}

type InitializeResponse = {
  status?: boolean
  message?: string
  data?: { authorization_url?: string; reference?: string }
}

export const initializePaystackTransaction = async (input: InitializeInput) => {
  const secret = env.PAYSTACK_SECRET_KEY
  const amount = Number(input.amountMinor)

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new AppError('Invalid payment amount', 500)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PAYSTACK_TIMEOUT_MS)

  let response: Response

  try {
    response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email,
        amount,
        currency: 'NGN',
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: input.metadata,
      }),
      signal: controller.signal,
    })
  } catch {
    throw new AppError('We could not reach the payment provider. Please try again.', 502)
  } finally {
    clearTimeout(timer)
  }

  const body = (await response.json().catch(() => null)) as InitializeResponse | null

  if (!response.ok || !body?.status || !body.data?.authorization_url) {
    console.error('Paystack initialize failed:', response.status, body?.message)
    throw new AppError('We could not start your payment. Please try again.', 502)
  }

  return {
    authorizationUrl: body.data.authorization_url,
    reference: body.data.reference ?? input.reference,
  }
}

export const verifyPaystackSignature = (rawBody: Buffer, signature: string | undefined) => {
  if (!signature) return false

  const expected = createHmac('sha512', env.PAYSTACK_SECRET_KEY).update(rawBody).digest('hex')

  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(signature, 'utf8')

  return a.length === b.length && timingSafeEqual(a, b)
}

type VerifyResponse = {
  status?: boolean
  data?: {
    id?: number
    status?: string
    amount?: number
    requested_amount?: number
    fees?: number | null
    currency?: string
    reference?: string
  }
}

// Asks Paystack directly what happened to a transaction. Returns null when Paystack doesn't know it
export const verifyPaystackTransaction = async (reference: string) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PAYSTACK_TIMEOUT_MS)

  let response: Response

  try {
    response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` },
        signal: controller.signal,
      },
    )
  } catch {
    throw new AppError('Could not reach the payment provider', 502)
  } finally {
    clearTimeout(timer)
  }

  // Only a 404 means Paystack has never heard of this reference.
  // A 401/403 (wrong key), 408 or 429 (rate limit) is OUR problem, not "no such payment".
  // Those fall through to the error below, so the webhook returns 5xx and Paystack retries
  if (response.status === 404) return null

  const body = (await response.json().catch(() => null)) as VerifyResponse | null
  const data = body?.data

  if (
    !response.ok ||
    !body?.status ||
    typeof data?.amount !== 'number' ||
    typeof data.currency !== 'string' ||
    data.id === undefined
  ) {
    throw new AppError('Could not verify the payment', 502)
  }

  // What Paystack took, in kobo. Missing means we simply don't record a receipt
  const feeMinor = typeof data.fees === 'number' ? BigInt(data.fees) : null

  return {
    status: data.status ?? 'unknown',
    // The amount we asked for. If a customer is made to pay Paystack's fee, `amount` includes it
    amountMinor: BigInt(data.requested_amount ?? data.amount),
    currency: data.currency,
    providerPaymentId: String(data.id),
    feeMinor,
    // What we receive: the total paid minus Paystack's fee. Correct whoever bears the fee
    netMinor: feeMinor === null ? null : BigInt(data.amount) - feeMinor,
  }
}