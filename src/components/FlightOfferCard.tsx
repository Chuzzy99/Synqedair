"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FlightOffer } from "@/types";

export default function FlightOfferCard({
  offer,
}: {
  offer: FlightOffer;
}) {
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return "";
    }
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const renderRankingBadges = () => {
    if (!offer.ranking || offer.ranking.length === 0) return null;
    
    return (
      <div className="flex gap-2 mb-3">
        {offer.ranking.includes("best_value") && (
          <span className="bg-indigo text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Best Value</span>
        )}
        {offer.ranking.includes("cheapest") && (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Cheapest</span>
        )}
        {offer.ranking.includes("fastest") && (
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Fastest</span>
        )}
      </div>
    );
  };

  return (
    <motion.button 
      whileHover={{ y: -6 }}
      onClick={() => router.push(`/companion?offerId=${offer.id}`)}
      className="w-full text-left bg-white rounded-2xl p-5 shadow-[0_10px_20px_-14px_rgba(10,17,40,.25)] hover:shadow-[0_14px_28px_-12px_rgba(10,17,40,.35)] transition-shadow"
    >
      {renderRankingBadges()}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
        <div>
          <div className="text-xs text-mist font-medium">{offer.airline} · {offer.flightNumber}</div>
          <div className="font-display font-semibold text-base md:text-lg text-ink mt-1">
            {formatTime(offer.departAt)} — {formatTime(offer.arriveAt)}
          </div>
        </div>
        <div className="text-left sm:text-right">
          <b className="font-display text-lg md:text-xl text-ink block">{formatCurrency(offer.fees.total)}</b>
          <div className="text-[9px] md:text-[10px] text-[#2E7D3B] font-bold uppercase tracking-wider mt-0.5">
            ✓ all fees included
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 my-4">
        <div className="flex-1 h-px bg-line relative">
          <div className="absolute left-0 -top-[2px] w-[5px] h-[5px] rounded-full bg-mist"></div>
          <div className="absolute right-0 -top-[2px] w-[5px] h-[5px] rounded-full bg-[#1C9BB8]"></div>
        </div>
      </div>

      <div className="text-xs text-mist text-center mb-3">
        {offer.stops === 0 ? `Direct · ${formatDuration(offer.durationMinutes)}` : `${offer.stops} stop${offer.stops > 1 ? "s" : ""} · ${offer.stopAirport} · ${formatDuration(offer.durationMinutes)}`}
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-dashed border-line">
        <div className="text-[10px] md:text-[11px] text-mist text-left">
          Fare
          <b className="block text-ink text-xs md:text-sm font-semibold mt-0.5">{formatCurrency(offer.fees.fare)}</b>
        </div>
        <div className="text-[10px] md:text-[11px] text-mist text-center">
          Taxes
          <b className="block text-ink text-xs md:text-sm font-semibold mt-0.5">{formatCurrency(offer.fees.taxes)}</b>
        </div>
        <div className="text-[10px] md:text-[11px] text-mist text-center">
          Bags
          <b className="block text-ink text-xs md:text-sm font-semibold mt-0.5">{formatCurrency(offer.fees.bags)}</b>
        </div>
        <div className="text-[10px] md:text-[11px] text-mist text-right">
          Service Fee
          <b className="block text-ink text-xs md:text-sm font-semibold mt-0.5">{formatCurrency(offer.fees.serviceFee)}</b>
        </div>
      </div>
    </motion.button>
  );
}
