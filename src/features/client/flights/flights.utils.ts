import type { Airport } from '@/components/AirportInput';
import { searchFlightsSchema } from '@/features/client/flights/flights.validation';
import type {
  FlightOffer,
  FlightSlice,
  FlightSortKey,
  SearchFlightsPayload,
} from '@/features/client/flights/flights.type';

/* ---------- Form shape shared by the home page and /search ---------- */

export type TripType = 'One way' | 'Round trip';

export interface FlightSearchFormValues {
  origin: Airport | null;
  destination: Airport | null;
  tripType: TripType;
  departureDate: string;
  returnDate: string;
  adults: number;
  childAges: number[];
  infants: number;
  cabinClass: string;
}

export interface SearchCities {
  originCity: string;
  destinationCity: string;
}

export const todayString = () => new Date().toISOString().split('T')[0];

const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

export const getDefaultFormValues = (): FlightSearchFormValues => ({
  origin: null,
  destination: null,
  tripType: 'One way',
  departureDate: todayString(),
  returnDate: daysFromNow(7),
  adults: 1,
  childAges: [],
  infants: 0,
  cabinClass: 'economy',
});

/* ---------- URL <-> search ---------- */

// Full search (what the form produces)
export const buildSearchQuery = (search: SearchFlightsPayload, cities: SearchCities) => {
  const params = new URLSearchParams();
  params.set('origin', search.origin);
  params.set('destination', search.destination);
  params.set('originCity', cities.originCity);
  params.set('destinationCity', cities.destinationCity);
  params.set('departureDate', search.departureDate);
  if (search.returnDate) params.set('returnDate', search.returnDate);
  params.set('adults', String(search.adults));
  if (search.childAges.length) params.set('childAges', search.childAges.join(','));
  params.set('infants', String(search.infants));
  params.set('cabinClass', search.cabinClass);
  return params.toString();
};

// Route card click: only origin + destination, so /search shows the form prefilled and does not search yet
export const buildRouteSearchHref = (
  from: { code: string; city: string },
  to: { code: string; city: string }
) => {
  const params = new URLSearchParams({
    origin: from.code,
    destination: to.code,
    originCity: from.city,
    destinationCity: to.city,
  });
  return `/search?${params.toString()}`;
};

const toAirport = (code: string, city: string): Airport => ({
  code,
  name: city,
  city,
  country: '',
});

/**
 * Reads the /search URL.
 * - payload: ready to send to the backend, or null when we should not search
 * - error: why the URL is not a valid search (only when a departure date is present)
 * - initialValues: what to prefill in the form
 */
export const parseSearchParams = (params: URLSearchParams) => {
  const origin = (params.get('origin') ?? '').toUpperCase();
  const destination = (params.get('destination') ?? '').toUpperCase();
  const originCity = params.get('originCity') || origin;
  const destinationCity = params.get('destinationCity') || destination;
  const departureDate = params.get('departureDate') ?? '';
  const returnDate = params.get('returnDate') ?? '';
  const adults = Number(params.get('adults') ?? 1);
  const childAges = (params.get('childAges') ?? '').split(',').filter(Boolean).map(Number);
  const infants = Number(params.get('infants') ?? 0);
  const cabinClass = params.get('cabinClass') ?? 'economy';

  const defaults = getDefaultFormValues();

  const initialValues: FlightSearchFormValues = {
    ...defaults,
    origin: origin ? toAirport(origin, originCity) : null,
    destination: destination ? toAirport(destination, destinationCity) : null,
    tripType: returnDate ? 'Round trip' : 'One way',
    departureDate: departureDate || defaults.departureDate,
    returnDate:
      returnDate ||
      (departureDate > defaults.returnDate ? departureDate : defaults.returnDate),
    adults: Number.isInteger(adults) && adults >= 1 && adults <= 9 ? adults : 1,
    childAges: childAges.filter((age) => Number.isInteger(age) && age >= 2 && age <= 17),
    infants: Number.isInteger(infants) && infants >= 0 && infants <= 4 ? infants : 0,
    cabinClass,
  };

  const cities = { originCity, destinationCity };

  // No departure date means the user has not searched yet (e.g. clicked a route card)
  if (!departureDate) {
    return { payload: null, error: null as string | null, initialValues, cities };
  }

  const result = searchFlightsSchema.safeParse({
    origin,
    destination,
    departureDate,
    returnDate: returnDate || undefined,
    adults,
    childAges,
    infants,
    cabinClass,
  });

  if (!result.success) {
    return {
      payload: null,
      error: (result.error.issues[0]?.message ?? 'These search details are not valid') as string | null,
      initialValues,
      cities,
    };
  }

  return { payload: result.data, error: null as string | null, initialValues, cities };
};

