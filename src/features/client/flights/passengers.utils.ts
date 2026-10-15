import type { FlightOffer } from '@/features/client/flights/flights.type';
import {
  normalisePhone,
  type ContactFormValues,
  type PassengerFormValues,
} from '@/features/client/flights/passengers.validation';

export interface SelectOption {
  value: string;
  label: string;
}

const TITLES_BY_GENDER: Record<string, SelectOption[]> = {
  m: [
    { value: 'mr', label: 'Mr' },
    { value: 'dr', label: 'Dr' },
  ],
  f: [
    { value: 'ms', label: 'Ms' },
    { value: 'mrs', label: 'Mrs' },
    { value: 'miss', label: 'Miss' },
    { value: 'dr', label: 'Dr' },
  ],
};

export const getTitleOptions = (gender: string): SelectOption[] => TITLES_BY_GENDER[gender] ?? [];

export const getTitleForGender = (gender: string, current: string) => {
  const options = getTitleOptions(gender);
  if (options.some((option) => option.value === current)) return current;
  return options[0]?.value ?? '';
};

export const createInitialPassengers = (offer: FlightOffer): PassengerFormValues[] =>
  offer.passengers.map((p) => ({
    id: p.id,
    type: p.type,
    title: '',
    gender: '',
    givenName: '',
    familyName: '',
    bornOn: '',
    passport: { number: '', countryCode: '', expiresOn: '' },
  }));

const PRIORITY_COUNTRIES = ['NG', 'GB', 'US', 'CA', 'GH'];

const NOT_COUNTRIES = new Set(['AC', 'CP', 'DG', 'EA', 'EU', 'EZ', 'IC', 'QO', 'TA', 'UN', 'XA', 'XB', 'ZZ']);

let countryCache: SelectOption[] | null = null;

export const getCountryOptions = (): SelectOption[] => {
  if (countryCache) return countryCache;

  const names = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' });
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const all: SelectOption[] = [];

  for (const a of letters) {
    for (const b of letters) {
      const code = `${a}${b}`;
      if (NOT_COUNTRIES.has(code)) continue;
      const label = names.of(code);
      if (label) all.push({ value: code, label });
    }
  }

  const priority = PRIORITY_COUNTRIES.map((code) => all.find((c) => c.value === code)).filter(
    (c): c is SelectOption => Boolean(c)
  );
  const rest = all
    .filter((c) => !PRIORITY_COUNTRIES.includes(c.value))
    .sort((x, y) => x.label.localeCompare(y.label));

  countryCache = [...priority, ...rest];
  return countryCache;
};

export const toBookingPassengers = (
  passengers: PassengerFormValues[],
  contact: ContactFormValues,
  identityRequired: boolean
) =>
  passengers.map((p) => ({
    id: p.id,
    type: p.type,
    title: p.title,
    gender: p.gender,
    first_name: p.givenName.trim(),
    last_name: p.familyName.trim(),
    born_on: p.bornOn,
    phone_number: normalisePhone(contact.phone),
    email: contact.email.trim().toLowerCase(),
    ...(identityRequired
      ? {
          identity_documents: [
            {
              type: 'passport',
              unique_identifier: p.passport.number.trim().toUpperCase(),
              issuing_country_code: p.passport.countryCode.toUpperCase(),
              expires_on: p.passport.expiresOn,
            },
          ],
        }
      : {}),
  }));