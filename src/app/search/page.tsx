"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FlightOfferCard from "@/components/FlightOfferCard";
import FlightSearchForm from "@/components/FlightSearchForm";
import { motion, Variants } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, PlaneTakeoff, ArrowLeft } from "lucide-react";
import { useSearchFlights } from "@/features/client/flights/flights.hook";
import {
  buildSearchQuery,
  parseSearchParams,
  sortOffers,
} from "@/features/client/flights/flights.utils";
import type { FlightSortKey } from "@/features/client/flights/flights.type";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const SORT_TABS: { key: FlightSortKey; label: string }[] = [
  { key: "best_value", label: "Best value" },
  { key: "cheapest", label: "Cheapest" },
  { key: "fastest", label: "Fastest" },
];

const CABIN_LABELS: Record<string, string> = {
  economy: "Economy",
  premium_economy: "Premium economy",
  business: "Business",
  first: "First",
};

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  const { payload, error: paramsError, initialValues, cities } = useMemo(
    () => parseSearchParams(new URLSearchParams(query)),
    [query]
  );

  const { offers, isSearching, isError, errorMessage, hasSearched, refetch } =
    useSearchFlights(payload);

  const [sortKey, setSortKey] = useState<FlightSortKey>("best_value");
  const sortedOffers = useMemo(() => sortOffers(offers, sortKey), [offers, sortKey]);

  const travelers = payload ? payload.adults + payload.childAges.length + payload.infants : 0;

  const isIdle = !payload && !paramsError;

  /* ---------- Scroll to results ---------- */

  const resultsRef = useRef<HTMLElement>(null);
  const scrolledForQuery = useRef<string | null>(null);

  const scrollToResults = useCallback(() => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // A search is "finished" once it has returned (even with 0 results) or failed
  const searchFinished = !isSearching && (hasSearched || isError);

  // Scroll once per search, as soon as its results (or its error) are on screen.
  // Changing the sort tab does not change the query, so it never re-scrolls.
  useEffect(() => {
    if (!payload || !searchFinished) return;
    if (scrolledForQuery.current === query) return;

    const timer = setTimeout(() => {
      scrolledForQuery.current = query;
      scrollToResults();
    }, 200); // let the page finish rendering/animating first

    return () => clearTimeout(timer);
  }, [payload, searchFinished, query, scrollToResults]);

  const handleSubmit = (
    search: Parameters<typeof buildSearchQuery>[0],
    searchCities: Parameters<typeof buildSearchQuery>[1]
  ) => {
    // Same search as the one already on screen? Don't search again.
    // (City labels are ignored so only the real search details are compared.)
    if (payload && buildSearchQuery(search, cities) === buildSearchQuery(payload, cities)) {
      if (isError) {
        refetch(); // the earlier attempt failed, so try again
      } else {
        scrollToResults(); // just take the user back to their results
      }
      return;
    }

    router.push(`/search?${buildSearchQuery(search, searchCities)}`);
  };

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
              <ArrowLeft className="w-4 h-4" /> Back to home
            </button>

            {payload ? (
              <>
                <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-3">
                  {cities.originCity}
                  <PlaneTakeoff className="w-5 h-5 text-[#3DDCFF]" />
                  {cities.destinationCity}
                </h1>
                <p className="mt-1.5 text-xs md:text-sm text-white/45">
                  {formatDate(payload.departureDate)}
                  {payload.returnDate ? ` – ${formatDate(payload.returnDate)}` : ""} · {travelers} traveler
                  {travelers > 1 ? "s" : ""} · {CABIN_LABELS[payload.cabinClass] ?? payload.cabinClass} · All prices shown all-in
                </p>
              </>
            ) : (
              <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
                Search flights
              </h1>
            )}

            <div className="mt-6 bg-white text-ink rounded-3xl p-6 md:p-8 shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)]">
              {/* key makes the form reset whenever the URL changes */}
              <FlightSearchForm
                key={query}
                initialValues={initialValues}
                isLoading={isSearching}
                onSubmit={handleSubmit}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <main ref={resultsRef} className="mx-auto max-w-3xl px-6 py-10 md:px-10">
        {/* Nothing searched yet (e.g. opened from a route card) */}
        {isIdle && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#E8FBFF] flex items-center justify-center mb-5">
              <PlaneTakeoff className="w-8 h-8 text-[#1C9BB8]" />
            </div>
            <h3 className="font-display text-lg font-semibold text-[#1B2033] mb-2">
              Choose your dates and travelers
            </h3>
            <p className="text-[#8891A6] text-sm max-w-sm leading-relaxed">
              Fill in the details above and tap Find flights to see live prices.
            </p>
          </motion.div>
        )}

        {/* The URL has a search but it is not valid */}
        {paramsError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-100 p-5 rounded-2xl flex gap-4"
          >
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <h3 className="font-semibold text-red-700 mb-1">Check your search details</h3>
              <p className="text-sm text-red-600/80">{paramsError}</p>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {isSearching && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#1C9BB8] animate-spin mb-4" />
            <p className="text-[#8891A6] font-medium">Finding the best options for you…</p>
          </div>
        )}

        {/* Error from the backend */}
        {!isSearching && isError && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="font-display text-lg font-semibold text-[#1B2033] mb-2">
              We couldn&apos;t complete your search
            </h3>
            <p className="text-[#8891A6] text-sm max-w-sm mb-6 leading-relaxed">{errorMessage}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 bg-[#0A1128] text-white font-semibold text-sm py-3 px-5 rounded-xl hover:bg-[#16224A] transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 bg-[#E8FBFF] text-[#1C9BB8] font-semibold text-sm py-3 px-5 rounded-xl hover:bg-[#D0F4FD] transition-colors border border-[#C9F1FC]"
              >
                <ArrowLeft className="w-4 h-4" /> Back to home
              </button>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!isSearching && !isError && hasSearched && sortedOffers.length === 0 && (
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
            <p className="text-[#8891A6] text-sm max-w-sm leading-relaxed">
              We couldn&apos;t find available flights for these dates. Try adjusting your dates or search a different route.
            </p>
          </motion.div>
        )}

        {/* Results */}
        {!isSearching && !isError && sortedOffers.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {SORT_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSortKey(tab.key)}
                  className={`text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                    sortKey === tab.key
                      ? "bg-[#0A1128] text-white"
                      : "bg-white text-[#8891A6] hover:text-[#1B2033] border border-[#E4E8F0]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <motion.div
              key={sortKey}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-5"
            >
              <p className="text-xs text-[#8891A6] font-semibold uppercase tracking-wider px-1">
                {sortedOffers.length} result{sortedOffers.length !== 1 ? "s" : ""} · All prices all-in, no checkout surprises
              </p>
              {sortedOffers.map((offer) => (
                <motion.div key={offer.id} variants={itemVariants}>
                  <FlightOfferCard offer={offer} />
                </motion.div>
              ))}
            </motion.div>
          </>
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