// Duffel API types used by Synqed Air
// Reference: https://duffel.com/docs/api/v2/orders/create-order

export interface DuffelPassenger {
  id: string;
  given_name: string;
  family_name: string;
  born_on: string; // YYYY-MM-DD
  title: "mr" | "ms" | "mrs" | "miss" | "dr";
  gender: "m" | "f";
  phone_number?: string;
  email?: string;
}

export interface DuffelService {
  id: string;
  quantity: number;
}

export interface DuffelPayment {
  type: "balance" | "arc_bsp_cash";
  currency: string; // ISO 4217, e.g. "USD"
  amount: string; // Decimal string, e.g. "250.00"
}

export interface DuffelCreateOrderRequest {
  data: {
    type: "instant";
    selected_offers: string[];
    passengers: DuffelPassenger[];
    services?: DuffelService[];
    payments: DuffelPayment[];
  };
}

export interface DuffelSlice {
  id: string;
  origin: { iata_code: string };
  destination: { iata_code: string };
  departure_datetime: string;
  arrival_datetime: string;
  segments: DuffelSegment[];
}

export interface DuffelSegment {
  id: string;
  aircraft?: { name: string } | null;
  departure_datetime: string;
  arrival_datetime: string;
  origin: { iata_code: string; name: string };
  destination: { iata_code: string; name: string };
  operating_carrier: { name: string; iata_code: string };
  marketing_carrier_flight_number: string;
}

export interface DuffelOrderDocument {
  type: "electronic_ticket" | "electronic_miscellaneous_document_associated";
  unique_identifier: string; // Ticket number
}

export interface DuffelOrder {
  id: string; // ord_xxx
  booking_reference: string; // 6-char PNR, e.g. "ABCDEF"
  passengers: DuffelPassenger[];
  slices: DuffelSlice[];
  documents: DuffelOrderDocument[];
  total_amount: string;
  total_currency: string;
  payment_status: {
    awaiting_payment: boolean;
    paid_at: string | null;
  };
  created_at: string;
}

export interface DuffelOrderResponse {
  data: DuffelOrder;
}

export interface DuffelError {
  errors: Array<{
    code: string;
    message: string;
    title: string;
    type: string;
  }>;
  meta: { status: number; request_id: string };
}
