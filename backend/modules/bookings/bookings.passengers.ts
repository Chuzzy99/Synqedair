import { AppError } from '../../utils/appError.js'
import type { DuffelOffer } from '../flights/flights.services.js'
import { toLastNameKey, type InitBookingInput } from './bookings.validation.js'

type TravelDates = { first: string; last: string }

export type BookingPassenger = {
  id: string
  type: string
  title: string
  gender: 'm' | 'f'
  givenName: string
  familyName: string
  bornOn: string
  passport: { number: string; issuingCountryCode: string; expiresOn: string } | null
}

const MISMATCH_MESSAGE = 'Passenger details do not match this fare. Please go back and try again.'

const today = () => new Date().toISOString().slice(0, 10)

const shiftDate = (date: string, years = 0, days = 0) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y! + years, m! - 1, d! + days)).toISOString().slice(0, 10)
}

// Whole years between a date of birth and a given date (both YYYY-MM-DD)
const ageOn = (bornOn: string, on: string) => {
  const [by, bm, bd] = bornOn.split('-').map(Number)
  const [oy, om, od] = on.split('-').map(Number)
  let age = oy! - by!
  if (om! < bm! || (om === bm && od! < bd!)) age--
  return age
}

export const getTravelDates = (offer: DuffelOffer): TravelDates => {
  const dates = offer.slices
    .flatMap((slice) => slice.segments.map((segment) => segment.departing_at.slice(0, 10)))
    .sort()

  const first = dates[0]
  const last = dates[dates.length - 1]

  if (!first || !last) throw new AppError('This fare cannot be booked right now', 422)

  return { first, last }
}

// Adults: 18+ on the first flight. Children: 2 to 17 on every flight date.
// Infants: under 2 on every flight date.
const getBornOnRange = (type: string, dates: TravelDates) => {
  let min = '1900-01-01'
  let max = shiftDate(dates.first, -18)

  if (type === 'child') {
    min = shiftDate(dates.last, -18, 1)
    max = shiftDate(dates.first, -2)
  }

  if (type === 'infant_without_seat') {
    min = shiftDate(dates.last, -2, 1)
    max = dates.first
  }

  return { min, max: max > today() ? today() : max }
}

const bornOnMessage = (type: string) => {
  if (type === 'child') return 'Children must be 2 to 17 years old on every travel date'
  if (type === 'infant_without_seat') return 'Infants must be under 2 years old on every travel date'
  return 'Adults must be 18 or older on the first travel date'
}

export const buildBookingPassengers = (
  offer: DuffelOffer,
  submitted: InitBookingInput['passengers'],
): BookingPassenger[] => {
  const dates = getTravelDates(offer)
  const byId = new Map(submitted.map((p) => [p.id, p]))

  if (byId.size !== submitted.length || submitted.length !== offer.passengers.length) {
    throw new AppError(MISMATCH_MESSAGE, 422)
  }

  return offer.passengers.map((offerPassenger) => {
    const p = byId.get(offerPassenger.id)
    if (!p) throw new AppError(MISMATCH_MESSAGE, 422)

    const type = offerPassenger.type ?? 'adult'
    const label = `${p.givenName} ${p.familyName}`
    const range = getBornOnRange(type, dates)

    if (p.bornOn < range.min || p.bornOn > range.max) {
      throw new AppError(`${label}: ${bornOnMessage(type)}`, 422)
    }

    // Duffel locks in the age used in the search and rejects the order if the DOB doesn't match it.
    // Catch it here, before the customer pays
    const searchedAge = (offerPassenger as { age?: number | null }).age
    if (searchedAge != null && ageOn(p.bornOn, dates.first) !== searchedAge) {
      throw new AppError(
        `${label}: date of birth must make them ${searchedAge} on the first travel date (you searched with age ${searchedAge})`,
        422,
      )
    }

    let passport: BookingPassenger['passport'] = null

    // Passport details are only kept when the airline requires them
    if (offer.passenger_identity_documents_required) {
      if (!p.passport) {
        throw new AppError(`${label}: passport details are required for this fare`, 422)
      }

      if (p.passport.expiresOn <= dates.last) {
        throw new AppError(`${label}: passport must be valid beyond your travel date`, 422)
      }

      passport = {
        number: p.passport.number,
        issuingCountryCode: p.passport.issuingCountryCode,
        expiresOn: p.passport.expiresOn,
      }
    }

    return {
      id: offerPassenger.id,
      type,
      title: p.title,
      gender: p.gender,
      givenName: p.givenName,
      familyName: p.familyName,
      bornOn: p.bornOn,
      passport,
    }
  })
}

// The booking is looked up by the lead passenger's last name. The lead is the first adult.
export const getLeadLastNameKey = (passengers: BookingPassenger[]) => {
  const lead = passengers.find((p) => p.type === 'adult') ?? passengers[0]
  if (!lead) throw new AppError(MISMATCH_MESSAGE, 422)
  return toLastNameKey(lead.familyName)
}