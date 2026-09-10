"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  HeartHandshake,
  PlaneTakeoff,
  Loader2,
  Smartphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { parseAdvisorQuery } from "@/lib/api";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const CORRIDORS = [
  { from: "Lagos", fromCode: "LOS", to: "London", toCode: "LHR", airlines: "British Airways · Virgin Atlantic", tag: "Most popular" },
  { from: "Lagos", fromCode: "LOS", to: "New York", toCode: "JFK", airlines: "Delta · Qatar Airways", tag: "High demand" },
  { from: "Lagos", fromCode: "LOS", to: "Nairobi", toCode: "NBO", airlines: "Kenya Airways · Ethiopian", tag: "Best value" },
  { from: "Accra", fromCode: "ACC", to: "Toronto", toCode: "YYZ", airlines: "Air Canada · Ethiopian", tag: "" },
  { from: "Lagos", fromCode: "LOS", to: "Dubai", toCode: "DXB", airlines: "Emirates · Etihad", tag: "Fastest" },
  { from: "Abuja", fromCode: "ABV", to: "Kigali", toCode: "KGL", airlines: "RwandAir · Kenya Airways", tag: "" },
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const [tripType, setTripType] = useState("One way");
  const [userLocation, setUserLocation] = useState("Lagos");
  const [departDate, setDepartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [returnDate, setReturnDate] = useState(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [passengers, setPassengers] = useState("1");

  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistWhatsapp, setWaitlistWhatsapp] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistDone, setWaitlistDone] = useState(false);
  const [waitlistError, setWaitlistError] = useState("");

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistError("");
    if (!waitlistEmail.trim()) return;
    setWaitlistLoading(true);
    try {
      const res = await fetch("https://formspree.io/f/mdeoyvzn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: waitlistEmail.trim(),
          whatsapp: waitlistWhatsapp.trim() || "—",
          _subject: "🛫 New Synqed Air waitlist signup",
        }),
      });
      if (!res.ok) setWaitlistError("Something went wrong. Try again.");
      else setWaitlistDone(true);
    } catch {
      setWaitlistError("Network error — please try again.");
    } finally {
      setWaitlistLoading(false);
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 16) setGreeting("Good afternoon");
    else if (hour < 20) setGreeting("Good evening");
    else setGreeting("Good day");

    const cached = localStorage.getItem("synqed_last_location");
    if (cached) setUserLocation(cached);

    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((d) => {
        const loc = d?.region || d?.city;
        if (loc) { setUserLocation(loc); localStorage.setItem("synqed_last_location", loc); }
      })
      .catch(() => {});
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const passCount = parseInt(passengers) || 1;
    try {
      const res = await parseAdvisorQuery({ query });
      if (res.clarifyingQuestion) {
        router.push(`/search?q=${encodeURIComponent(query)}&clarify=${encodeURIComponent(res.clarifyingQuestion)}`);
      } else if (res.searchParams) {
        const params = new URLSearchParams();
        if (res.searchParams.origin) params.set("origin", res.searchParams.origin);
        if (res.searchParams.destination) params.set("destination", res.searchParams.destination);
        if (res.searchParams.filters) res.searchParams.filters.forEach((f) => params.append("filter", f));
        params.set("departDate", departDate);
        if (tripType === "Round trip") params.set("returnDate", returnDate);
        params.set("passengers", passCount.toString());
        router.push(`/search?${params.toString()}`);
      } else {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      <Nav />

      {/* Background accent */}
      <div className="absolute top-0 right-0 w-full max-w-[100vw] h-[600px] pointer-events-none opacity-40 overflow-hidden flex justify-end">
        <svg className="w-[150%] max-w-[800px] h-auto md:w-[800px] md:h-[600px] text-ice mr-[-10%] md:mr-[-100px] mt-[-50px]" viewBox="0 0 160 120" preserveAspectRatio="xMaxYMin slice">
          <g stroke="currentColor" strokeWidth="0.6" opacity="0.4">
            <line x1="10" y1="15" x2="70" y2="45" />
            <line x1="70" y1="45" x2="40" y2="80" />
            <line x1="30" y1="10" x2="90" y2="30" />
            <line x1="70" y1="45" x2="120" y2="60" />
            <line x1="120" y1="60" x2="140" y2="20" />
          </g>
          <g fill="currentColor">
            <circle cx="10" cy="15" r="1.5" /><circle cx="70" cy="45" r="2" />
            <circle cx="40" cy="80" r="1.2" /><circle cx="30" cy="10" r="1.2" />
            <circle cx="90" cy="30" r="1.5" /><circle cx="120" cy="60" r="2.5" />
            <circle cx="140" cy="20" r="1" />
          </g>
        </svg>
      </div>

      <main className="relative z-10">

        {/* ── Hero ── */}
        <section className="mx-auto max-w-6xl px-6 md:px-10 pt-12 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-xl">

            {/* Mobile greeting */}
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-8 md:hidden">
              <div className="w-10 h-10 rounded-full bg-ice flex items-center justify-center text-indigo">
                <PlaneTakeoff className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-xs tracking-widest text-ice uppercase block">{greeting}</span>
                <h2 className="font-display text-2xl font-semibold mt-1">Where to next?</h2>
              </div>
            </motion.div>

            {/* Desktop headline */}
            <div className="hidden md:block">
              <motion.span variants={fadeUp} className="font-mono text-xs md:text-sm tracking-widest text-ice uppercase mb-4 block">Travel Synqed</motion.span>
              <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-5xl lg:text-7xl font-semibold leading-[1.06] tracking-tight mb-4 md:mb-6">Where to next?</motion.h1>
              <motion.p variants={fadeUp} className="text-base md:text-lg leading-relaxed text-white/60 max-w-md">
                Full price. Every fee shown. The corridors diaspora travelers actually fly — with a real human on WhatsApp when things go sideways.
              </motion.p>
            </div>

            {/* Search widget */}
            <motion.div variants={fadeUp} className="mt-8 md:mt-12 bg-white rounded-3xl p-6 md:p-8 shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)]">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 sm:gap-0">
                <h3 className="font-display text-xl md:text-2xl font-medium text-ink leading-snug">Book your flight</h3>
                <div className="flex bg-offwhite p-1 rounded-xl w-fit">
                  {["Round trip", "One way", "Multi-city"].map((type) => (
                    <button key={type} type="button" onClick={() => setTripType(type)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${tripType === type ? "bg-white text-indigo shadow-sm" : "text-mist hover:text-ink"}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!query.trim()) return;
                const params = new URLSearchParams();
                params.set("origin", query);
                params.set("destination", "NBO");
                params.set("departDate", departDate);
                if (tripType === "Round trip") params.set("returnDate", returnDate);
                params.set("passengers", (parseInt(passengers) || 1).toString());
                router.push(`/search?${params.toString()}`);
              }} className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 bg-offwhite rounded-2xl p-4 transition-all focus-within:ring-2 focus-within:ring-ice">
                    <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1">From</label>
                    <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} disabled={loading}
                      placeholder={`e.g. ${userLocation}`}
                      className="bg-transparent border-none outline-none w-full text-ink font-semibold md:text-lg placeholder:text-mist placeholder:font-normal" />
                  </div>
                  <div className="flex-1 bg-offwhite rounded-2xl p-4 transition-all focus-within:ring-2 focus-within:ring-ice">
                    <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1">To</label>
                    <input type="text" defaultValue="Nairobi (NBO)" disabled={loading} placeholder="e.g. Nairobi (NBO)"
                      className="bg-transparent border-none outline-none w-full text-ink font-semibold md:text-lg placeholder:text-mist placeholder:font-normal" />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 bg-offwhite rounded-2xl p-4 transition-all focus-within:ring-2 focus-within:ring-ice">
                    <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1">Departure</label>
                    <input type="date" value={departDate} onChange={(e) => setDepartDate(e.target.value)} disabled={loading}
                      className="bg-transparent border-none outline-none w-full text-ink font-semibold md:text-lg" />
                  </div>
                  {tripType === "Round trip" && (
                    <div className="flex-1 bg-offwhite rounded-2xl p-4 transition-all focus-within:ring-2 focus-within:ring-ice">
                      <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1">Return</label>
                      <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} disabled={loading}
                        className="bg-transparent border-none outline-none w-full text-ink font-semibold md:text-lg" />
                    </div>
                  )}
                  <div className="flex-1 bg-offwhite rounded-2xl p-4 transition-all focus-within:ring-2 focus-within:ring-ice">
                    <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-1">Travelers</label>
                    <select value={passengers} onChange={(e) => setPassengers(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-ink font-semibold md:text-lg cursor-pointer">
                      {["1 Adult","2 Adults","3 Adults","4 Adults","5 Adults"].map((o, i) => (
                        <option key={o} value={i+1}>{o}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={loading || !query.trim()}
                    className="flex-1 rounded-2xl bg-indigo text-white font-semibold text-lg flex items-center justify-center gap-2 hover:bg-indigo2 transition-colors disabled:opacity-50 min-h-[60px]">
                    {loading ? <Loader2 className="w-5 h-5 text-ice animate-spin" /> : <>Search Flights <ArrowRight className="w-5 h-5 text-ice" /></>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>

          {/* Right col */}
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-md w-full mx-auto md:ml-auto md:mr-0">
            <motion.div variants={fadeUp} className="flex items-start gap-3 bg-ice/10 border border-ice/20 p-4 rounded-2xl mb-6">
              <div className="w-6 h-6 rounded bg-ice/20 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-ice" />
              </div>
              <p className="text-sm text-ice/90 leading-relaxed font-medium">
                Every price shown is the full price. No fees appear at checkout that weren&apos;t on the search results page.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg font-semibold text-white">Popular for you</h3>
              <button onClick={() => router.push("/search")} className="text-sm text-ice font-semibold hover:underline">see all →</button>
            </motion.div>

            <div className="flex flex-col gap-3">
              {[
                { tag: "Best value", tagColor: "bg-[#E8FBFF] text-[#1C9BB8]", route: "Lagos → Nairobi", detail: "Kenya Airways · 1 stop · 7h 40m", price: "$280" },
                { tag: "Fastest", tagColor: "bg-[#E5E9FA] text-[#4152B0]", route: "Lagos → Kigali", detail: "RwandAir · direct · 4h 30m", price: "$320" },
                { tag: "Trending", tagColor: "bg-[#FFF3E0] text-[#E65100]", route: "Lagos → London", detail: "British Airways · 1 stop · 7h 05m", price: "$820" },
              ].map((r) => (
                <motion.button key={r.route} variants={fadeUp} onClick={() => router.push("/search")}
                  className="group flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white rounded-2xl p-4 md:p-5 text-left hover:shadow-[0_8px_24px_-12px_rgba(61,220,255,0.4)] transition-all gap-3 sm:gap-0">
                  <div className="flex flex-col items-start gap-1">
                    <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md mb-0.5 ${r.tagColor}`}>{r.tag}</span>
                    <div className="font-display font-semibold text-sm md:text-base text-ink">{r.route}</div>
                    <div className="text-[10px] md:text-xs text-mist">{r.detail}</div>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <b className="font-display text-base md:text-lg text-ink block">{r.price}</b>
                    <div className="text-[9px] md:text-[10px] uppercase tracking-wider text-mist mt-1 font-semibold">all-in</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── White section ── */}
        <section className="bg-white text-ink rounded-t-[40px] px-6 md:px-10 pt-20 md:pt-28 pb-0">
          <div className="max-w-6xl mx-auto">

            {/* Stats bar */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line rounded-2xl overflow-hidden mb-20 md:mb-28 border border-line">
              {[
                { value: "200+", label: "Active routes" },
                { value: "40+", label: "Airlines covered" },
                { value: "$0", label: "Hidden fees. Ever." },
                { value: "< 2 min", label: "WhatsApp response" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white px-6 py-6 md:py-8 text-center">
                  <div className="font-display text-2xl md:text-3xl font-bold text-indigo mb-1">{stat.value}</div>
                  <div className="text-xs md:text-sm text-mist font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Corridors */}
            <div className="mb-20 md:mb-28">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                <span className="font-mono text-xs tracking-widest text-[#1C9BB8] uppercase mb-3 block">The corridors we know</span>
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">Routes built for the diaspora.</h2>
                <p className="text-mist text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                  Generic booking tools ignore these corridors. We don&apos;t. Every route below is fully priced before checkout.
                </p>
              </motion.div>

              <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CORRIDORS.map((c) => (
                  <motion.button key={`${c.fromCode}-${c.toCode}`} variants={fadeUp}
                    onClick={() => router.push(`/search?origin=${c.fromCode}&destination=${c.toCode}`)}
                    className="group text-left bg-offwhite hover:bg-white border border-transparent hover:border-line rounded-2xl p-5 transition-all hover:shadow-[0_8px_24px_-8px_rgba(10,17,40,0.12)]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-indigo">{c.fromCode}</span>
                        <PlaneTakeoff className="w-3.5 h-3.5 text-mist" />
                        <span className="font-mono text-sm font-bold text-indigo">{c.toCode}</span>
                      </div>
                      {c.tag && <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo/5 text-indigo px-2 py-0.5 rounded-full">{c.tag}</span>}
                    </div>
                    <div className="font-display font-semibold text-base text-ink mb-1">{c.from} → {c.to}</div>
                    <div className="text-xs text-mist mb-4">{c.airlines}</div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-[#1C9BB8] group-hover:gap-2 transition-all">
                      Search this route <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>

            {/* 3 Pillars */}
            <div className="mb-20 md:mb-28">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">Built for the Diaspora.</h2>
                <p className="text-mist text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                  We removed every source of friction specific to diaspora travel — before, during, and after the flight.
                </p>
              </motion.div>

              <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
                className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: <ShieldCheck className="w-7 h-7" />, color: "bg-[#E8FBFF] text-[#1C9BB8]", title: "Total Transparency", body: "What you see is what you pay. Base fare, taxes, and baggage shown explicitly on every result — not added at checkout.", tag: null },
                  { icon: <HeartHandshake className="w-7 h-7" />, color: "bg-[#E5E9FA] text-[#4152B0]", title: "Instant Human Support", body: "Reach a real Synqed Air agent in under 2 minutes on WhatsApp. Delays, changes, and refunds handled — no bot loops, ever.", tag: null },
                  { icon: <Smartphone className="w-7 h-7" />, color: "bg-indigo/5 text-indigo", title: "AI Travel Companion", body: "Visa requirements, weather, automatic check-in, and real-time gate alerts — delivered to your phone precisely when you need them.", tag: "In the app" },
                ].map((p) => (
                  <motion.div key={p.title} variants={fadeUp}
                    className="flex flex-col bg-offwhite rounded-3xl p-7 border border-line hover:border-[#C9F1FC] hover:bg-white transition-all">
                    <div className={`w-14 h-14 rounded-2xl ${p.color} flex items-center justify-center mb-5`}>{p.icon}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                      {p.tag && <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo text-white px-2 py-0.5 rounded-full">{p.tag}</span>}
                    </div>
                    <p className="text-mist leading-relaxed text-sm">{p.body}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

          </div>
        </section>

        {/* ── Combined App + Waitlist ── */}
        <section id="waitlist" className="bg-white px-6 md:px-10 pt-0 pb-0">
          <div className="bg-indigo rounded-3xl mx-auto max-w-6xl relative overflow-hidden mt-6 mb-0">

            {/* Glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-[#1C9BB8]/20 blur-[120px]" />
              <div className="absolute bottom-0 left-1/3 w-[400px] h-[300px] rounded-full bg-[#1C9BB8]/10 blur-[100px]" />
            </div>

            <div className="relative z-10 px-8 md:px-16 lg:px-24 py-20 md:py-32">

              {/* App info row */}
              <div className="pb-16 mb-16 border-b border-white/10">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
                  <span className="w-2 h-2 rounded-full bg-ice animate-pulse" />
                  <span className="text-xs font-semibold text-ice tracking-widest uppercase">Launching Dec 31</span>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                  <div className="max-w-2xl">
                    <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mb-5 leading-tight">
                      The full experience is in the app.
                    </h2>
                    <p className="text-white/60 text-base md:text-lg leading-relaxed">
                      Book on the web. Then unlock the AI Travel Companion, automatic check-in, visa alerts, smart refunds, and real-time gate alerts in the Synqed Air app.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 shrink-0">
                    {["Automatic check-in", "Visa alerts", "Smart refunds", "Gate alerts"].map((feat) => (
                      <div key={feat} className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-5 py-3 text-sm font-medium text-white/80">
                        <Check className="w-4 h-4 text-ice shrink-0" /> {feat}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Waitlist form */}
              <div className="max-w-xl mx-auto text-center">
                {!waitlistDone ? (
                  <motion.div key="form" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <h2 className="font-display text-3xl md:text-5xl font-semibold tracking-tight leading-tight text-white mb-5">
                      Your seat doesn&apos;t have to wait.
                    </h2>
                    <p className="text-ice/75 text-base md:text-lg leading-relaxed mb-10 max-w-lg mx-auto">
                      Drop your email and we&apos;ll notify you the moment the app goes live — early joiners get priority access and a launch-week fare credit.
                    </p>
                    <form onSubmit={handleWaitlist} className="flex flex-col gap-4 max-w-md mx-auto">
                      <input id="waitlist-email" type="email" required value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)} disabled={waitlistLoading}
                        placeholder="Your email address"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-2xl px-6 py-4 text-base outline-none focus:ring-2 focus:ring-[#3DDCFF] transition-all disabled:opacity-60" />
                      <input id="waitlist-whatsapp" type="tel" value={waitlistWhatsapp}
                        onChange={(e) => setWaitlistWhatsapp(e.target.value)} disabled={waitlistLoading}
                        placeholder="WhatsApp number (optional) +1…"
                        className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-2xl px-6 py-4 text-base outline-none focus:ring-2 focus:ring-[#3DDCFF] transition-all disabled:opacity-60" />
                      {waitlistError && <p className="text-red-300 text-sm text-center">{waitlistError}</p>}
                      <button type="submit" disabled={waitlistLoading || !waitlistEmail.trim()}
                        className="w-full bg-white text-indigo font-semibold py-4 rounded-2xl hover:bg-ice transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base shadow-[0_4px_24px_-8px_rgba(255,255,255,0.25)]">
                        {waitlistLoading
                          ? <><Loader2 className="w-5 h-5 animate-spin" /> Securing your spot…</>
                          : <>Get early access <ArrowRight className="w-5 h-5" /></>}
                      </button>
                      <p className="text-white/30 text-sm mt-1">No spam. One email when we launch — that&apos;s it.</p>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                    className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <Check className="w-9 h-9 text-[#3DDCFF]" />
                    </div>
                    <div>
                      <h2 className="font-display text-3xl md:text-4xl font-semibold text-white mb-3">You&apos;re on the list.</h2>
                      <p className="text-ice/70 text-base md:text-lg max-w-md mx-auto">
                        We&apos;ll message you the moment the app is live. Check WhatsApp too if you shared your number.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

            </div>
          </div>
        </section>

      </main>

      <div className="bg-white pt-6">
        <Footer />
      </div>
    </div>
  );
}