/* ---------- Durations ---------- */

// "PT7H5M" -> 425, "P1DT2H" -> 1560
export const parseIsoDuration = (iso: string | null | undefined): number => {
  if (!iso) return 0;
  const match = iso.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/);
  if (!match) return 0;
  const [, days, hours, minutes] = match;
  return Number(days ?? 0) * 1440 + Number(hours ?? 0) * 60 + Number(minutes ?? 0);
};

// 425 -> "7h 5m"
export const formatDuration = (minutes: number) => {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

export const getSliceMinutes = (slice: FlightSlice) => {
  const total = parseIsoDuration(slice.duration);
  if (total) return total;
  return slice.segments.reduce((sum, seg) => sum + parseIsoDuration(seg.duration), 0);
};

// Total travel time across all slices (both directions for a round trip)
export const getOfferMinutes = (offer: FlightOffer) =>
  offer.slices.reduce((sum, slice) => sum + getSliceMinutes(slice), 0);

export const getOfferStops = (offer: FlightOffer) =>
  offer.slices.reduce((sum, slice) => sum + slice.stops, 0);

/* ---------- Money ---------- */

export const formatMoney = (amount: string | number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount));

/* ---------- Sorting (runs on the frontend after results arrive) ---------- */

const price = (offer: FlightOffer) => Number(offer.totalAmount);

export const sortOffers = (offers: FlightOffer[], key: FlightSortKey): FlightOffer[] => {
  if (offers.length === 0) return [];

  // Offers with no duration data go last when sorting by speed
  const minutesOrLast = (offer: FlightOffer) =>
    getOfferMinutes(offer) || Number.MAX_SAFE_INTEGER;

  if (key === 'cheapest') {
    return [...offers].sort(
      (a, b) => price(a) - price(b) || minutesOrLast(a) - minutesOrLast(b)
    );
  }

  if (key === 'fastest') {
    return [...offers].sort(
      (a, b) => minutesOrLast(a) - minutesOrLast(b) || price(a) - price(b)
    );
  }

  // Best value: 60% price, 40% travel time, plus a small penalty per stop.
  // Price and time are compared against the rest of the results (0 = best, 1 = worst).
  const prices = offers.map(price);
  const knownMinutes = offers.map(getOfferMinutes).filter(Boolean);
  const slowest = knownMinutes.length ? Math.max(...knownMinutes) : 0;
  const minutes = offers.map((offer) => getOfferMinutes(offer) || slowest);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minMinutes = Math.min(...minutes);
  const maxMinutes = Math.max(...minutes);

  const normalise = (value: number, min: number, max: number) =>
    max === min ? 0 : (value - min) / (max - min);

  return offers
    .map((offer, i) => ({
      offer,
      score:
        0.6 * normalise(prices[i], minPrice, maxPrice) +
        0.4 * normalise(minutes[i], minMinutes, maxMinutes) +
        0.03 * getOfferStops(offer),
    }))
    .sort((a, b) => a.score - b.score || price(a.offer) - price(b.offer))
    .map((entry) => entry.offer);
};