import { NextResponse } from "next/server";

// Duffel only gives a 2-letter country code, so turn it into a name ("NG" -> "Nigeria")
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const countryName = (code?: string | null) => {
  if (!code) return "";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
};

interface DuffelAirport {
  name: string;
  iata_code: string | null;
  iata_city_code?: string | null;
  iata_country_code?: string | null;
  city_name?: string | null;
  city?: { name?: string | null; iata_code?: string | null } | null;
}

interface DuffelPlace extends DuffelAirport {
  type: "airport" | "city";
  airports?: DuffelAirport[] | null; // present on city results
}

interface PlaceGroup {
  city: string;
  country: string;
  cityCode: string | null; // only set when the city has several airports
  airports: { code: string; name: string }[];
}

const MAX_GROUPS = 8;

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("query")?.trim().slice(0, 60);

  if (!query || query.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const token = process.env.DUFFEL_ACCESS_TOKEN;
  if (!token) {
    console.error("DUFFEL_ACCESS_TOKEN is not set in the Next.js env, so place suggestions are disabled.");
    return NextResponse.json({ error: "Place search is not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://api.duffel.com/places/suggestions?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Accept: "application/json",
          "Duffel-Version": "v2",
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(5000), // never leave the dropdown hanging
        next: { revalidate: 3600 }, // same query within an hour is served from cache
      }
    );

    if (!res.ok) {
      console.error("Duffel places API error:", res.status, await res.text());
      return NextResponse.json({ error: "Failed to fetch places" }, { status: res.status });
    }

    const json: { data?: DuffelPlace[] } = await res.json();

    // Group airports under their city, keeping Duffel's relevance order
    const groups = new Map<string, PlaceGroup>();

    const upsert = (key: string, city: string, country: string): PlaceGroup => {
      let group = groups.get(key);
      if (!group) {
        group = { city, country, cityCode: key, airports: [] };
        groups.set(key, group);
      }
      return group;
    };

    const addAirport = (group: PlaceGroup, code: string | null, name: string) => {
      if (code && code.length === 3 && !group.airports.some((a) => a.code === code)) {
        group.airports.push({ code, name });
      }
    };

    for (const place of json.data ?? []) {
      if (!place.iata_code) continue;

      if (place.type === "city") {
        const group = upsert(place.iata_code, place.name, countryName(place.iata_country_code));
        group.city = place.name;
        (place.airports ?? []).forEach((a) => addAirport(group, a.iata_code, a.name));
      } else {
        const key = place.iata_city_code || place.city?.iata_code || place.iata_code;
        const group = upsert(
          key,
          place.city_name || place.city?.name || place.name,
          countryName(place.iata_country_code)
        );
        addAirport(group, place.iata_code, place.name);
      }
    }

    const data = [...groups.values()]
      .map((group) => {
        // City result with no airport details: keep the city code itself selectable
        if (group.airports.length === 0 && group.cityCode) {
          group.airports.push({ code: group.cityCode, name: `${group.city} airport` });
        }
        // Only multi-airport cities get an "All airports" row
        if (group.airports.length < 2) group.cityCode = null;
        return group;
      })
      .slice(0, MAX_GROUPS);

    // Track what customers type that we can't find, so we know what to add next
    if (data.length === 0) {
      console.info("[places] no suggestions for query:", query);
    }

    return NextResponse.json({ data });
  } catch (e) {
    console.error("Internal places API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}