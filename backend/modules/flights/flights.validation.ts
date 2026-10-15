import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

export const searchFlightsSchema = z.object({
  origin: z.string().length(3).transform((v) => v.toUpperCase()),
  destination: z.string().length(3).transform((v) => v.toUpperCase()),
  departureDate: z.string().regex(dateRegex),
  returnDate: z.string().regex(dateRegex).optional(),
  adults: z.number().int().min(1).max(9).default(1),
  childAges: z.array(z.number().int().min(2).max(17)).max(8).default([]),
  infants: z.number().int().min(0).max(4).default(0),
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']).default('economy'),
})
  .refine((v) => v.infants <= v.adults, { message: 'Each infant needs an adult', path: ['infants'] })
  .refine((v) => !v.returnDate || v.returnDate >= v.departureDate, { message: 'Return date cannot be before departure', path: ['returnDate'] })

export const flightOfferParamsSchema = z.object({
  id: z.string().regex(/^off_[A-Za-z0-9_]+$/, 'Invalid offer id'),
})

export type SearchFlightsInput = z.infer<typeof searchFlightsSchema>