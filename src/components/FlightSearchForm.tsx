"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import AirportInput, { type Airport } from "@/components/AirportInput";
import { searchFlightsSchema } from "@/features/client/flights/flights.validation";
import type { SearchFlightsPayload } from "@/features/client/flights/flights.type";
import {
  getDefaultFormValues,
  todayString,
  type FlightSearchFormValues,
  type SearchCities,
  type TripType,
} from "@/features/client/flights/flights.utils";

const MAX_ADULTS = 9;
const MAX_CHILDREN = 8;
const MAX_INFANTS = 4;
const MAX_PASSENGERS = 9; // adults + children + infants per booking
const DEFAULT_CHILD_AGE = 5;

interface FlightSearchFormProps {
  title?: string;
  initialValues?: Partial<FlightSearchFormValues>;
  originPlaceholder?: string;
  isLoading?: boolean;
  onSubmit: (search: SearchFlightsPayload, cities: SearchCities) => void;
}

export default function FlightSearchForm({
  title,
  initialValues,
  originPlaceholder = "City or airport",
  isLoading = false,
  onSubmit,
}: FlightSearchFormProps) {
  const [init] = useState(() => ({ ...getDefaultFormValues(), ...initialValues }));

  const [origin, setOrigin] = useState<Airport | null>(init.origin);
  const [destination, setDestination] = useState<Airport | null>(init.destination);
  const [tripType, setTripType] = useState<TripType>(init.tripType);
  const [departDate, setDepartDate] = useState(init.departureDate);
  const [returnDate, setReturnDate] = useState(init.returnDate);
  const [adults, setAdults] = useState(init.adults);
  const [childAges, setChildAges] = useState<number[]>(init.childAges);
  const [infants, setInfants] = useState(init.infants);
  const [cabinClass, setCabinClass] = useState(init.cabinClass);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [formError, setFormError] = useState("");

  const totalPassengers = adults + childAges.length + infants;

  const changeAdults = (next: number) => {
    const room = MAX_PASSENGERS - childAges.length - infants;
    const value = Math.min(MAX_ADULTS, room, Math.max(1, next));
    setAdults(value);
    // Each infant needs an adult
    setInfants((current) => Math.min(current, value));
  };

  const addChild = () =>
    setChildAges((ages) =>
      ages.length < MAX_CHILDREN && totalPassengers < MAX_PASSENGERS
        ? [...ages, DEFAULT_CHILD_AGE]
        : ages
    );

  const removeChild = () => setChildAges((ages) => ages.slice(0, -1));

  const changeChildAge = (index: number, age: number) =>
    setChildAges((ages) => ages.map((a, i) => (i === index ? age : a)));

  const changeInfants = (next: number) =>
    setInfants(
      Math.min(MAX_INFANTS, adults, MAX_PASSENGERS - adults - childAges.length, Math.max(0, next))
    );

  const changeDepartDate = (value: string) => {
    setDepartDate(value);
    if (returnDate < value) setReturnDate(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!origin || !destination) return;

    const result = searchFlightsSchema.safeParse({
      origin: origin.code,
      destination: destination.code,
      departureDate: departDate,
      returnDate: tripType === "Round trip" ? returnDate : undefined,
      adults,
      childAges,
      infants,
      cabinClass,
    });

    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? "Please check your search details");
      return;
    }

    onSubmit(result.data, { originCity: origin.city, destinationCity: destination.city });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 sm:gap-0">
        {title ? (
          <h3 className="font-display text-xl md:text-2xl font-medium text-ink leading-snug">{title}</h3>
        ) : (
          <span />
        )}
        <div className="flex bg-offwhite p-1 rounded-xl w-fit">
          {(["Round trip", "One way"] as const).map((type) => (
            <button key={type} type="button" onClick={() => setTripType(type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${tripType === type ? "bg-white text-indigo shadow-sm" : "text-mist hover:text-ink"}`}>
              {type}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <AirportInput
            id="origin-input"
            label="From"
            value={origin}
            onChange={setOrigin}
            placeholder={originPlaceholder}
            disabled={isLoading}
          />
          <AirportInput
            id="destination-input"
            label="To"
            value={destination}
            onChange={setDestination}
            placeholder="e.g. London, Dubai, Nairobi"
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-offwhite rounded-2xl p-4 transition-all focus-within:ring-2 focus-within:ring-ice">
            <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1">Departure</label>
            <input type="date" value={departDate} min={todayString()} onChange={(e) => changeDepartDate(e.target.value)} disabled={isLoading}
              className="bg-transparent border-none outline-none w-full text-ink font-semibold md:text-lg" />
          </div>
          {tripType === "Round trip" && (
            <div className="flex-1 bg-offwhite rounded-2xl p-4 transition-all focus-within:ring-2 focus-within:ring-ice">
              <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1">Return</label>
              <input type="date" value={returnDate} min={departDate} onChange={(e) => setReturnDate(e.target.value)} disabled={isLoading}
                className="bg-transparent border-none outline-none w-full text-ink font-semibold md:text-lg" />
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 relative">
          <div className="flex-1 bg-offwhite rounded-2xl p-4 transition-all relative">
            <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1">Passengers</label>
            <button type="button" onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
              className="bg-transparent border-none outline-none w-full text-left text-ink font-semibold md:text-lg">
              {totalPassengers} passenger{totalPassengers > 1 ? "s" : ""}
            </button>
            {showPassengerDropdown && (
              <div className="absolute top-full left-0 mt-2 w-72 max-h-[70vh] overflow-y-auto bg-white rounded-xl shadow-lg border border-line p-4 z-50">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm font-semibold text-ink">Adults</div>
                    <div className="text-xs text-mist">18+</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => changeAdults(adults - 1)} disabled={adults <= 1} className="w-8 h-8 flex items-center justify-center bg-offwhite rounded-md text-ink font-bold hover:bg-line disabled:opacity-40">-</button>
                    <span className="font-semibold text-ink w-4 text-center">{adults}</span>
                    <button type="button" onClick={() => changeAdults(adults + 1)} disabled={adults >= MAX_ADULTS || totalPassengers >= MAX_PASSENGERS} className="w-8 h-8 flex items-center justify-center bg-offwhite rounded-md text-ink font-bold hover:bg-line disabled:opacity-40">+</button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm font-semibold text-ink">Children</div>
                    <div className="text-xs text-mist">2–17</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={removeChild} disabled={childAges.length === 0} className="w-8 h-8 flex items-center justify-center bg-offwhite rounded-md text-ink font-bold hover:bg-line disabled:opacity-40">-</button>
                    <span className="font-semibold text-ink w-4 text-center">{childAges.length}</span>
                    <button type="button" onClick={addChild} disabled={childAges.length >= MAX_CHILDREN || totalPassengers >= MAX_PASSENGERS} className="w-8 h-8 flex items-center justify-center bg-offwhite rounded-md text-ink font-bold hover:bg-line disabled:opacity-40">+</button>
                  </div>
                </div>

                {childAges.length > 0 && (
                  <div className="flex flex-col gap-2 mb-4">
                    {childAges.map((age, index) => (
                      <label key={index} className="flex items-center justify-between text-xs text-mist font-medium">
                        Child {index + 1} age
                        <select
                          value={age}
                          onChange={(e) => changeChildAge(index, Number(e.target.value))}
                          className="bg-offwhite rounded-md px-2 py-1.5 text-ink font-semibold outline-none"
                        >
                          {Array.from({ length: 16 }, (_, i) => i + 2).map((a) => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm font-semibold text-ink">Infants</div>
                    <div className="text-xs text-mist">Under 2, on an adult&apos;s lap</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => changeInfants(infants - 1)} disabled={infants <= 0} className="w-8 h-8 flex items-center justify-center bg-offwhite rounded-md text-ink font-bold hover:bg-line disabled:opacity-40">-</button>
                    <span className="font-semibold text-ink w-4 text-center">{infants}</span>
                    <button type="button" onClick={() => changeInfants(infants + 1)} disabled={infants >= Math.min(MAX_INFANTS, adults) || totalPassengers >= MAX_PASSENGERS} className="w-8 h-8 flex items-center justify-center bg-offwhite rounded-md text-ink font-bold hover:bg-line disabled:opacity-40">+</button>
                  </div>
                </div>

                <button type="button" onClick={() => setShowPassengerDropdown(false)}
                  className="w-full bg-indigo text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-indigo2 transition-colors">
                  Done
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-offwhite rounded-2xl p-4 transition-all focus-within:ring-2 focus-within:ring-ice">
            <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1">Class</label>
            <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value)} disabled={isLoading}
              className="bg-transparent border-none outline-none w-full text-ink font-semibold md:text-lg appearance-none cursor-pointer">
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium Economy</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </select>
          </div>

          <button type="submit" disabled={isLoading || !origin || !destination}
            className="flex-1 rounded-2xl bg-indigo text-white font-semibold text-lg flex items-center justify-center gap-2 hover:bg-indigo2 transition-colors disabled:opacity-50 min-h-[60px]">
            {isLoading ? <Loader2 className="w-5 h-5 text-ice animate-spin" /> : <>Find flights</>}
          </button>
        </div>

        {formError && <p className="text-red-500 text-sm font-medium">{formError}</p>}
      </form>
    </div>
  );
}