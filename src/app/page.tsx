"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Check, ShieldCheck, HeartHandshake, PlaneTakeoff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { parseAdvisorQuery } from "@/lib/api";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await parseAdvisorQuery({ query });
      if (res.clarifyingQuestion) {
        // Redirect with the original query to be handled on the search page
        router.push(`/search?q=${encodeURIComponent(query)}&clarify=${encodeURIComponent(res.clarifyingQuestion)}`);
      } else if (res.searchParams) {
        // Redirect with structured params
        const params = new URLSearchParams();
        if (res.searchParams.origin) params.set("origin", res.searchParams.origin);
        if (res.searchParams.destination) params.set("destination", res.searchParams.destination);
        if (res.searchParams.filters) {
          res.searchParams.filters.forEach(f => params.append("filter", f));
        }
        router.push(`/search?${params.toString()}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      <Nav />
      
      {/* Background Constellation */}
      <div className="absolute top-0 right-0 w-full max-w-[100vw] h-[600px] pointer-events-none opacity-40 overflow-hidden flex justify-end">
        <svg className="w-[150%] max-w-[800px] h-auto md:w-[800px] md:h-[600px] text-ice mr-[-10%] md:mr-[-100px] mt-[-50px]" viewBox="0 0 160 120" preserveAspectRatio="xMaxYMin slice">
          <g stroke="currentColor" strokeWidth="0.6" opacity="0.4">
            <line x1="10" y1="15" x2="70" y2="45"/>
            <line x1="70" y1="45" x2="40" y2="80"/>
            <line x1="30" y1="10" x2="90" y2="30"/>
            <line x1="70" y1="45" x2="120" y2="60"/>
            <line x1="120" y1="60" x2="140" y2="20"/>
          </g>
          <g fill="currentColor">
            <circle cx="10" cy="15" r="1.5"/>
            <circle cx="70" cy="45" r="2"/>
            <circle cx="40" cy="80" r="1.2"/>
            <circle cx="30" cy="10" r="1.2"/>
            <circle cx="90" cy="30" r="1.5"/>
            <circle cx="120" cy="60" r="2.5"/>
            <circle cx="140" cy="20" r="1"/>
          </g>
        </svg>
      </div>

      <main className="relative z-10">
        
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-6 md:px-10 pt-12 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-xl">
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-8 md:hidden">
               <div className="w-10 h-10 rounded-full bg-ice flex items-center justify-center font-display font-bold text-indigo text-lg">
                 P
               </div>
               <div>
                 <span className="font-mono text-xs tracking-widest text-ice uppercase block">Good evening</span>
                 <h2 className="font-display text-2xl font-semibold mt-1">Where to, Perez?</h2>
               </div>
            </motion.div>
            
            <div className="hidden md:block">
               <motion.span variants={fadeUp} className="font-mono text-xs md:text-sm tracking-widest text-ice uppercase mb-4 block">
                 Travel Synqed
               </motion.span>
               <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-5xl lg:text-7xl font-semibold leading-[1.08] tracking-tight mb-4 md:mb-6">
                 Where to, Perez?
               </motion.h1>
               <motion.p variants={fadeUp} className="text-base md:text-lg leading-relaxed text-mist max-w-md">
                 We remove every source of friction from travel — before, during, and after the flight.
               </motion.p>
            </div>
            
            {/* AI Advisor Card */}
            <motion.div variants={fadeUp} className="mt-8 md:mt-12 bg-white rounded-3xl p-6 md:p-8 shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-[#1C9BB8] mb-4">
                <span className="w-2 h-2 rounded-full bg-ice animate-pulse-ring inline-block"></span>
                AI Travel Advisor
              </div>
              <h3 className="font-display text-xl md:text-2xl font-medium text-ink leading-snug mb-6">
                "I have ₦500,000 — what's the cheapest way to Nairobi next month?"
              </h3>
              
              <form onSubmit={handleSearch} className="flex items-center gap-3 bg-offwhite rounded-2xl p-2 pl-5 transition-all focus-within:ring-2 focus-within:ring-ice">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                  placeholder="Ask instead of searching..." 
                  className="bg-transparent border-none outline-none flex-1 text-ink text-sm md:text-base placeholder:text-mist"
                />
                <button 
                  type="submit" 
                  disabled={loading || !query.trim()}
                  className="w-10 h-10 md:w-12 h-12 rounded-xl bg-indigo flex items-center justify-center shrink-0 hover:bg-indigo2 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 text-ice animate-spin" /> : <ArrowRight className="w-5 h-5 text-ice" />}
                </button>
              </form>
              
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {["Best value", "No layovers", "Visa-free only", "Under ₦400k"].map(chip => (
                  <button 
                    key={chip} 
                    type="button" 
                    disabled={loading}
                    onClick={() => { setQuery(chip); }}
                    className="text-xs font-medium text-indigo bg-indigo/5 px-4 py-2 rounded-full whitespace-nowrap hover:bg-indigo/10 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-md w-full mx-auto md:ml-auto md:mr-0">
             
            <motion.div variants={fadeUp} className="flex items-start gap-3 bg-ice-tint border border-[#C9F1FC] p-4 rounded-2xl mb-8">
              <div className="w-6 h-6 rounded bg-indigo flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-ice" />
              </div>
              <p className="text-sm text-[#0E5A6E] leading-relaxed font-medium">
                Every price shown is the full price. No fees appear at checkout that weren't on the card.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg font-semibold text-white">Popular for you</h3>
              <button onClick={() => router.push('/search')} className="text-sm text-ice font-semibold hover:underline">see all →</button>
            </motion.div>

            <div className="flex flex-col gap-3">
              <motion.button variants={fadeUp} onClick={() => router.push('/search')} className="group flex justify-between items-center bg-white rounded-2xl p-4 md:p-5 text-left hover:shadow-[0_8px_24px_-12px_rgba(61,220,255,0.4)] transition-all">
                <div className="flex flex-col items-start gap-1 w-2/3 md:w-auto">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md mb-1 bg-[#E8FBFF] text-[#1C9BB8]">Best value</span>
                  <div className="font-display font-semibold text-sm md:text-base text-ink whitespace-nowrap overflow-hidden text-ellipsis w-full">Lagos → Nairobi</div>
                  <div className="text-[10px] md:text-xs text-mist">Kenya Airways · 1 stop · 7h 40m</div>
                </div>
                <div className="text-right shrink-0">
                  <b className="font-display text-base md:text-lg text-ink block">₦387,200</b>
                  <div className="text-[9px] md:text-[10px] uppercase tracking-wider text-mist mt-1 font-semibold">all-in</div>
                </div>
              </motion.button>
              
              <motion.button variants={fadeUp} onClick={() => router.push('/search')} className="group flex justify-between items-center bg-white rounded-2xl p-4 md:p-5 text-left hover:shadow-[0_8px_24px_-12px_rgba(61,220,255,0.4)] transition-all">
                <div className="flex flex-col items-start gap-1 w-2/3 md:w-auto">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md mb-1 bg-[#E5E9FA] text-[#4152B0]">Fastest</span>
                  <div className="font-display font-semibold text-sm md:text-base text-ink whitespace-nowrap overflow-hidden text-ellipsis w-full">Lagos → Kigali</div>
                  <div className="text-[10px] md:text-xs text-mist">RwandAir · direct · 4h 30m</div>
                </div>
                <div className="text-right shrink-0">
                  <b className="font-display text-base md:text-lg text-ink block">₦468,900</b>
                  <div className="text-[9px] md:text-[10px] uppercase tracking-wider text-mist mt-1 font-semibold">all-in</div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* The Synqed Philosophy / Corporate Marketing Section */}
        <section className="bg-white text-ink py-20 md:py-32 rounded-t-[40px] px-6 md:px-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
              <h2 className="font-display text-3xl md:text-5xl font-semibold mb-6">Built for the Diaspora.</h2>
              <p className="text-lg text-mist leading-relaxed">
                Synqed Air is the transparent-pricing challenger. We believe travel booking in and out of Africa shouldn't be full of removable friction, hidden fees, and poor support.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#E8FBFF] text-[#1C9BB8] flex items-center justify-center mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Total Transparency</h3>
                <p className="text-mist leading-relaxed text-sm md:text-base">
                  What you see is what you pay. We show base fare, taxes, and baggage fees explicitly. No last-minute surprises at checkout.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#E5E9FA] text-[#4152B0] flex items-center justify-center mb-6">
                  <HeartHandshake className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Instant Human Support</h3>
                <p className="text-mist leading-relaxed text-sm md:text-base">
                  Reach a real person within 2 minutes via WhatsApp. Delays, changes, and refunds handled without the endless bot loops.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo/5 text-indigo flex items-center justify-center mb-6">
                  <PlaneTakeoff className="w-8 h-8" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">Travel Companion</h3>
                <p className="text-mist leading-relaxed text-sm md:text-base">
                  Visas, weather, automatic check-ins, and proactive timeline updates sent to you precisely when you need them.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <div className="relative z-10 border-t border-line bg-[#05070F]">
        <Footer />
      </div>
    </div>
  );
}
