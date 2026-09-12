import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ data: [] });
  }

  const DUFFEL_TOKEN = process.env.DUFFEL_TOKEN;
  if (!DUFFEL_TOKEN) {
    return NextResponse.json({ error: "Missing Duffel token" }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.duffel.com/places/suggestions?query=${encodeURIComponent(query)}`, {
      headers: {
        "Accept-Encoding": "gzip",
        "Accept": "application/json",
        "Duffel-Version": "v2",
        "Authorization": `Bearer ${DUFFEL_TOKEN}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Duffel places API error:", errorText);
      return NextResponse.json({ error: "Failed to fetch places" }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json);
  } catch (e) {
    console.error("Internal API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
