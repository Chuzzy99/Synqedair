/**
 * Thin Duffel API client for server-side use only.
 * Never expose DUFFEL_ACCESS_TOKEN to the client.
 *
 * Uses the same API version ("Duffel-Version: v2") as the existing
 * bookings/complete and bookings/webhook routes — do not change this.
 */
import type {
  DuffelCreateOrderRequest,
  DuffelOrder,
  DuffelOrderResponse,
  DuffelPassenger,
  DuffelService,
} from "./types";

const DUFFEL_API = "https://api.duffel.com";
const DUFFEL_VERSION = "v2";
/** Maximum number of attempts for transient failures (429, 5xx). */
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 500; // Exponential base delay

// ─── Private helpers ──────────────────────────────────────────────────────────

function getToken(): string {
  const token = process.env.DUFFEL_ACCESS_TOKEN;
  if (!token) throw new Error("[Duffel] DUFFEL_ACCESS_TOKEN is not set");
  return token;
}

function duffelHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Accept-Encoding": "gzip",
    Accept: "application/json",
    "Content-Type": "application/json",
    "Duffel-Version": DUFFEL_VERSION,
  };
}

/** Returns true for HTTP status codes that are worth retrying. */
function isRetryable(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch wrapper with exponential-backoff retry for transient Duffel errors.
 * Throws a descriptive Error on non-retryable failures.
 */
async function duffelFetch(
  path: string,
  options: RequestInit,
  attempt = 1
): Promise<Response> {
  const url = `${DUFFEL_API}${path}`;
  console.info(`[Duffel] ${options.method ?? "GET"} ${path} (attempt ${attempt})`);

  const response = await fetch(url, { ...options, headers: duffelHeaders() });

  if (!response.ok) {
    if (isRetryable(response.status) && attempt < MAX_RETRIES) {
      const delay = RETRY_BASE_MS * 2 ** (attempt - 1);
      console.warn(
        `[Duffel] Retryable error ${response.status} on ${path}. ` +
          `Retrying in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES})…`
      );
      await sleep(delay);
      return duffelFetch(path, options, attempt + 1);
    }

    // Parse error body before throwing so callers get context.
    const raw = await response.text();
    let message = `Duffel API error ${response.status} on ${path}`;
    try {
      const parsed = JSON.parse(raw);
      const firstError = parsed?.errors?.[0];
      if (firstError) {
        message = `[Duffel] ${firstError.title}: ${firstError.message} (code: ${firstError.code})`;
      }
    } catch {
      // raw text is fine
    }
    console.error(`[Duffel] Fatal error: ${message}. Raw: ${raw}`);
    throw new DuffelApiError(message, response.status, raw);
  }

  return response;
}

// ─── Public error class ────────────────────────────────────────────────────────

export class DuffelApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly raw: string
  ) {
    super(message);
    this.name = "DuffelApiError";
  }
}

// ─── Passenger builder ────────────────────────────────────────────────────────

/**
 * Maps the passenger shape stored in our DB (set during booking init) into
 * the exact shape Duffel requires for order creation.
 *
 * The existing `bookings/init` route stores:
 *   { id, first_name, last_name, born_on, title, gender, phone_number, email }
 *
 * Duffel wants:
 *   { id, given_name, family_name, born_on, title, gender, phone_number?, email? }
 */
export function buildDuffelPassengers(
  rawPassengers: Array<Record<string, string>>
): DuffelPassenger[] {
  return rawPassengers.map((p) => ({
    id: p.id,
    given_name: p.first_name ?? p.given_name,
    family_name: p.last_name ?? p.family_name,
    born_on: p.born_on,
    title: p.title as DuffelPassenger["title"],
    gender: p.gender as DuffelPassenger["gender"],
    ...(p.phone_number ? { phone_number: p.phone_number } : {}),
    ...(p.email ? { email: p.email } : {}),
  }));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface CreateDuffelOrderParams {
  offerId: string;
  /** Raw passenger array stored in our DB passengerDetails JSON. */
  rawPassengers: Array<Record<string, string>>;
  services?: DuffelService[];
  /**
   * Settlement currency that Duffel will charge against our Duffel balance.
   * This is always the airline's offer currency (e.g. "USD"), NOT the
   * cardholder's local currency (NGN, GHS, etc.).
   * The customer already paid in local currency via Stripe/Paystack;
   * we pay Duffel from our pre-funded USD balance.
   */
  settlementCurrency: string;
  /** Decimal string, e.g. "250.00". Must match the offer total. */
  settlementAmount: string;
}

/**
 * Creates a confirmed order on Duffel.
 * Returns the full DuffelOrder including booking_reference (PNR) and documents.
 * Throws DuffelApiError on failure.
 */
export async function createDuffelOrder(
  params: CreateDuffelOrderParams
): Promise<DuffelOrder> {
  const passengers = buildDuffelPassengers(params.rawPassengers);

  const body: DuffelCreateOrderRequest = {
    data: {
      type: "instant",
      selected_offers: [params.offerId],
      passengers,
      ...(params.services?.length ? { services: params.services } : {}),
      payments: [
        {
          type: "balance",
          currency: params.settlementCurrency,
          amount: params.settlementAmount,
        },
      ],
    },
  };

  console.info(
    `[Duffel] Creating order for offer ${params.offerId} ` +
      `(${passengers.length} passenger(s), ` +
      `${params.settlementAmount} ${params.settlementCurrency})`
  );

  const response = await duffelFetch("/air/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const json: DuffelOrderResponse = await response.json();
  const order = json.data;

  console.info(
    `[Duffel] Order created: id=${order.id} PNR=${order.booking_reference} ` +
      `tickets=${order.documents.map((d) => d.unique_identifier).join(", ")}`
  );

  return order;
}
