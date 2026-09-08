export type FlightOffer = {
  id: string;
  airline: string;
  flightNumber: string;
  departure: { time: string; airport: string };
  arrival: { time: string; airport: string };
  duration: string;
  stops: string;
  price: {
    baseFare: number;
    taxes: number;
    bags: number;
    currency: string;
  };
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
  departureDate?: string;
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
