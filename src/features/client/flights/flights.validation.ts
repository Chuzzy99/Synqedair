import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const CABIN_CLASSES = ['economy', 'premium_economy', 'business', 'first'] as const;

// Mirrors the backend searchFlightsSchema so bad input is caught before the request is sent
export const searchFlightsSchema = z
  .object({
    origin: z
      .string()
      .length(3, 'Pick an airport to fly from')
      .transform((v) => v.toUpperCase()),
    destination: z
      .string()
      .length(3, 'Pick an airport to fly to')
      .transform((v) => v.toUpperCase()),
    departureDate: z.string().regex(dateRegex, 'Pick a departure date'),
    returnDate: z.string().regex(dateRegex, 'Pick a return date').optional(),
    adults: z.number().int().min(1, 'At least 1 adult').max(9, 'Maximum 9 adults').default(1),
    childAges: z
      .array(z.number().int().min(2, 'Children must be 2 or older').max(17, 'Children must be 17 or younger'))
      .max(8, 'Maximum 8 children')
      .default([]),
    infants: z.number().int().min(0).max(4, 'Maximum 4 infants').default(0),
    cabinClass: z.enum(CABIN_CLASSES).default('economy'),
  })
  .refine((v) => v.origin !== v.destination, {
    message: 'Origin and destination must be different',
    path: ['destination'],
  })
  .refine((v) => v.adults + v.childAges.length + v.infants <= 9, {
    message: 'Maximum 9 passengers per booking',
    path: ['adults'],
  })
  .refine((v) => v.infants <= v.adults, {
    message: 'Each infant needs an adult',
    path: ['infants'],
  })
  .refine((v) => !v.returnDate || v.returnDate >= v.departureDate, {
    message: 'Return date cannot be before departure',
    path: ['returnDate'],
  });

// What the form/URL provides (defaults not yet applied)
export type SearchFlightsFormInput = z.input<typeof searchFlightsSchema>;

// What gets sent to the backend (defaults applied, codes uppercased)
export type SearchFlightsPayload = z.output<typeof searchFlightsSchema>;