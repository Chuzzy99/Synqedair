"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { FlightOffer, FlightSlice } from "@/features/client/flights/flights.type";
import {
  formatDuration,
  formatMoney,
  getSliceMinutes,
} from "@/features/client/flights/flights.utils";

// Airport times come back as local time without a timezone (e.g. "2026-10-20T08:10:00"),
// so we read them as text instead of converting them to the visitor's timezone.
const timeOf = (iso: string) => iso.slice(11, 16);
const dateOf = (iso: string) => iso.slice(0, 10);

const formatDay = (iso: string) =>
  new Date(`${dateOf(iso)}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

// How many calendar days later the flight lands (shows "+1")
const daysLater = (fromIso: string, toIso: string) =>
  Math.round(
    (Date.parse(`${dateOf(toIso)}T00:00:00Z`) - Date.parse(`${dateOf(fromIso)}T00:00:00Z`)) /
      (24 * 60 * 60 * 1000)
  );

// Uses the smallest allowance across the slice's flights, so we never promise more than the worst leg
const getBaggageSummary = (slice: FlightSlice) => {
  if (slice.segments.length === 0) return null;

  const hasData = slice.segments.some((seg) => seg.baggages.length > 0);
  if (!hasData) return "Baggage info unavailable";

  const lowest = (type: "checked" | "carry_on") =>
    Math.min(
      ...slice.segments.map((seg) =>
        seg.baggages.filter((b) => b.type === type).reduce((sum, b) => sum + b.quantity, 0)
      )
    );

  const checked = lowest("checked");
  const carryOn = lowest("carry_on");

  const parts = [
    checked === 0 ? "No checked bag" : `${checked} checked bag${checked > 1 ? "s" : ""}`,
    carryOn === 0 ? "No carry-on" : `${carryOn} carry-on`,
  ];

  return parts.join(" · ");
};

function SliceRow({ slice, label }: { slice: FlightSlice; label?: string }) {
  const first = slice.segments[0];
  const last = slice.segments[slice.segments.length - 1];
  if (!first || !last) return null;

  const carrierNames = [...new Set(slice.segments.map((seg) => seg.carrier.name))].join(", ");
  const flightNumbers = slice.segments.map((seg) => seg.flightNumber).join(" · ");
  const layovers = slice.segments
    .slice(0, -1)
    .map((seg) => seg.destination.code ?? seg.destination.name);
  const dayOffset = daysLater(first.departingAt, last.arrivingAt);
  const minutes = getSliceMinutes(slice);
  const baggage = getBaggageSummary(slice);

  const stopsText =
    slice.stops === 0
      ? "Direct"
      : `${slice.stops} stop${slice.stops > 1 ? "s" : ""} · ${layovers.join(", ")}`;

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-mist font-medium mb-2">
        {first.carrier.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={first.carrier.logo} alt="" className="w-5 h-5 object-contain" />
        )}
        <span>
          {label ? `${label} · ${formatDay(first.departingAt)} · ` : ""}
          {carrierNames} · {flightNumbers}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-left">
          <div className="font-display font-semibold text-base md:text-lg text-ink">
            {timeOf(first.departingAt)}
          </div>
          <div className="font-mono text-[11px] text-mist tracking-wider">
            {first.origin.code ?? first.origin.city}
          </div>
        </div>

        <div className="flex-1">
          <div className="text-[11px] text-mist text-center mb-1">
            {stopsText}
            {minutes ? ` · ${formatDuration(minutes)}` : ""}
          </div>
          <div className="h-px bg-line relative">
            <div className="absolute left-0 -top-[2px] w-[5px] h-[5px] rounded-full bg-mist"></div>
            <div className="absolute right-0 -top-[2px] w-[5px] h-[5px] rounded-full bg-[#1C9BB8]"></div>
          </div>
        </div>

        <div className="text-right">
          <div className="font-display font-semibold text-base md:text-lg text-ink">
            {timeOf(last.arrivingAt)}
            {dayOffset > 0 && (
              <sup className="text-[10px] text-[#1C9BB8] font-bold ml-0.5">+{dayOffset}</sup>
            )}
          </div>
          <div className="font-mono text-[11px] text-mist tracking-wider">
            {last.destination.code ?? last.destination.city}
          </div>
        </div>
      </div>

      {baggage && <div className="text-[11px] text-mist mt-2">{baggage}</div>}
    </div>
  );
}

export default function FlightOfferCard({ offer }: { offer: FlightOffer }) {
  const router = useRouter();

  const isRoundTrip = offer.slices.length > 1;
  const travelers = offer.passengers.length;

  const money = (amount: string | number) => formatMoney(amount, offer.totalCurrency);

  // The backend adds our service fee into baseAmount, so subtract it to show the airline fare on its own
  const airlineFare = Number(offer.baseAmount) - Number(offer.serviceFee.amount);

  return (
    <motion.button
      whileHover={{ y: -6 }}
      onClick={() => router.push(`/checkout/${offer.id}`)}
      className="w-full text-left bg-white rounded-2xl p-5 shadow-[0_10px_20px_-14px_rgba(10,17,40,.25)] hover:shadow-[0_14px_28px_-12px_rgba(10,17,40,.35)] transition-shadow"
    >
      <div className="flex justify-between items-start gap-3 mb-4">
        <div className="text-xs text-mist font-medium">
          {offer.airline.name}
          {isRoundTrip ? " · Round trip" : ""}
        </div>
        <div className="text-right">
          <b className="font-display text-lg md:text-xl text-ink block">
            {money(offer.totalAmount)}
          </b>
          <div className="text-[11px] text-mist mt-0.5">
            for {travelers} traveler{travelers > 1 ? "s" : ""}
          </div>
          <div className="text-[9px] md:text-[10px] text-[#2E7D3B] font-bold uppercase tracking-wider mt-0.5">
            ✓ all fees included
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {offer.slices.map((slice, index) => (
          <SliceRow
            key={slice.id}
            slice={slice}
            label={isRoundTrip ? (index === 0 ? "Outbound" : "Return") : undefined}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-dashed border-line">
        <div className="text-[10px] md:text-[11px] text-mist text-left">
          Fare
          <b className="block text-ink text-xs md:text-sm font-semibold mt-0.5">
            {money(airlineFare)}
          </b>
        </div>
        <div className="text-[10px] md:text-[11px] text-mist text-center">
          Taxes
          <b className="block text-ink text-xs md:text-sm font-semibold mt-0.5">
            {offer.taxAmount ? money(offer.taxAmount) : "Included"}
          </b>
        </div>
        <div className="text-[10px] md:text-[11px] text-mist text-right">
          {offer.serviceFee.name}
          <b className="block text-ink text-xs md:text-sm font-semibold mt-0.5">
            {money(offer.serviceFee.amount)}
          </b>
        </div>
      </div>
    </motion.button>
  );
}