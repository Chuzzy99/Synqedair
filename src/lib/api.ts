import {
  AdvisorParseRequest,
  AdvisorParseResponse,
  FlightSearchRequest,
  FlightSearchResponse,
  BookingRequest,
  BookingResponse,
} from "@/types";

// All requests go to Next.js API routes — Duffel token stays server-side only
const API_BASE = "/api";

export async function parseAdvisorQuery(
  req: AdvisorParseRequest
): Promise<AdvisorParseResponse> {
  // AI advisor is not yet connected — return a basic passthrough
  // so the search form still works via direct origin/destination params
  const query = req.query.trim().toUpperCase();
  const airports = query.match(/\b([A-Z]{3})\b/g);
  if (airports && airports.length >= 2) {
    return {
      searchParams: {
        origin: airports[0],
        destination: airports[1],
      },
    };
  }
  return {
    clarifyingQuestion:
      "Which cities are you flying between? For example: 'Lagos to London'.",
  };
}

export async function searchFlights(
  req: FlightSearchRequest
): Promise<FlightSearchResponse> {
  const params = new URLSearchParams();
  if (req.origin)      params.set("origin",      req.origin);
  if (req.destination) params.set("destination", req.destination);
  if (req.departDate)  params.set("departDate",  req.departDate);
  if (req.returnDate)  params.set("returnDate",  req.returnDate);
  params.set("passengers", String(req.passengers ?? 1));

  const res = await fetch(`${API_BASE}/flights/search?${params.toString()}`);
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Flight search failed (${res.status}): ${detail}`);
  }
  return res.json();
}

export async function getOffer(offerId: string) {
  const res = await fetch(`${API_BASE}/flights/offer/${offerId}`);
  if (!res.ok) throw new Error(`Offer fetch failed (${res.status})`);
  return res.json();
}

export async function createBooking(
  req: BookingRequest
): Promise<BookingResponse> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Booking failed (${res.status}): ${detail}`);
  }
  return res.json();
}
