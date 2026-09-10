export type RankingLabel = "best_value" | "fastest" | "cheapest";

export interface FeeBreakdown {
  fare: number;
  taxes: number;
  bags: number;
  serviceFee: number;
  total: number;
  currency: string;
}

export type FlightOffer = {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departAt: string;
  arriveAt: string;
  stops: number;
  stopAirport: string | null;
  durationMinutes: number;
  ranking: RankingLabel[];
  fees: FeeBreakdown;
};
export type AdvisorParseRequest = {
  query: string;
};

export type AdvisorParseResponse = {
  searchParams?: {
    origin: string;
    destination: string;
    departureDate?: string;
    filters?: string[];
  };
  clarifyingQuestion?: string;
};

export type FlightSearchRequest = {
  origin: string;
  destination: string;
  departDate?: string;
  returnDate?: string;
  passengers?: number;
  filters?: string[];
};

export type FlightSearchResponse = {
  offers: FlightOffer[];
};

export type BookingRequest = {
  offerId: string;
  passengers: any[]; // Stubbed
};

export type BookingResponse = {
  bookingId: string;
  paymentLink: string;
};
