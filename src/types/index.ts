export type RankingLabel = "best_value" | "fastest" | "cheapest";

export interface FeeBreakdown {
  fare:       number;
  taxes:      number;
  bags:       number;
  serviceFee: number;
  total:      number;
  currency:   string;
}

export type FlightOffer = {
  id:              string;
  airline:         string;
  flightNumber:    string;
  origin:          string;
  destination:     string;
  departAt:        string;
  arriveAt:        string;
  stops:           number;
  stopAirport:     string | null;
  durationMinutes: number;
  ranking:         string[];   // "cheapest" | "fastest" | "best_value"
  fees:            FeeBreakdown;
  cabinClass?:     string;     // "economy" | "business" | "first"
};

export type AdvisorParseRequest = {
  query: string;
};

export type AdvisorParseResponse = {
  searchParams?: {
    origin:          string;
    destination:     string;
    departureDate?:  string;
    filters?:        string[];
  };
  clarifyingQuestion?: string;
};

export type FlightSearchRequest = {
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  cabinClass?: string;
  filters?: string[];
};

export type FlightSearchResponse = {
  offers: FlightOffer[];
};

// Duffel passenger shape for booking
export type DuffelPassenger = {
  id?:           string;   // from offer's passenger list
  given_name:    string;
  family_name:   string;
  born_on:       string;   // YYYY-MM-DD
  email:         string;
  phone_number:  string;   // E.164 format e.g. +2348012345678
  gender:        "m" | "f";
  title:         "mr" | "ms" | "mrs" | "miss" | "dr";
  type:          "adult" | "child" | "infant_without_seat";
};

export type BookingRequest = {
  offerId:    string;
  passengers: DuffelPassenger[];
  amount?:    string;
  currency?:  string;
};

export type BookingResponse = {
  bookingId:         string;
  bookingReference?: string;
  paymentLink:       string | null;
};
