import { 
  AdvisorParseRequest, 
  AdvisorParseResponse, 
  FlightSearchRequest, 
  FlightSearchResponse,
  BookingRequest,
  BookingResponse
} from "@/types";

const API_BASE = "http://localhost:4000/api";

export async function parseAdvisorQuery(req: AdvisorParseRequest): Promise<AdvisorParseResponse> {
  const res = await fetch(`${API_BASE}/advisor/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req)
  });
  if (!res.ok) throw new Error("Failed to parse query");
  return res.json();
}

export async function searchFlights(req: FlightSearchRequest): Promise<FlightSearchResponse> {
  const params = new URLSearchParams();
  if (req.origin) params.set("origin", req.origin);
  if (req.destination) params.set("destination", req.destination);
  if (req.departDate) params.set("departDate", req.departDate);
  if (req.returnDate) params.set("returnDate", req.returnDate);
  if (req.passengers) params.set("passengers", req.passengers.toString());
  if (req.filters && req.filters.length > 0) {
    req.filters.forEach(f => params.append("filter", f));
  }
  
  const res = await fetch(`${API_BASE}/flights/search?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to search flights");
  return res.json();
}

export async function createBooking(req: BookingRequest): Promise<BookingResponse> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req)
  });
  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
}
