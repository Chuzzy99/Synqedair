export const BOOKING_REFERENCE_PREFIX = 'SQ'
export const BOOKING_REFERENCE_LENGTH = 8

// No 0/O/1/I, so a reference is easy to read out loud and type
export const BOOKING_REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const PAYMENT_PROVIDERS = ['paystack', 'stripe'] as const

export type PaymentProviderName = (typeof PAYMENT_PROVIDERS)[number]

// Paystack only charges Naira for now. Stripe charges in the offer's own currency
export const PAYSTACK_CHARGE_CURRENCY = 'NGN'

// Refuse fares that are about to expire, so a customer isn't sent to pay for one that will be gone
export const MIN_OFFER_LIFETIME_MINUTES = 5

export const MAX_PASSENGERS = 9
export const MAX_SERVICES = 50
export const MAX_SERVICE_QUANTITY = 10
export const MAX_FULFILLMENT_ATTEMPTS = 5
export const FULFILLMENT_LOCK_MINUTES = 5
export const FULFILLMENT_RETRY_AFTER_MINUTES = 2

// Reconciler: give the webhook time to arrive first, then ask the provider ourselves
export const PENDING_PAYMENT_CHECK_AFTER_MINUTES = 5

// An unpaid booking older than this is closed as EXPIRED (a late payment can still revive it)
export const PENDING_PAYMENT_EXPIRE_AFTER_MINUTES = 60

// How many pending bookings one reconciler run looks at
export const RECONCILE_BATCH_SIZE = 20