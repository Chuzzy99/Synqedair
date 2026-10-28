import { duffel } from '../../config/duffel.js'
import { AppError } from '../../utils/appError.js'
import { type SearchFlightsInput } from './flights.validation.js'

type Slices = Parameters<typeof duffel.offerRequests.create>[0]['slices']

export type DuffelOffer = Awaited<ReturnType<typeof duffel.offers.get>>['data']

type MappableOffer = Omit<DuffelOffer, 'available_services'>

type PlaceLike = {
  iata_code: string | null
  name: string
  city_name?: string | null
}

const mapPlace = (place: PlaceLike) => ({
  code: place.iata_code,
  name: place.name,
  city: place.city_name ?? place.name,
})

const OFFER_UNAVAILABLE_MESSAGE = 'This fare is no longer available. Please search again.'

const CHARGE_FEE_FOR_INFANTS = false

const SERVICE_FEE_PER_PASSENGER_MINOR: Record<string, number> = {
  USD: 2000,
  GBP: 1500,
  EUR: 1750,
}

const isSupportedCurrency = (currency: string) =>
  SERVICE_FEE_PER_PASSENGER_MINOR[currency] !== undefined

export const toMinor = (amount: string | number) =>
  Math.round(Number(amount) * 100)

export const fromMinor = (minor: number) => (minor / 100).toFixed(2)

type PassengerLike = {
  type?: string | null
}

export const getServiceFeeMinor = (
  currency: string,
  passengers: PassengerLike[],
) => {
  const perPassenger = SERVICE_FEE_PER_PASSENGER_MINOR[currency]

  if (perPassenger === undefined) {
    throw new AppError(
      `No service fee configured for currency: ${currency}`,
      500,
    )
  }

  const payingPassengers = CHARGE_FEE_FOR_INFANTS
    ? passengers.length
    : passengers.filter((p) => p.type !== 'infant_without_seat').length

  return perPassenger * payingPassengers
}

export const getOfferPricing = (offer: {
  base_amount: string
  tax_amount: string | null
  total_amount: string
  total_currency: string
  passengers: PassengerLike[]
}) => {
  const feeMinor = getServiceFeeMinor(
    offer.total_currency,
    offer.passengers,
  )

  return {
    currency: offer.total_currency,
    serviceFee: fromMinor(feeMinor),
    baseAmount: fromMinor(toMinor(offer.base_amount) + feeMinor),
    taxAmount: offer.tax_amount,
    totalAmount: fromMinor(toMinor(offer.total_amount) + feeMinor),
    duffelAmount: offer.total_amount,
  }
}

const mapOffer = (offer: MappableOffer) => {
  const pricing = getOfferPricing(offer)

  return {
    id: offer.id,
    baseAmount: pricing.baseAmount,
    taxAmount: pricing.taxAmount,
    totalAmount: pricing.totalAmount,
    totalCurrency: pricing.currency,

    expiresAt: offer.expires_at,
    emissionsKg: offer.total_emissions_kg,
    identityDocumentsRequired: offer.passenger_identity_documents_required,

    payment: {
      requiresInstantPayment: offer.payment_requirements.requires_instant_payment,
      paymentRequiredBy: offer.payment_requirements.payment_required_by,
      priceGuaranteeExpiresAt: offer.payment_requirements.price_guarantee_expires_at,
    },

    conditions: {
      changeBeforeDeparture: offer.conditions?.change_before_departure ?? null,
      refundBeforeDeparture: offer.conditions?.refund_before_departure ?? null,
    },

    airline: {
      name: offer.owner.name,
      iataCode: offer.owner.iata_code,
      logo: offer.owner.logo_symbol_url,
    },

    passengers: offer.passengers.map((p) => ({
      id: p.id,
      type: p.type,
      // Age used in the search. The frontend shows it so the DOB entered matches it
      age: (p as { age?: number | null }).age ?? null,
    })),

    slices: offer.slices.map((slice) => ({
      id: slice.id,
      origin: mapPlace(slice.origin),
      destination: mapPlace(slice.destination),
      duration: slice.duration,
      stops: slice.segments.length - 1,
      fareBrandName: slice.fare_brand_name,

      segments: slice.segments.map((seg) => ({
        id: seg.id,

        origin: {
          ...mapPlace(seg.origin),
          terminal: seg.origin_terminal,
        },

        destination: {
          ...mapPlace(seg.destination),
          terminal: seg.destination_terminal,
        },

        departingAt: seg.departing_at,
        arrivingAt: seg.arriving_at,
        duration: seg.duration,

        carrier: {
          name: seg.marketing_carrier.name,
          iataCode: seg.marketing_carrier.iata_code,
          logo: seg.marketing_carrier.logo_symbol_url,
        },

        operatingCarrier: seg.operating_carrier.name,
        flightNumber: `${seg.marketing_carrier.iata_code}${seg.marketing_carrier_flight_number}`,
        aircraft: seg.aircraft?.name ?? null,
        cabinClass: seg.passengers[0]?.cabin_class_marketing_name ?? null,
        baggages: seg.passengers[0]?.baggages ?? [],
      })),
    })),
  }
}

