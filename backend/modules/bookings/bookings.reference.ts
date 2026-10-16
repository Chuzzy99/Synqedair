import { randomInt } from 'node:crypto'
import {
  BOOKING_REFERENCE_ALPHABET,
  BOOKING_REFERENCE_LENGTH,
  BOOKING_REFERENCE_PREFIX,
} from './bookings.constants.js'

// Uses crypto.randomInt, not Math.random, so references can't be predicted.
// 32 characters over 8 places gives about a trillion combinations.
// The unique column in the database is the final guard, so the create step retries on a clash.
export const generateBookingReference = () => {
  let code = ''

  for (let i = 0; i < BOOKING_REFERENCE_LENGTH; i++) {
    code += BOOKING_REFERENCE_ALPHABET.charAt(randomInt(BOOKING_REFERENCE_ALPHABET.length))
  }

  return `${BOOKING_REFERENCE_PREFIX}-${code}`
}