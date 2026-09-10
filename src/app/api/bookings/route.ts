import { NextRequest, NextResponse } from "next/server";

const DUFFEL_BASE = "https://api.duffel.com";
const DUFFEL_TOKEN = process.env.DUFFEL_ACCESS_TOKEN!;

const DUFFEL_HEADERS = {
  Authorization: `Bearer ${DUFFEL_TOKEN}`,
  "Duffel-Version": "v2",
  "Content-Type": "application/json",
  Accept: "application/json",
};

export async function POST(req: NextRequest) {
  if (!DUFFEL_TOKEN) {
    return NextResponse.json({ error: "Missing Duffel token" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { offerId, passengers } = body;

    if (!offerId || !passengers?.length) {
      return NextResponse.json({ error: "offerId and passengers are required" }, { status: 400 });
    }

    const orderBody = {
      data: {
        selected_offers: [offerId],
        passengers,
        payments: [
          {
            type: "balance",
            currency: passengers[0]?.currency ?? "GBP",
            amount: body.amount,
          },
        ],
      },
    };

    const res = await fetch(`${DUFFEL_BASE}/air/orders`, {
      method: "POST",
      headers: DUFFEL_HEADERS,
      body: JSON.stringify(orderBody),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Duffel order error:", err);
      return NextResponse.json({ error: "Booking failed", detail: err }, { status: res.status });
    }

    const data = await res.json();
    const order = data.data;

    return NextResponse.json({
      bookingId: order.id,
      bookingReference: order.booking_reference,
      paymentLink: null, // Duffel balance flow — no redirect link needed
    });
  } catch (err) {
    console.error("Duffel booking error:", err);
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
