"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin } from "lucide-react";

export type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
};
// We now use Duffel Places API for real-time search


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
  onChange: (airport: Airport) => void;
  placeholder?: string;
  disabled?: boolean;
  id: string;
}

export default function AirportInput({
  label,
  value,
  onChange,
  placeholder = "City or airport",
  disabled = false,
  id,
}: AirportInputProps) {
  const [inputVal, setInputVal] = useState(value ? `${value.city} (${value.code})` : "");
  const [results, setResults]   = useState<Airport[]>([]);
  const [open, setOpen]         = useState(false);
  const [focused, setFocused]   = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => {
    setInputVal(value ? `${value.city} (${value.code})` : "");
  }, [value]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    try {
      const res = await fetch(`/api/places?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.data) {
        const places = data.data.map((place: any) => ({
          code: place.iata_code || place.iata_country_code || "",
          name: place.name || "",
          city: place.city_name || place.name || "",
          country: place.country_name || ""
        })).filter((p: any) => p.code); // only keep those with a code
        
        setResults(places.slice(0, 8));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputVal && (!value || inputVal !== `${value.city} (${value.code})`)) {
        search(inputVal);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [inputVal, search, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputVal(v);
    setOpen(true);
  };

  const handleSelect = (airport: Airport) => {
    onChange(airport);
    setInputVal(`${airport.city} (${airport.code})`);
    setResults([]);
    setOpen(false);
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

  const showDropdown = open && results.length > 0;

  return (
    <div ref={wrapRef} className="relative flex-1">
      <div
        className={`bg-offwhite rounded-2xl p-4 transition-all ${focused ? "ring-2 ring-ice" : ""}`}
      >
        <label htmlFor={id} className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1">
          {label}
        </label>
        <input
          id={id}
          type="text"
          autoComplete="off"
          value={inputVal}
          onChange={handleChange}
          onFocus={() => { setFocused(true); if (inputVal) search(inputVal); setOpen(true); }}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className="bg-transparent border-none outline-none w-full text-ink font-semibold md:text-lg placeholder:text-mist placeholder:font-normal"
        />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_8px_32px_-8px_rgba(10,17,40,0.18)] border border-line z-50 overflow-hidden">
          {results.map((airport) => (
            <button
              key={airport.code}
              type="button"
              onMouseDown={() => handleSelect(airport)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-offwhite transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo/5 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-indigo" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo">{airport.code}</span>
                  <span className="text-xs text-mist">{airport.country}</span>
                </div>
                <div className="font-semibold text-sm text-ink leading-tight">
                  {highlight(airport.city, inputVal)}
                </div>
                <div className="text-[11px] text-mist truncate">
                  {highlight(airport.name, inputVal)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export {};
