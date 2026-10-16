import { z } from 'zod'
import {
  BOOKING_REFERENCE_ALPHABET,
  BOOKING_REFERENCE_LENGTH,
  BOOKING_REFERENCE_PREFIX,
  MAX_PASSENGERS,
  MAX_SERVICES,
  MAX_SERVICE_QUANTITY,
  PAYMENT_PROVIDERS,
} from './bookings.constants.js'

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
const NAME_REGEX = /^[\p{L}][\p{L}\s'.-]*$/u
const PHONE_REGEX = /^\+[1-9]\d{6,14}$/
const PASSPORT_REGEX = /^[A-Za-z0-9]{5,20}$/
const OFFER_ID_REGEX = /^off_[A-Za-z0-9_]+$/
const PASSENGER_ID_REGEX = /^pas_[A-Za-z0-9_]+$/
const SERVICE_ID_REGEX = /^ase_[A-Za-z0-9_]+$/

const BOOKING_REFERENCE_REGEX = new RegExp(
  `^${BOOKING_REFERENCE_PREFIX}-[${BOOKING_REFERENCE_ALPHABET}]{${BOOKING_REFERENCE_LENGTH}}$`,
)

const today = () => new Date().toISOString().slice(0, 10)

const isRealDate = (value: string) => {
  if (!DATE_REGEX.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export const normalisePhone = (value: string) => value.replace(/[\s\-().]/g, '')

/**
 * Matching key for last names: lowercase, no accents, letters only.
 * "O'Brien", "OBrien" and "o brien" all become "obrien", so a customer
 * who types their name slightly differently can still find their booking.
 * Used when saving a booking AND when looking one up.
 */
export const toLastNameKey = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}]/gu, '')

const dateSchema = z
  .string()
  .regex(DATE_REGEX, 'Use the format YYYY-MM-DD')
  .refine(isRealDate, 'Enter a valid date')

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Required')
  .max(40, 'Too long')
  .regex(NAME_REGEX, 'Use letters only, no numbers or symbols')
  .transform((value) => value.replace(/\s+/g, ' '))

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'Email is too long')
  .pipe(z.email('Enter a valid email address'))

const phoneSchema = z
  .string()
  .trim()
  .transform(normalisePhone)
  .pipe(z.string().regex(PHONE_REGEX, 'Use international format, e.g. +2348012345678'))

const lastNameLookupSchema = z
  .string()
  .trim()
  .min(1, 'Enter the last name')
  .max(60, 'Too long')
  .transform(toLastNameKey)
  .refine((key) => key.length > 0, 'Enter the last name')

const referenceSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(BOOKING_REFERENCE_REGEX, 'Invalid booking reference')

const passportSchema = z.strictObject({
  number: z
    .string()
    .trim()
    .regex(PASSPORT_REGEX, 'Passport number must be 5-20 letters or numbers')
    .transform((value) => value.toUpperCase()),
  issuingCountryCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/, 'Use a 2-letter country code')
    .transform((value) => value.toUpperCase()),
  expiresOn: dateSchema,
})

const passengerSchema = z
  .strictObject({
    id: z.string().regex(PASSENGER_ID_REGEX, 'Invalid passenger id'),
    title: z.enum(['mr', 'mrs', 'ms', 'miss', 'dr']),
    gender: z.enum(['m', 'f']),
    givenName: nameSchema,
    familyName: nameSchema,
    bornOn: dateSchema.refine((value) => value <= today(), 'Date of birth cannot be in the future'),
    passport: passportSchema.optional(),
  })
  .refine((p) => p.title === 'dr' || (p.title === 'mr') === (p.gender === 'm'), {
    message: 'Title does not match gender',
    path: ['title'],
  })

const serviceSchema = z.strictObject({
  id: z.string().regex(SERVICE_ID_REGEX, 'Invalid service id'),
  quantity: z.number().int().min(1).max(MAX_SERVICE_QUANTITY).default(1),
})

const hasUniqueValues = (values: string[]) => new Set(values).size === values.length

export const initBookingSchema = z
  .strictObject({
    offerId: z.string().regex(OFFER_ID_REGEX, 'Invalid offer id'),
        paymentProvider: z.enum(PAYMENT_PROVIDERS),
    contact: z.strictObject({
      email: emailSchema,
      phone: phoneSchema,
    }),
    passengers: z.array(passengerSchema).min(1).max(MAX_PASSENGERS),
    services: z.array(serviceSchema).max(MAX_SERVICES).default([]),
  })
  .refine((body) => hasUniqueValues(body.passengers.map((p) => p.id)), {
    message: 'Each passenger can only appear once',
    path: ['passengers'],
  })
  .refine((body) => hasUniqueValues(body.services.map((s) => s.id)), {
    message: 'Each extra can only appear once, use quantity instead',
    path: ['services'],
  })

// POST (not GET), so the last name never ends up in URLs and server logs
export const lookupBookingSchema = z.strictObject({
  reference: referenceSchema,
  lastName: lastNameLookupSchema,
})

export const recoverReferenceSchema = z.strictObject({
  email: emailSchema,
  lastName: lastNameLookupSchema,
})

export type InitBookingInput = z.infer<typeof initBookingSchema>
export type LookupBookingInput = z.infer<typeof lookupBookingSchema>
export type RecoverReferenceInput = z.infer<typeof recoverReferenceSchema>