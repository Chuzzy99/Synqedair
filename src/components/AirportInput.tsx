"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin } from "lucide-react";

export type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
};

// Major world airports with IATA codes
const AIRPORTS: Airport[] = [
  // Africa
  { code: "LOS", name: "Murtala Muhammed International", city: "Lagos", country: "Nigeria" },
  { code: "ABV", name: "Nnamdi Azikiwe International", city: "Abuja", country: "Nigeria" },
  { code: "PHC", name: "Port Harcourt International", city: "Port Harcourt", country: "Nigeria" },
  { code: "KAN", name: "Mallam Aminu Kano International", city: "Kano", country: "Nigeria" },
  { code: "ACC", name: "Kotoka International", city: "Accra", country: "Ghana" },
  { code: "NBO", name: "Jomo Kenyatta International", city: "Nairobi", country: "Kenya" },
  { code: "MBA", name: "Moi International", city: "Mombasa", country: "Kenya" },
  { code: "ADD", name: "Addis Ababa Bole International", city: "Addis Ababa", country: "Ethiopia" },
  { code: "JNB", name: "O.R. Tambo International", city: "Johannesburg", country: "South Africa" },
  { code: "CPT", name: "Cape Town International", city: "Cape Town", country: "South Africa" },
  { code: "DUR", name: "King Shaka International", city: "Durban", country: "South Africa" },
  { code: "DAR", name: "Julius Nyerere International", city: "Dar es Salaam", country: "Tanzania" },
  { code: "KGL", name: "Kigali International", city: "Kigali", country: "Rwanda" },
  { code: "EBB", name: "Entebbe International", city: "Kampala", country: "Uganda" },
  { code: "DKR", name: "Blaise Diagne International", city: "Dakar", country: "Senegal" },
  { code: "ABJ", name: "Félix-Houphouët-Boigny International", city: "Abidjan", country: "Côte d'Ivoire" },
  { code: "CMN", name: "Mohammed V International", city: "Casablanca", country: "Morocco" },
  { code: "CAI", name: "Cairo International", city: "Cairo", country: "Egypt" },
  { code: "ALG", name: "Houari Boumediene", city: "Algiers", country: "Algeria" },
  { code: "TUN", name: "Tunis-Carthage International", city: "Tunis", country: "Tunisia" },
  { code: "LUN", name: "Kenneth Kaunda International", city: "Lusaka", country: "Zambia" },
  { code: "HRE", name: "Robert Gabriel Mugabe International", city: "Harare", country: "Zimbabwe" },
  { code: "MRU", name: "Sir Seewoosagur Ramgoolam International", city: "Port Louis", country: "Mauritius" },
  { code: "TNR", name: "Ivato International", city: "Antananarivo", country: "Madagascar" },
  { code: "BKO", name: "Bamako-Sénou International", city: "Bamako", country: "Mali" },
  { code: "OUA", name: "Thomas Sankara International", city: "Ouagadougou", country: "Burkina Faso" },
  { code: "LFW", name: "Gnassingbé Eyadéma International", city: "Lomé", country: "Togo" },
  { code: "COO", name: "Cadjehoun Airport", city: "Cotonou", country: "Benin" },
  { code: "NIM", name: "Diori Hamani International", city: "Niamey", country: "Niger" },
  { code: "DLA", name: "Douala International", city: "Douala", country: "Cameroon" },
  { code: "NSI", name: "Yaoundé Nsimalen International", city: "Yaoundé", country: "Cameroon" },
  { code: "LBV", name: "Libreville International", city: "Libreville", country: "Gabon" },
  { code: "FIH", name: "N'djili International", city: "Kinshasa", country: "DR Congo" },
  { code: "BZV", name: "Maya-Maya Airport", city: "Brazzaville", country: "Congo" },
  { code: "SSG", name: "Malabo International", city: "Malabo", country: "Equatorial Guinea" },
  { code: "GBE", name: "Sir Seretse Khama International", city: "Gaborone", country: "Botswana" },
  { code: "WDH", name: "Hosea Kutako International", city: "Windhoek", country: "Namibia" },
  { code: "MQP", name: "Kruger Mpumalanga International", city: "Nelspruit", country: "South Africa" },
  // Europe
  { code: "LHR", name: "Heathrow Airport", city: "London", country: "United Kingdom" },
  { code: "LGW", name: "Gatwick Airport", city: "London", country: "United Kingdom" },
  { code: "STN", name: "Stansted Airport", city: "London", country: "United Kingdom" },
  { code: "MAN", name: "Manchester Airport", city: "Manchester", country: "United Kingdom" },
  { code: "EDI", name: "Edinburgh Airport", city: "Edinburgh", country: "United Kingdom" },
  { code: "BHX", name: "Birmingham Airport", city: "Birmingham", country: "United Kingdom" },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France" },
  { code: "ORY", name: "Orly Airport", city: "Paris", country: "France" },
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany" },
  { code: "MUC", name: "Munich Airport", city: "Munich", country: "Germany" },
  { code: "DUS", name: "Düsseldorf Airport", city: "Düsseldorf", country: "Germany" },
  { code: "BER", name: "Berlin Brandenburg Airport", city: "Berlin", country: "Germany" },
  { code: "AMS", name: "Amsterdam Schiphol", city: "Amsterdam", country: "Netherlands" },
  { code: "MAD", name: "Adolfo Suárez Madrid–Barajas", city: "Madrid", country: "Spain" },
  { code: "BCN", name: "Barcelona–El Prat", city: "Barcelona", country: "Spain" },
  { code: "FCO", name: "Leonardo da Vinci International", city: "Rome", country: "Italy" },
  { code: "MXP", name: "Milan Malpensa", city: "Milan", country: "Italy" },
  { code: "LIS", name: "Humberto Delgado Airport", city: "Lisbon", country: "Portugal" },
  { code: "VIE", name: "Vienna International", city: "Vienna", country: "Austria" },
  { code: "ZRH", name: "Zurich Airport", city: "Zurich", country: "Switzerland" },
  { code: "BRU", name: "Brussels Airport", city: "Brussels", country: "Belgium" },
  { code: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark" },
  { code: "OSL", name: "Oslo Gardermoen Airport", city: "Oslo", country: "Norway" },
  { code: "ARN", name: "Stockholm Arlanda", city: "Stockholm", country: "Sweden" },
  { code: "HEL", name: "Helsinki-Vantaa Airport", city: "Helsinki", country: "Finland" },
  { code: "DUB", name: "Dublin Airport", city: "Dublin", country: "Ireland" },
  { code: "WAW", name: "Warsaw Chopin Airport", city: "Warsaw", country: "Poland" },
  { code: "PRG", name: "Václav Havel Airport", city: "Prague", country: "Czech Republic" },
  { code: "BUD", name: "Budapest Ferenc Liszt International", city: "Budapest", country: "Hungary" },
  { code: "ATH", name: "Athens International", city: "Athens", country: "Greece" },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey" },
  { code: "SAW", name: "Sabiha Gökçen International", city: "Istanbul", country: "Turkey" },
  // Middle East
  { code: "DXB", name: "Dubai International", city: "Dubai", country: "UAE" },
  { code: "AUH", name: "Abu Dhabi International", city: "Abu Dhabi", country: "UAE" },
  { code: "DOH", name: "Hamad International", city: "Doha", country: "Qatar" },
  { code: "RUH", name: "King Khalid International", city: "Riyadh", country: "Saudi Arabia" },
  { code: "JED", name: "King Abdulaziz International", city: "Jeddah", country: "Saudi Arabia" },
  { code: "KWI", name: "Kuwait International", city: "Kuwait City", country: "Kuwait" },
  { code: "BAH", name: "Bahrain International", city: "Manama", country: "Bahrain" },
  { code: "MCT", name: "Muscat International", city: "Muscat", country: "Oman" },
  { code: "AMM", name: "Queen Alia International", city: "Amman", country: "Jordan" },
  { code: "BEY", name: "Rafic Hariri International", city: "Beirut", country: "Lebanon" },
  { code: "TLV", name: "Ben Gurion International", city: "Tel Aviv", country: "Israel" },
  // North America
  { code: "JFK", name: "John F. Kennedy International", city: "New York", country: "USA" },
  { code: "EWR", name: "Newark Liberty International", city: "New York", country: "USA" },
  { code: "LGA", name: "LaGuardia Airport", city: "New York", country: "USA" },
  { code: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "USA" },
  { code: "ORD", name: "O'Hare International", city: "Chicago", country: "USA" },
  { code: "MDW", name: "Chicago Midway", city: "Chicago", country: "USA" },
  { code: "ATL", name: "Hartsfield-Jackson Atlanta International", city: "Atlanta", country: "USA" },
  { code: "DFW", name: "Dallas/Fort Worth International", city: "Dallas", country: "USA" },
  { code: "IAH", name: "George Bush Intercontinental", city: "Houston", country: "USA" },
  { code: "MIA", name: "Miami International", city: "Miami", country: "USA" },
  { code: "SFO", name: "San Francisco International", city: "San Francisco", country: "USA" },
  { code: "BOS", name: "Logan International", city: "Boston", country: "USA" },
  { code: "SEA", name: "Seattle-Tacoma International", city: "Seattle", country: "USA" },
  { code: "PHL", name: "Philadelphia International", city: "Philadelphia", country: "USA" },
  { code: "DCA", name: "Ronald Reagan Washington National", city: "Washington DC", country: "USA" },
  { code: "IAD", name: "Washington Dulles International", city: "Washington DC", country: "USA" },
  { code: "DTW", name: "Detroit Metropolitan Wayne County", city: "Detroit", country: "USA" },
  { code: "MSP", name: "Minneapolis-Saint Paul International", city: "Minneapolis", country: "USA" },
  { code: "PHX", name: "Phoenix Sky Harbor International", city: "Phoenix", country: "USA" },
  { code: "CLT", name: "Charlotte Douglas International", city: "Charlotte", country: "USA" },
  { code: "YYZ", name: "Toronto Pearson International", city: "Toronto", country: "Canada" },
  { code: "YVR", name: "Vancouver International", city: "Vancouver", country: "Canada" },
  { code: "YUL", name: "Montréal-Trudeau International", city: "Montreal", country: "Canada" },
  { code: "YYC", name: "Calgary International", city: "Calgary", country: "Canada" },
  { code: "MEX", name: "Benito Juárez International", city: "Mexico City", country: "Mexico" },
  // South America
  { code: "GRU", name: "São Paulo–Guarulhos International", city: "São Paulo", country: "Brazil" },
  { code: "GIG", name: "Rio de Janeiro–Galeão International", city: "Rio de Janeiro", country: "Brazil" },
  { code: "EZE", name: "Ministro Pistarini International", city: "Buenos Aires", country: "Argentina" },
  { code: "BOG", name: "El Dorado International", city: "Bogotá", country: "Colombia" },
  { code: "LIM", name: "Jorge Chávez International", city: "Lima", country: "Peru" },
  { code: "SCL", name: "Arturo Merino Benítez International", city: "Santiago", country: "Chile" },
  // Asia Pacific
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore" },
  { code: "HKG", name: "Hong Kong International", city: "Hong Kong", country: "China" },
  { code: "PEK", name: "Beijing Capital International", city: "Beijing", country: "China" },
  { code: "PVG", name: "Shanghai Pudong International", city: "Shanghai", country: "China" },
  { code: "CAN", name: "Guangzhou Baiyun International", city: "Guangzhou", country: "China" },
  { code: "NRT", name: "Narita International", city: "Tokyo", country: "Japan" },
  { code: "HND", name: "Tokyo Haneda", city: "Tokyo", country: "Japan" },
  { code: "ICN", name: "Incheon International", city: "Seoul", country: "South Korea" },
  { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand" },
  { code: "KUL", name: "Kuala Lumpur International", city: "Kuala Lumpur", country: "Malaysia" },
  { code: "CGK", name: "Soekarno–Hatta International", city: "Jakarta", country: "Indonesia" },
  { code: "MNL", name: "Ninoy Aquino International", city: "Manila", country: "Philippines" },
  { code: "DEL", name: "Indira Gandhi International", city: "New Delhi", country: "India" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", country: "India" },
  { code: "MAA", name: "Chennai International", city: "Chennai", country: "India" },
  { code: "BLR", name: "Kempegowda International", city: "Bangalore", country: "India" },
  { code: "HYD", name: "Rajiv Gandhi International", city: "Hyderabad", country: "India" },
  { code: "CCU", name: "Netaji Subhas Chandra Bose International", city: "Kolkata", country: "India" },
  { code: "SYD", name: "Sydney Kingsford Smith", city: "Sydney", country: "Australia" },
  { code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "Australia" },
  { code: "BNE", name: "Brisbane Airport", city: "Brisbane", country: "Australia" },
  { code: "AKL", name: "Auckland Airport", city: "Auckland", country: "New Zealand" },
];

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

  const search = useCallback((q: string) => {
    if (!q.trim()) { setResults([]); return; }
    const lower = q.toLowerCase();
    const matches = AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(lower) ||
        a.city.toLowerCase().includes(lower) ||
        a.name.toLowerCase().includes(lower) ||
        a.country.toLowerCase().includes(lower)
    ).slice(0, 8);
    setResults(matches);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInputVal(v);
    search(v);
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

export { AIRPORTS };
