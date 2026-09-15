import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const DUFFEL_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;
    if (!DUFFEL_TOKEN) {
      return NextResponse.json({ error: "Missing Duffel token" }, { status: 500 });
    }

    const { offerId } = await req.json();
    if (!offerId) {
      return NextResponse.json({ error: "Missing offerId" }, { status: 400 });
    }

    // Since client keys in Duffel v2 aren't always tied to an offer, let's create a standard client key.
    // If the API requires offer_id, we pass it.
    // Let's create a generic client key or one specific to the offer.
    // A client key doesn't strictly need an offerId if it's just for the session, but we can pass it if Duffel requires.
    // Looking at Duffel docs, POST /air/client_keys doesn't require any body usually, but we'll send it if needed.
    // Let's do a simple empty POST first, as client keys are session-based.

    const res = await fetch("https://api.duffel.com/air/client_keys", {
      method: "POST",
      headers: {
        "Accept-Encoding": "gzip",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Duffel-Version": "v2",
        "Authorization": `Bearer ${DUFFEL_TOKEN}`,
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Duffel client_keys API error:", errorText);
      return NextResponse.json({ error: "Failed to create client key" }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json.data); // Should contain { client_key: "..." }
  } catch (e) {
    console.error("Internal API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
