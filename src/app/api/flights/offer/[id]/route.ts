import { NextRequest, NextResponse } from "next/server";

const DUFFEL_BASE = "https://api.duffel.com";
const DUFFEL_TOKEN = process.env.DUFFEL_ACCESS_TOKEN!;

const DUFFEL_HEADERS = {
  Authorization: `Bearer ${DUFFEL_TOKEN}`,
  "Duffel-Version": "v2",
  Accept: "application/json",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!DUFFEL_TOKEN) {
    return NextResponse.json({ error: "Missing Duffel token" }, { status: 500 });
  }

  try {
    const res = await fetch(`${DUFFEL_BASE}/air/offers/${id}`, {
      headers: DUFFEL_HEADERS,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Duffel offer fetch error:", err);
      return NextResponse.json({ error: "Offer not found", detail: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ offer: data.data });
  } catch (err) {
    console.error("Duffel offer fetch error:", err);
    return NextResponse.json({ error: "Internal error", detail: String(err) }, { status: 500 });
  }
}
