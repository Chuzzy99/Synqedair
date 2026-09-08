import { 
  AdvisorParseRequest, 
  AdvisorParseResponse, 
  FlightSearchRequest, 
  FlightSearchResponse,
  BookingRequest,
  BookingResponse
} from "@/types";

// For now, we mock the API delay and responses since the Node backend may not be fully connected yet.
const MOCK_DELAY = 1500;

export async function parseAdvisorQuery(req: AdvisorParseRequest): Promise<AdvisorParseResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerQuery = req.query.toLowerCase();
      
      // Simulate low confidence response
      if (lowerQuery.length < 5 || lowerQuery.includes("where should i go")) {
        resolve({
          clarifyingQuestion: "I can help with that! Are you looking for a direct flight or the absolute cheapest fare?"
        });
        return;
      }

      // Simulate successful extraction
      resolve({
        searchParams: {
          origin: "LOS",
          destination: "NBO",
          filters: lowerQuery.includes("cheap") ? ["Cheapest"] : ["Best value"]
        }
      });
    }, MOCK_DELAY);
  });
}

export async function searchFlights(req: FlightSearchRequest): Promise<FlightSearchResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        offers: [
          {
            id: "offer_1",
            airline: "Kenya Airways",
            flightNumber: "KQ 512",
            departure: { time: "06:20", airport: "LOS" },
            arrival: { time: "16:00", airport: "NBO" },
            duration: "7h 40m",
            stops: "1 stop · Addis Ababa (1h 10m)",
            price: { baseFare: 312000, taxes: 58700, bags: 16500, currency: "NGN" },
          },
          {
            id: "offer_2",
            airline: "Ethiopian Airlines",
            flightNumber: "ET 901",
            departure: { time: "11:05", airport: "LOS" },
            arrival: { time: "16:20", airport: "NBO" },
            duration: "5h 15m",
            stops: "Direct",
            price: { baseFare: 402000, taxes: 51200, bags: 15700, currency: "NGN" },
          },
          {
            id: "offer_3",
            airline: "RwandAir",
            flightNumber: "WB 465",
            departure: { time: "13:45", airport: "LOS" },
            arrival: { time: "22:50", airport: "NBO" },
            duration: "9h 05m",
            stops: "1 stop · Kigali (1h 35m)",
            price: { baseFare: 289000, taxes: 42800, bags: 12700, currency: "NGN" },
          },
        ]
      });
    }, MOCK_DELAY);
  });
}

export async function createBooking(req: BookingRequest): Promise<BookingResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        bookingId: "BKG-992-12",
        paymentLink: "https://checkout.paystack.com/mock-link"
      });
    }, MOCK_DELAY);
  });
}
