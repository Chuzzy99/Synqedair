import { duffel } from '../../config/duffel.js'
import { AppError } from '../../utils/appError.js'
import { toMinor, type DuffelOffer } from '../flights/flights.services.js'
import type { InitBookingInput } from './bookings.validation.js'

type KnownService = {
  type: string
  currency: string
  unitAmountMinor: number
  maximumQuantity: number
}

export type PricedExtra = {
  id: string
  type: string
  quantity: number
  unitAmountMinor: number
  amountMinor: number
}

const UNAVAILABLE_MESSAGE = 'One of your selected extras is no longer available. Please review your selection.'

const addOfferServices = (offer: DuffelOffer, known: Map<string, KnownService>) => {
  for (const service of offer.available_services ?? []) {
    const raw = service as unknown as Record<string, unknown>

    known.set(service.id, {
      type: service.type,
      currency: service.total_currency,
      unitAmountMinor: toMinor(service.total_amount),
      maximumQuantity: Number(raw.maximum_quantity ?? 1),
    })
  }
}

const addSeatServices = async (offerId: string, known: Map<string, KnownService>) => {
  try {
    const { data: seatMaps } = await duffel.seatMaps.get({ offer_id: offerId })

    for (const seatMap of seatMaps) {
      for (const cabin of seatMap.cabins) {
        for (const row of cabin.rows) {
          for (const section of row.sections) {
            for (const element of section.elements) {
              if (element.type !== 'seat') continue

              for (const service of element.available_services ?? []) {
                known.set(service.id, {
                  type: 'seat',
                  currency: service.total_currency,
                  unitAmountMinor: toMinor(service.total_amount),
                  maximumQuantity: 1,
                })
              }
            }
          }
        }
      }
    }
  } catch {
    throw new AppError('We could not verify your seat selection. Please try again.', 502)
  }
}

export const priceExtras = async (
  offer: DuffelOffer,
  requested: InitBookingInput['services'],
) => {
  if (requested.length === 0) return { items: [] as PricedExtra[], totalMinor: 0 }

  const known = new Map<string, KnownService>()
  addOfferServices(offer, known)

  if (requested.some((r) => !known.has(r.id))) {
    await addSeatServices(offer.id, known)
  }

  const items = requested.map((r): PricedExtra => {
    const service = known.get(r.id)

    if (!service || service.currency !== offer.total_currency) {
      throw new AppError(UNAVAILABLE_MESSAGE, 422)
    }

    if (r.quantity > service.maximumQuantity) {
      throw new AppError(UNAVAILABLE_MESSAGE, 422)
    }

    return {
      id: r.id,
      type: service.type,
      quantity: r.quantity,
      unitAmountMinor: service.unitAmountMinor,
      amountMinor: service.unitAmountMinor * r.quantity,
    }
  })

  return {
    items,
    totalMinor: items.reduce((sum, item) => sum + item.amountMinor, 0),
  }
}