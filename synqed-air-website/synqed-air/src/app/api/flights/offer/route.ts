import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing offer id" }, { status: 400 });
  }

  const DUFFEL_TOKEN = process.env.DUFFEL_ACCESS_TOKEN;
  if (!DUFFEL_TOKEN) {
    return NextResponse.json({ error: "Missing Duffel token" }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.duffel.com/air/offers/${id}?return_available_services=true`, {
      headers: {
        "Accept-Encoding": "gzip",
        "Accept": "application/json",
        "Duffel-Version": "v2",
        "Authorization": `Bearer ${DUFFEL_TOKEN}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Duffel single offer API error:", errorText);
      return NextResponse.json({ error: "Failed to fetch offer" }, { status: res.status });
    }

    const json = await res.json();
    return NextResponse.json(json.data);
  } catch (e) {
    console.error("Internal API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
