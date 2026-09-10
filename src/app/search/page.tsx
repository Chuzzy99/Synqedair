"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FlightOfferCard from "@/components/FlightOfferCard";
import { FlightOffer } from "@/types";
import { searchFlights } from "@/lib/api";
import { motion, Variants } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q");
  const clarify = searchParams.get("clarify");
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const departDate = searchParams.get("departDate");
  const passengers = searchParams.get("passengers");

  const [activeFilter, setActiveFilter] = useState("Best value");
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFlights() {
      setLoading(true);
      try {
        const res = await searchFlights({
          origin: origin || "LOS",
          destination: destination || "NBO",
          departDate: departDate || new Date().toISOString().split('T')[0],
          passengers: passengers ? parseInt(passengers) : 1,
          filters: [activeFilter]
        });
        setOffers(res.offers);
      } catch (e) {
        console.error("Failed to load flights", e);
      } finally {
        setLoading(false);
      }
    }
    loadFlights();
  }, [origin, destination, departDate, passengers, activeFilter]);

  const formattedDate = departDate 
    ? new Date(departDate).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
    : new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <>
      <div className="bg-indigo text-white pb-8 rounded-b-[40px] shadow-sm">
        <Nav />
        <div className="mx-auto max-w-5xl px-6 md:px-10 pt-4">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {rawQuery && !origin ? (
              <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
                Searching flights for "{rawQuery}"
              </h1>
            ) : (
              <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
                {origin || "LOS"} → {destination || "NBO"}
              </h1>
            )}
            
            <p className="mt-1.5 text-xs md:text-sm text-[#AEB6CC]">
              {formattedDate} · {passengers || 1} traveler{parseInt(passengers || "1") > 1 ? "s" : ""}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-6 pb-2">
              {["Best value", "Fastest", "Cheapest"].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    activeFilter === filter 
                      ? "bg-ice text-indigo" 
                      : "bg-white/10 text-[#D9DEEC] hover:bg-white/15"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-10 md:px-10">
        
        {clarify && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-ice-tint border border-[#C9F1FC] p-5 rounded-2xl mb-8 flex gap-4"
          >
            <AlertCircle className="w-6 h-6 text-[#1C9BB8] shrink-0" />
            <div>
              <h3 className="font-semibold text-[#0E5A6E] mb-1">Your AI Advisor needs more info</h3>
              <p className="text-sm text-[#0E5A6E]/80">{clarify}</p>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo animate-spin mb-4" />
            <p className="text-mist font-medium">Finding the best options...</p>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-5"
          >
            {offers.map((offer) => (
               <motion.div key={offer.id} variants={itemVariants}>
                 <FlightOfferCard offer={offer} />
               </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </>
  );
}

export default function SearchResults() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-offwhite">
          <Loader2 className="w-8 h-8 text-indigo animate-spin" />
        </div>
      }>
        <SearchResultsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
