"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { MapPin } from "lucide-react";
import { searchLocalAirports } from "@/features/client/flights/airport.data";

export type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
};

// Shape returned by /api/places
type PlaceGroup = {
  city: string;
  country: string;
  cityCode: string | null;
  airports: { code: string; name: string }[];
};

type Status = "idle" | "loading" | "ok" | "error";

// One selectable line in the dropdown
type Row = {
  kind: "city" | "airport" | "single";
  heading: string; // "London, United Kingdom"
  airport: Airport;
};

const MAX_ROWS = 12;

// Airports picked by raw code have city === code, so just show the code
const labelOf = (a: Airport) => (a.city === a.code ? a.code : `${a.city} (${a.code})`);

const headingOf = (city: string, country: string) => (country ? `${city}, ${country}` : city);

const rowsFromGroups = (groups: PlaceGroup[]): Row[] =>
  groups.flatMap<Row>((g) => {
    const heading = headingOf(g.city, g.country);

    // Several airports: an "All airports" row, then each airport underneath
    if (g.cityCode) {
      return [
        {
          kind: "city",
          heading,
          airport: { code: g.cityCode, name: "All airports", city: g.city, country: g.country },
        },
        ...g.airports.map<Row>((a) => ({
          kind: "airport",
          heading,
          airport: { code: a.code, name: a.name, city: g.city, country: g.country },
        })),
      ];
    }

    const a = g.airports[0];
    return a
      ? [{ kind: "single", heading, airport: { code: a.code, name: a.name, city: g.city, country: g.country } }]
      : [];
  });

const rowFromAirport = (a: Airport): Row => ({
  kind: "single",
  heading: headingOf(a.city, a.country),
  airport: a,
});

function highlight(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-ice/30 text-indigo rounded">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

interface AirportInputProps {
  label: string;
  value: Airport | null;
  // Called with null as soon as the user edits the text, so a stale airport
  // can never be searched while the box shows something else.
  onChange: (airport: Airport | null) => void;
  placeholder?: string;
  disabled?: boolean;
  id: string;
}

export default function AirportInput({
  label,
  value,
  onChange,
  placeholder = "City, airport or country",
  disabled = false,
  id,
}: AirportInputProps) {
  const [inputVal, setInputVal] = useState(value ? labelOf(value) : "");
  const [remote, setRemote] = useState<PlaceGroup[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Only sync when an airport is actually selected. While typing, value is
  // null and syncing here would wipe what the user is typing.
  useEffect(() => {
    if (value) setInputVal(labelOf(value));
  }, [value]);

  const query = inputVal.trim();
  const showingSelection = !!value && inputVal === labelOf(value);

  // Duffel place suggestions (through /api/places): debounced, cancellable
  useEffect(() => {
    if (showingSelection || query.length < 2) {
      setRemote([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/places?query=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`/api/places responded ${res.status}`);
        const json = await res.json();
        setRemote(json.data ?? []);
        setStatus("ok");
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        console.warn("Place suggestions failed:", e);
        setRemote([]);
        setStatus("error");
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, showingSelection]);

  const rows = useMemo<Row[]>(() => {
    if (showingSelection || !query) return [];

    // Duffel results only once they belong to the current query
    let list = status === "ok" ? rowsFromGroups(remote) : [];

    // Always blend in local matches (instant while Duffel loads, and they cover
    // countries, states and nicknames that Duffel does not match). No duplicates.
    const seen = new Set(list.map((r) => r.airport.code));
    const localRows = searchLocalAirports(query, 8)
      .filter((a) => !seen.has(a.code))
      .map(rowFromAirport);
    list = [...list, ...localRows].slice(0, MAX_ROWS);

    // Any exact 3-letter airport code can always be selected
    const code = query.toUpperCase();
    if (/^[A-Z]{3}$/.test(code) && status !== "loading" && !list.some((r) => r.airport.code === code)) {
      list = [
        ...list,
        rowFromAirport({ code, name: `Search using airport code ${code}`, city: code, country: "" }),
      ];
    }
    return list;
  }, [query, remote, status, showingSelection]);

  const statusMessage =
    rows.length === 0 && !showingSelection && query.length >= 2 && status !== "idle"
      ? status === "loading"
        ? "Searching…"
        : status === "error"
        ? "Suggestions are unavailable right now. You can type a 3-letter airport code."
        : `No airports found for "${query}". Try the nearest major city, or type the 3-letter airport code.`
      : null;

  const showDropdown = open && (rows.length > 0 || !!statusMessage);
  const activeIdx = Math.min(active, Math.max(rows.length - 1, 0));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    setOpen(true);
    setActive(0);
    if (value) onChange(null);
  };

  const handleSelect = (airport: Airport) => {
    onChange(airport);
    setInputVal(labelOf(airport));
    setRemote([]);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || rows.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((activeIdx + 1) % rows.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((activeIdx - 1 + rows.length) % rows.length);
    } else if (e.key === "Enter") {
      e.preventDefault(); // don't submit the form, just pick the suggestion
      handleSelect(rows[activeIdx].airport);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative flex-1">
      <div className={`bg-offwhite rounded-2xl p-4 transition-all ${focused ? "ring-2 ring-ice" : ""}`}>
        <label htmlFor={id} className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1">
          {label}
        </label>
        <input
          id={id}
          type="text"
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          value={inputVal}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            setFocused(true);
            setOpen(true);
            e.target.select(); // typing replaces the current selection
          }}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className="bg-transparent border-none outline-none w-full text-ink font-semibold md:text-lg placeholder:text-mist placeholder:font-normal"
        />
      </div>

      {!value && query && !focused && (
        <p className="absolute top-full left-2 mt-1 text-xs text-red-500">Pick an airport from the list</p>
      )}

      {showDropdown && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto bg-white rounded-2xl shadow-[0_8px_32px_-8px_rgba(10,17,40,0.18)] border border-line z-50"
        >
          {statusMessage && <div className="px-4 py-3 text-sm text-mist">{statusMessage}</div>}

          {rows.map((row, i) => {
            const { airport, kind, heading } = row;
            const base = `w-full flex items-center gap-3 text-left transition-colors ${
              i === activeIdx ? "bg-offwhite" : ""
            }`;
            const pick = {
              type: "button" as const,
              role: "option" as const,
              "aria-selected": i === activeIdx,
              onMouseDown: (e: React.MouseEvent) => {
                e.preventDefault(); // keep focus in the input
                handleSelect(airport);
              },
              onMouseEnter: () => setActive(i),
            };

            // An airport listed under its city
            if (kind === "airport") {
              return (
                <button key={`${kind}-${airport.code}`} {...pick} className={`${base} pl-16 pr-4 py-2`}>
                  <span className="font-mono text-xs font-bold text-indigo w-9 shrink-0">{airport.code}</span>
                  <span className="text-sm text-ink truncate">{highlight(airport.name, query)}</span>
                </button>
              );
            }

            // A city header ("All airports") or a city with a single airport
            return (
              <button key={`${kind}-${airport.code}`} {...pick} className={`${base} px-4 py-3`}>
                <div className="w-8 h-8 rounded-lg bg-indigo/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-indigo" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-ink leading-tight">{highlight(heading, query)}</div>
                  <div className="text-[11px] text-mist truncate">
                    {kind === "city" ? "All airports" : highlight(airport.name, query)}
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-indigo shrink-0">{airport.code}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}