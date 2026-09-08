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
  const total = offer.price.baseFare + offer.price.taxes + offer.price.bags;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: offer.price.currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.button 
      whileHover={{ y: -6 }}
      onClick={() => router.push(`/companion?offerId=${offer.id}`)}
      className="w-full text-left bg-white rounded-2xl p-5 shadow-[0_10px_20px_-14px_rgba(10,17,40,.25)] hover:shadow-[0_14px_28px_-12px_rgba(10,17,40,.35)] transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-xs text-mist font-medium">{offer.airline} · {offer.flightNumber}</div>
          <div className="font-display font-semibold text-lg text-ink mt-1">
            {offer.departure.time} — {offer.arrival.time}
          </div>
        </div>
        <div className="text-right">
          <b className="font-display text-xl text-ink block">{formatCurrency(total)}</b>
          <div className="text-[10px] text-[#2E7D3B] font-bold uppercase tracking-wider mt-0.5">
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
        {offer.stops === "Direct" ? `Direct · ${offer.duration}` : `${offer.stops} · ${offer.duration}`}
      </div>

      <div className="flex justify-between flex-wrap gap-2 md:gap-4 mt-4 pt-4 border-t border-dashed border-line">
        <div className="text-[10px] md:text-[11px] text-mist w-[30%] md:w-auto">
          Fare
          <b className="block text-ink text-xs md:text-sm font-semibold mt-0.5">{formatCurrency(offer.price.baseFare)}</b>
        </div>
        <div className="text-[10px] md:text-[11px] text-mist w-[30%] md:w-auto text-center md:text-left">
          Taxes
          <b className="block text-ink text-xs md:text-sm font-semibold mt-0.5">{formatCurrency(offer.price.taxes)}</b>
        </div>
        <div className="text-[10px] md:text-[11px] text-mist w-[30%] md:w-auto text-right md:text-left">
          Bags
          <b className="block text-ink text-xs md:text-sm font-semibold mt-0.5">{formatCurrency(offer.price.bags)}</b>
        </div>
      </div>
    </motion.button>
  );
}
