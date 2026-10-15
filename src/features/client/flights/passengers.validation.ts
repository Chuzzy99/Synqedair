import { z } from 'zod';
import type { FlightOffer } from '@/features/client/flights/flights.type';

export type PassengerType = 'adult' | 'child' | 'infant_without_seat';

export interface PassportValues {
  number: string;
  countryCode: string;
  expiresOn: string;
}

export interface PassengerFormValues {
  id: string;
  type: string | null;
  title: string;
  gender: string;
  givenName: string;
  familyName: string;
  bornOn: string;
  passport: PassportValues;
}

export interface ContactFormValues {
  email: string;
  phone: string;
}

export interface TravelDates {
  first: string;
  last: string;
}

export type FormErrors = Record<string, string>;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const NAME_REGEX = new RegExp("^[\\p{L}][\\p{L}\\s'.-]*$", 'u');
const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;
const PASSPORT_REGEX = /^[A-Za-z0-9]{5,20}$/;

const today = () => new Date().toISOString().slice(0, 10);

const nameSchema = z
  .string()
  .trim()
  .min(1, 'Required')
  .max(40, 'Too long')
  .regex(NAME_REGEX, 'Use letters only, no numbers or symbols');

const emailSchema = z.string().trim().min(1, 'Enter your email').email('Enter a valid email address');

export const normalisePhone = (value: string) => value.replace(/[\s\-().]/g, '');

const firstError = (schema: z.ZodType, value: unknown) => {
  const result = schema.safeParse(value);
  return result.success ? null : (result.error.issues[0]?.message ?? 'Invalid value');
};

const isRealDate = (value: string) =>
  DATE_REGEX.test(value) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

const shift = (date: string, years = 0, days = 0) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y + years, m - 1, d + days)).toISOString().slice(0, 10);
};

export const getPassengerTypeLabel = (type: string | null) => {
  if (type === 'child') return 'Child';
  if (type === 'infant_without_seat') return 'Infant';
  return 'Adult';
};

export const getTravelDates = (offer: FlightOffer): TravelDates => {
  const firstSegment = offer.slices[0]?.segments[0];
  const lastSlice = offer.slices[offer.slices.length - 1];
  const lastSegment = lastSlice?.segments[lastSlice.segments.length - 1];

  const first = firstSegment?.departingAt.slice(0, 10) ?? today();
  const last = lastSegment?.departingAt.slice(0, 10) ?? first;

  return { first, last };
};

export const getBornOnRange = (type: string | null, dates: TravelDates) => {
  let min = '1900-01-01';
  let max = shift(dates.first, -18);

  if (type === 'child') {
    min = shift(dates.last, -18, 1);
    max = shift(dates.first, -2);
  }

  if (type === 'infant_without_seat') {
    min = shift(dates.last, -2, 1);
    max = dates.first;
  }

  return { min, max: max > today() ? today() : max };
};

const bornOnMessage = (type: string | null) => {
  if (type === 'child') return 'Children must be 2 to 17 years old on every travel date';
  if (type === 'infant_without_seat') return 'Infants must be under 2 years old on every travel date';
  return 'Adults must be 18 or older on the first travel date';
};

export const validateCheckoutForm = (
  contact: ContactFormValues,
  passengers: PassengerFormValues[],
  offer: FlightOffer
): FormErrors => {
  const errors: FormErrors = {};
  const dates = getTravelDates(offer);

  const emailError = firstError(emailSchema, contact.email);
  if (emailError) errors.email = emailError;

  if (!contact.phone.trim()) {
    errors.phone = 'Enter your phone number';
  } else if (!PHONE_REGEX.test(normalisePhone(contact.phone))) {
    errors.phone = 'Use international format, e.g. +2348012345678';
  }

  passengers.forEach((p, i) => {
    const key = `passengers.${i}`;

    const givenError = firstError(nameSchema, p.givenName);
    if (givenError) errors[`${key}.givenName`] = givenError;

    const familyError = firstError(nameSchema, p.familyName);
    if (familyError) errors[`${key}.familyName`] = familyError;

    if (p.gender !== 'm' && p.gender !== 'f') errors[`${key}.gender`] = 'Select gender';
    if (!p.title) errors[`${key}.title`] = 'Select title';

    if (!p.bornOn) {
      errors[`${key}.bornOn`] = 'Enter date of birth';
    } else if (!isRealDate(p.bornOn)) {
      errors[`${key}.bornOn`] = 'Enter a valid date';
    } else {
      const range = getBornOnRange(p.type, dates);
      if (p.bornOn < range.min || p.bornOn > range.max) {
        errors[`${key}.bornOn`] = bornOnMessage(p.type);
      }
    }

    if (offer.identityDocumentsRequired) {
      if (!PASSPORT_REGEX.test(p.passport.number.trim())) {
        errors[`${key}.passport.number`] = 'Enter the passport number (letters and numbers only)';
      }

      if (!/^[A-Za-z]{2}$/.test(p.passport.countryCode)) {
        errors[`${key}.passport.countryCode`] = 'Select the issuing country';
      }

      if (!p.passport.expiresOn) {
        errors[`${key}.passport.expiresOn`] = 'Enter the expiry date';
      } else if (!isRealDate(p.passport.expiresOn)) {
        errors[`${key}.passport.expiresOn`] = 'Enter a valid date';
      } else if (p.passport.expiresOn <= dates.last) {
        errors[`${key}.passport.expiresOn`] = 'Passport must be valid beyond your travel date';
      }
    }
  });

  return errors;
};