export const searchFlights = async (input: SearchFlightsInput) => {
  const slices: Slices = [
    {
      origin: input.origin,
      destination: input.destination,
      departure_date: input.departureDate,
      departure_time: null,
      arrival_time: null,
    },
  ]

  if (input.returnDate) {
    slices.push({
      origin: input.destination,
      destination: input.origin,
      departure_date: input.returnDate,
      departure_time: null,
      arrival_time: null,
    })
  }

  const passengers = [
    ...Array.from({ length: input.adults }, () => ({
      type: 'adult' as const,
    })),
    ...input.childAges.map((age) => ({ age })),
    ...input.infantAges.map((age) => ({ age })),
  ]

  try {
    const { data } = await duffel.offerRequests.create({
      slices,
      passengers,
      cabin_class: input.cabinClass,
      return_offers: true,
    })

    const rawOffers = data.offers ?? []

    const skipped = rawOffers.filter(
      (offer) => !isSupportedCurrency(offer.total_currency),
    )

    if (skipped.length) {
      console.warn(
        `Skipped ${skipped.length} offers with unsupported currencies:`,
        [...new Set(skipped.map((offer) => offer.total_currency))],
      )
    }

    const allOffers = rawOffers
      .filter((offer) => isSupportedCurrency(offer.total_currency))
      .map(mapOffer)
      .sort((a, b) => Number(a.totalAmount) - Number(b.totalAmount))

    return {
      offerRequestId: data.id,
      count: allOffers.length,
      offers: allOffers.slice(0, 50),
    }
  } catch (error: any) {
    if (error instanceof AppError) throw error

    const message = error?.errors?.[0]?.message || 'Flight search failed'

    throw new AppError(message, error?.meta?.status || 502)
  }
}

// Fetches the offer fresh from Duffel and refuses expired or unsupported fares.
// Used by the offer endpoint and by booking, so both apply the same checks.
export const getLiveOffer = async (id: string) => {
  try {
    const { data: offer } = await duffel.offers.get(id, {
      return_available_services: true,
    })

    if (new Date(offer.expires_at).getTime() <= Date.now()) {
      throw new AppError(OFFER_UNAVAILABLE_MESSAGE, 410)
    }

    if (!isSupportedCurrency(offer.total_currency)) {
      throw new AppError('This fare cannot be booked right now', 422)
    }

    return offer
  } catch (error: any) {
    if (error instanceof AppError) throw error

    if (error?.meta?.status === 404) {
      throw new AppError(OFFER_UNAVAILABLE_MESSAGE, 410)
    }

    const message = error?.errors?.[0]?.message || 'Could not fetch flight offer'

    throw new AppError(message, error?.meta?.status || 502)
  }
}

export const getFlightOffer = async (id: string) => {
  const offer = await getLiveOffer(id)

  return {
    ...mapOffer(offer),
    availableServices: offer.available_services ?? [],
  }
}