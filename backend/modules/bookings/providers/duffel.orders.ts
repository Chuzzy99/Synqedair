import { duffel } from '../../../config/duffel.js'
import { fromMinor } from '../../flights/flights.services.js'
import type { PricedExtra } from '../bookings.extras.js'
import type { BookingPassenger } from '../bookings.passengers.js'

type OrderParams = Parameters<typeof duffel.orders.create>[0]

// The saved booking can't be turned into a valid order. Retrying will not help
export class FulfillmentInputError extends Error {}

type BookingForOrder = {
  reference: string
  offerId: string
  currency: string
  airlineAmountMinor: number
  extrasMinor: number
  contactEmail: string
  contactPhone: string
  passengers: unknown
  services: unknown
}

export const createDuffelOrder = async (booking: BookingForOrder) => {
  const passengers = booking.passengers as BookingPassenger[]
  const services = booking.services as PricedExtra[]

  if (!Array.isArray(passengers) || passengers.length === 0) {
    throw new FulfillmentInputError('booking has no passengers')
  }

  // Duffel needs every infant tied to an adult
  const adults = passengers.filter((p) => p.type === 'adult')
  const infants = passengers.filter((p) => p.type === 'infant_without_seat')

  if (infants.length > adults.length) {
    throw new FulfillmentInputError('more infants than adults')
  }

  const infantForAdult = new Map(adults.map((adult, index) => [adult.id, infants[index]?.id]))

  const orderPassengers = passengers.map((p) => {
    const infantId = infantForAdult.get(p.id)

    return {
      id: p.id,
      title: p.title,
      gender: p.gender,
      given_name: p.givenName,
      family_name: p.familyName,
      born_on: p.bornOn,
      email: booking.contactEmail,
      phone_number: booking.contactPhone,
      ...(infantId ? { infant_passenger_id: infantId } : {}),
      ...(p.passport
        ? {
            identity_documents: [
              {
                type: 'passport',
                unique_identifier: p.passport.number,
                issuing_country_code: p.passport.issuingCountryCode,
                expires_on: p.passport.expiresOn,
              },
            ],
          }
        : {}),
    }
  }) as unknown as OrderParams['passengers']

  const params = {
    type: 'instant',
    selected_offers: [booking.offerId],
    passengers: orderPassengers,
    // We pay Duffel the airline's price plus extras, never our service fee
    payments: [
      {
        type: 'balance',
        currency: booking.currency,
        amount: fromMinor(booking.airlineAmountMinor + booking.extrasMinor),
      },
    ],
    ...(services.length > 0
      ? { services: services.map((s) => ({ id: s.id, quantity: s.quantity })) }
      : {}),
    metadata: { booking_reference: booking.reference },
  } as unknown as OrderParams

  const { data } = await duffel.orders.create(params)

  return { id: data.id, bookingReference: data.booking_reference ?? null }
}