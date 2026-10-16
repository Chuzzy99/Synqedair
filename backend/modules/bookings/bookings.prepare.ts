import { AppError } from '../../utils/appError.js'
import { getLiveOffer, getOfferPricing, toMinor } from '../flights/flights.services.js'
import { MIN_OFFER_LIFETIME_MINUTES } from './bookings.constants.js'
import { priceExtras } from './bookings.extras.js'
import { buildBookingPassengers, getLeadLastNameKey } from './bookings.passengers.js'
import type { InitBookingInput } from './bookings.validation.js'

/**
 * Turns an init request into a verified, priced booking using only Duffel's live data.
 * Nothing in here trusts a price, passenger type, or extra from the browser.
 * It does not touch the database or any payment provider.
 */
export const prepareBooking = async (input: InitBookingInput) => {
  const offer = await getLiveOffer(input.offerId)

  const minutesLeft = (new Date(offer.expires_at).getTime() - Date.now()) / 60_000

  if (minutesLeft < MIN_OFFER_LIFETIME_MINUTES) {
    throw new AppError('This fare is about to expire. Please search again.', 410)
  }

  const passengers = buildBookingPassengers(offer, input.passengers)
  const extras = await priceExtras(offer, input.services)
  const pricing = getOfferPricing(offer)

  const airlineAmountMinor = toMinor(pricing.duffelAmount)
  const serviceFeeMinor = toMinor(pricing.serviceFee)

  // What the search card showed must equal airline + our fee, or something is wrong
  if (toMinor(pricing.totalAmount) !== airlineAmountMinor + serviceFeeMinor) {
    throw new AppError('Pricing check failed', 500)
  }

  return {
    offerId: offer.id,
    offerExpiresAt: new Date(offer.expires_at),
    currency: pricing.currency,

    airlineAmountMinor,
    serviceFeeMinor,
    extrasMinor: extras.totalMinor,
    totalMinor: airlineAmountMinor + serviceFeeMinor + extras.totalMinor,

    contactEmail: input.contact.email,
    contactPhone: input.contact.phone,
    leadLastName: getLeadLastNameKey(passengers),

    passengers,
    services: extras.items,
    identityDocumentsRequired: offer.passenger_identity_documents_required,
  }
}