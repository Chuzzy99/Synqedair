import { NextRequest, NextResponse } from "next/server";

const DUFFEL_BASE = "https://api.duffel.com";
const DUFFEL_TOKEN = process.env.DUFFEL_ACCESS_TOKEN!;

const DUFFEL_HEADERS = {
  Authorization: `Bearer ${DUFFEL_TOKEN}`,
  "Duffel-Version": "v2",
  "Content-Type": "application/json",
  Accept: "application/json",
};

/** Parse Duffel ISO 8601 duration (PT7H5M) → minutes */
function parseDuration(iso: string | null | undefined): number {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  return (parseInt(match[1] || "0") * 60) + parseInt(match[2] || "0");
}

/** Map a raw Duffel offer → our FlightOffer shape */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOffer(offer: any) {
  const slice = offer.slices?.[0];
  const firstSeg = slice?.segments?.[0];
  const lastSeg = slice?.segments?.[slice.segments.length - 1];

  const totalAmount = parseFloat(offer.total_amount ?? "0");
  const baseAmount  = parseFloat(offer.base_amount  ?? "0");
  const taxAmount   = parseFloat(offer.tax_amount   ?? "0");
  const currency    = offer.total_currency ?? "USD";

  const stops = Math.max(0, (slice?.segments?.length ?? 1) - 1);
  const stopAirport =
    stops > 0
      ? slice?.segments?.[0]?.destination?.iata_code ?? null
      : null;

  // Rank by price bucket
  const ranking: string[] = [];
  if (offer.total_amount) {
    ranking.push("best_value"); // Will be re-ranked client-side after all offers load
  }

  // Convert USD-equivalent for non-USD currencies (Duffel handles this)
  const fees = {
    fare:       baseAmount,
    taxes:      taxAmount,
    bags:       0,       // Duffel baggages are separate — keeping $0 for now
    serviceFee: 0,
    total:      totalAmount,
    currency,
  };

  return {
    id:              offer.id,
    airline:         offer.owner?.name ?? firstSeg?.marketing_carrier?.name ?? "Unknown",
    flightNumber:    firstSeg
      ? `${firstSeg.marketing_carrier?.iata_code ?? ""}${firstSeg.marketing_carrier_flight_number ?? ""}`
      : "",
    origin:          firstSeg?.origin?.iata_code       ?? slice?.origin?.iata_code       ?? "",
    destination:     lastSeg?.destination?.iata_code   ?? slice?.destination?.iata_code  ?? "",
    departAt:        firstSeg?.departing_at             ?? slice?.departing_at             ?? "",
    arriveAt:        lastSeg?.arriving_at               ?? slice?.arriving_at              ?? "",
    stops,
    stopAirport,
    durationMinutes: parseDuration(slice?.duration),
    ranking,
    fees,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origin      = searchParams.get("origin")      ?? "LOS";
  const destination = searchParams.get("destination") ?? "LHR";
  const departDate  = searchParams.get("departDate")  ?? new Date().toISOString().split("T")[0];
  const adults      = parseInt(searchParams.get("adults") ?? "1");
  const children    = parseInt(searchParams.get("children") ?? "0");
  const cabinClass  = searchParams.get("cabinClass") ?? "economy";

  if (!DUFFEL_TOKEN) {
    return NextResponse.json({ error: "Missing Duffel token" }, { status: 500 });
  }

  try {
    // ── Step 1: Create an offer request ──────────────────────────────────────
    const offerRequestBody = {
      data: {
        slices: [
          {
            origin,
            destination,
            departure_date: departDate,
          },
        ],
        passengers: [
          ...Array.from({ length: adults }, () => ({ type: "adult" })),
          ...Array.from({ length: children }, () => ({ type: "child" }))
        ],
        cabin_class: cabinClass,
      },
    };

    const orRes = await fetch(`${DUFFEL_BASE}/air/offer_requests`, {
      method: "POST",
      headers: DUFFEL_HEADERS,
      body: JSON.stringify(offerRequestBody),
    });

    if (!orRes.ok) {
      const err = await orRes.text();
      console.error("Duffel offer_request error:", err);
      return NextResponse.json({ error: "Duffel offer request failed", detail: err }, { status: orRes.status });
    }

    const orData = await orRes.json();
    const offerRequestId: string = orData.data?.id;

    if (!offerRequestId) {
      return NextResponse.json({ error: "No offer request ID returned" }, { status: 500 });
    }

    // ── Step 2: Fetch offers ──────────────────────────────────────────────────
    const offersRes = await fetch(
      `${DUFFEL_BASE}/air/offers?offer_request_id=${offerRequestId}&limit=30&sort=total_amount`,
      { headers: DUFFEL_HEADERS }
    );

    if (!offersRes.ok) {
      const err = await offersRes.text();
      console.error("Duffel offers error:", err);
      return NextResponse.json({ error: "Duffel offers fetch failed", detail: err }, { status: offersRes.status });
    }

    const offersData = await offersRes.json();
    const rawOffers: unknown[] = offersData.data ?? [];

    // ── Step 3: Map + rank ────────────────────────────────────────────────────
    const offers = rawOffers.map(mapOffer);

    // Add ranking labels
    if (offers.length > 0) {
      // Cheapest by total price (already sorted by Duffel)
      offers[0].ranking = ["cheapest", "best_value"];

      // Fastest by duration
      const fastestIdx = offers.reduce(
        (bestIdx, o, i) =>
          o.durationMinutes < offers[bestIdx].durationMinutes ? i : bestIdx,
        0
      );
      if (!offers[fastestIdx].ranking.includes("fastest")) {
        offers[fastestIdx].ranking.push("fastest");
      }
    }

    return NextResponse.json({ offers });
  } catch (err) {
    console.error("Duffel search error:", err);
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
