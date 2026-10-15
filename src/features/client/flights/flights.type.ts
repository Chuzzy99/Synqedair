import type { CABIN_CLASSES } from './flights.validation';

export type { SearchFlightsPayload } from './flights.validation';

export type CabinClass = (typeof CABIN_CLASSES)[number];

export interface FlightPlace {
  code: string | null;
  name: string;
  city: string;
}

export interface FlightSegmentPlace extends FlightPlace {
  terminal: string | null;
}

export interface FlightCarrier {
  name: string;
  iataCode: string | null;
  logo: string | null;
}

export interface FlightBaggage {
  type: 'checked' | 'carry_on';
  quantity: number;
}

export interface FlightSegment {
  id: string;
  origin: FlightSegmentPlace;
  destination: FlightSegmentPlace;
  departingAt: string;
  arrivingAt: string;
  duration: string | null;
  carrier: FlightCarrier;
  operatingCarrier: string;
  flightNumber: string;
  aircraft: string | null;
  cabinClass: string | null;
  baggages: FlightBaggage[];
}

export interface FlightSlice {
  id: string;
  origin: FlightPlace;
  destination: FlightPlace;
  duration: string | null;
  stops: number;
  fareBrandName: string | null;
  segments: FlightSegment[];
}

export interface FlightChangeCondition {
  allowed: boolean;
  penalty_amount: string | null;
  penalty_currency: string | null;
}

export interface FlightOffer {
  id: string;

  baseAmount: string;
  taxAmount: string | null;
  totalAmount: string;
  totalCurrency: string;

  serviceFee: {
    name: string;
    amount: string;
  };

  expiresAt: string;
  emissionsKg: string | null;
  identityDocumentsRequired: boolean;

  payment: {
    requiresInstantPayment: boolean;
    paymentRequiredBy: string | null;
    priceGuaranteeExpiresAt: string | null;
  };

  conditions: {
    changeBeforeDeparture: FlightChangeCondition | null;
    refundBeforeDeparture: FlightChangeCondition | null;
  };

  airline: FlightCarrier & { iataCode: string | null };

  passengers: { id: string; type: string | null }[];

  slices: FlightSlice[];
}

export interface FlightOfferService {
  id: string;
  type: string;
  total_amount: string;
  total_currency: string;
  passenger_ids: string[];
  segment_ids: string[];
  metadata?: Record<string, unknown>;
}

export interface FlightOfferDetail extends FlightOffer {
  availableServices: FlightOfferService[];
}

export interface SearchFlightsResponseData {
  offerRequestId: string;
  count: number;
  offers: FlightOffer[];
}

export type FlightOfferResponseData = FlightOfferDetail;

export type FlightSortKey = 'best_value' | 'cheapest' | 'fastest';