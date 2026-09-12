"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FlightOfferCard from "@/components/FlightOfferCard";
import { FlightOffer } from "@/types";
import { searchFlights } from "@/lib/api";
import { motion, Variants } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, PlaneTakeoff, ArrowLeft } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q");
  const clarify = searchParams.get("clarify");
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const departDate = searchParams.get("departDate");
  const adults = searchParams.get("adults");
  const children = searchParams.get("children");
  const cabinClass = searchParams.get("cabinClass");

  const [activeFilter, setActiveFilter] = useState("Best value");
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadFlights() {
      setLoading(true);
      setError(false);
      try {
        const res = await searchFlights({
          origin: origin || "LOS",
          destination: destination || "NBO",
          departDate: departDate || new Date().toISOString().split("T")[0],
          adults: adults ? parseInt(adults) : 1,
          children: children ? parseInt(children) : 0,
          cabinClass: cabinClass || "economy",
          filters: [activeFilter],
        });
        setOffers(res.offers);
      } catch (e) {
        console.error("Failed to load flights", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadFlights();
  }, [origin, destination, departDate, adults, children, cabinClass, activeFilter]);

  const formattedDate = departDate
    ? new Date(departDate).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })
    : new Date().toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });

  return (
    <>
      <div className="bg-[#0A1128] text-white pb-8 rounded-b-[40px] shadow-sm">
        <Nav />
        <div className="mx-auto max-w-5xl px-6 md:px-10 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to search
            </button>

            {rawQuery && !origin ? (
              <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
                Searching flights for &ldquo;{rawQuery}&rdquo;
              </h1>
            ) : (
              <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-3">
                {origin || "LOS"}
                <PlaneTakeoff className="w-5 h-5 text-[#3DDCFF]" />
                {destination || "NBO"}
              </h1>
            )}

            <p className="mt-1.5 text-xs md:text-sm text-white/45">
              {formattedDate} · {(parseInt(adults || "1") + parseInt(children || "0"))} traveler{(parseInt(adults || "1") + parseInt(children || "0")) > 1 ? "s" : ""} · All prices shown all-in
            </p>

            <div className="flex flex-wrap gap-2 mt-5 pb-2">
              {["Best value", "Fastest", "Cheapest"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    activeFilter === filter
                      ? "bg-[#3DDCFF] text-[#0A1128]"
                      : "bg-white/10 text-white/70 hover:bg-white/15"
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

        {/* Clarification banner */}
        {clarify && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#E8FBFF] border border-[#C9F1FC] p-5 rounded-2xl mb-8 flex gap-4"
          >
            <AlertCircle className="w-6 h-6 text-[#1C9BB8] shrink-0" />
            <div>
              <h3 className="font-semibold text-[#0E5A6E] mb-1">Your AI Advisor needs more info</h3>
              <p className="text-sm text-[#0E5A6E]/80">{clarify}</p>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#1C9BB8] animate-spin mb-4" />
            <p className="text-[#8891A6] font-medium">Finding the best options for you…</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="font-display text-lg font-semibold text-[#1B2033] mb-2">
              Couldn&apos;t connect to flight inventory
            </h3>
            <p className="text-[#8891A6] text-sm max-w-sm mb-6 leading-relaxed">
              Our live inventory is being configured. In the meantime, you can join our waitlist and we&apos;ll alert you when booking goes fully live.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 bg-[#0A1128] text-white font-semibold text-sm py-3 px-5 rounded-xl hover:bg-[#16224A] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to search
              </button>
              <button
                onClick={() => router.push("/#waitlist")}
                className="inline-flex items-center gap-2 bg-[#E8FBFF] text-[#1C9BB8] font-semibold text-sm py-3 px-5 rounded-xl hover:bg-[#D0F4FD] transition-colors border border-[#C9F1FC]"
              >
                Join waitlist for early access
              </button>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && offers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#E8FBFF] flex items-center justify-center mb-5">
              <PlaneTakeoff className="w-8 h-8 text-[#1C9BB8]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-[#1B2033] mb-2">
              No flights found for this route
            </h3>
            <p className="text-[#8891A6] text-sm max-w-sm mb-6 leading-relaxed">
              We couldn&apos;t find available flights for these dates. Try adjusting your dates or search a different route.
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 bg-[#0A1128] text-white font-semibold text-sm py-3 px-5 rounded-xl hover:bg-[#16224A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Modify search
            </button>
          </motion.div>
        )}

        {/* Results */}
        {!loading && !error && offers.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-5"
          >
            <p className="text-xs text-[#8891A6] font-semibold uppercase tracking-wider px-1">
              {offers.length} result{offers.length !== 1 ? "s" : ""} · All prices all-in, no checkout surprises
            </p>
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
    <div className="min-h-screen bg-[#F4F6FA]">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
            <Loader2 className="w-8 h-8 text-[#1C9BB8] animate-spin" />
          </div>
        }
      >
        <SearchResultsContent />
      </Suspense>
      <Footer />
    </div>
  );
}
