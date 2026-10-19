"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  PlaneTakeoff,
  Check,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";

/* ── animations ── */
const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ── route chips ── */
const ROUTES = [
  "Lagos – Nairobi",
  "Lagos – Kigali",
  "Lagos – London",
  "Lagos – New York",
  "Lagos – Dubai",
];

/* ── FAQ data ── */
const FAQ = [
  {
    q: "When does SynqedAir launch?",
    a: "The app is planned to launch on Dec 31, 2026. Join the waitlist and tell us your route, so we know where to start.",
  },
  {
    q: 'What does "full fare" mean?',
    a: "The base fare, taxes, and baggage shown together, with the total, before you choose a flight. What you see on the results page is what you pay.",
  },
  {
    q: "Who helps if my flight changes?",
    a: "A real person. Messaging support is planned for delays, booking changes, and refund requests.",
  },
  {
    q: "Which routes come first?",
    a: "Routes between Nigeria and East Africa, the UK, the US, and the Gulf. Your waitlist answers decide what comes next.",
  },
  {
    q: "Can I book a flight today?",
    a: "Not yet. Live search, fares, and booking are still being arranged, and we'll tell you the moment they're ready.",
  },
];

export default function JoinPage() {
  const [email, setEmail] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [freq, setFreq] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;
    setLoading(true);
    try {
      // Post to our waitlist backend (persists to DB and embeds Formspree forwarding)
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          flyingFrom: from.trim() || null,
          flyingTo: to.trim() || null,
          frequency: freq || null,
        }),
      });

      if (res.ok) {
        setDone(true);
        return;
      }

      // Fallback direct to Formspree if backend encountered an issue
      const directRes = await fetch("https://formspree.io/f/mdeoyvzn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          flyingFrom: from.trim() || "—",
          flyingTo: to.trim() || "—",
          frequency: freq || "—",
          _subject: "🛫 SynqedAir waitlist — /join page",
        }),
      });

      if (!directRes.ok) {
        setError("Something went wrong. Please try again.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1128] text-white">
      {/* ── Header ── */}
      <header className="mx-auto max-w-5xl flex items-center justify-between px-6 py-6 md:py-8">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo.jpg" alt="Synqed Air" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-display text-lg font-semibold tracking-tight">
            Synqed<span className="text-ice">Air</span>
          </span>
        </Link>
        <a
          href="#waitlist"
          className="text-sm font-semibold text-ice hover:text-white transition-colors"
        >
          Join the waitlist
        </a>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="mx-auto max-w-5xl px-6 pt-8 pb-16 md:pt-16 md:pb-24">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center"
          >
            {/* Left — copy */}
            <div>
              <motion.p
                variants={fadeUp}
                className="font-mono text-xs tracking-widest text-ice uppercase mb-5"
              >
                Flights across Africa and the diaspora
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="font-display text-4xl md:text-5xl lg:text-[56px] font-semibold leading-[1.06] tracking-tight mb-5"
              >
                Know the full fare before you book.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-base md:text-lg leading-relaxed text-white/55 max-w-lg mb-8"
              >
                Full price. Every fee shown. Flights on the corridors Africa and the diaspora
                actually fly, with a real person on WhatsApp when plans change.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
                <a
                  href="#waitlist"
                  className="inline-flex items-center gap-2 bg-white text-[#0A1128] font-semibold px-7 py-3.5 rounded-full hover:bg-ice transition-colors text-base"
                >
                  Join the waitlist <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#how"
                  className="font-semibold text-white/70 hover:text-white transition-colors px-2 py-3"
                >
                  See how it works ↓
                </a>
              </motion.div>
              <motion.p
                variants={fadeUp}
                className="mt-6 text-sm text-white/35 max-w-md"
              >
                The app launches Dec 31. Live search and booking are not available yet, and
                we won&apos;t show made-up flights or prices.
              </motion.p>
            </div>

            {/* Right — boarding pass fare breakdown */}
            <motion.div variants={fadeUp}>
              <div className="bg-[#12202E] border border-white/10 rounded-2xl overflow-hidden relative">
                {/* Notch cutouts */}
                <div className="absolute left-[-10px] top-[72px] w-5 h-5 rounded-full bg-[#0A1128] border border-white/10 z-10" />
                <div className="absolute right-[-10px] top-[72px] w-5 h-5 rounded-full bg-[#0A1128] border border-white/10 z-10" />

                {/* Top */}
                <div className="flex items-baseline justify-between px-6 py-5 border-b-2 border-dashed border-white/10">
                  <span className="font-display text-lg font-semibold">Your fare, itemized</span>
                  <span className="text-xs text-white/40">Shown before you book</span>
                </div>

                {/* Line items */}
                <ul className="px-6 py-2">
                  {["Base fare", "Taxes and airport fees", "Checked baggage"].map((item, i) => (
                    <li
                      key={item}
                      className={`flex items-baseline gap-3 py-4 ${
                        i < 2 ? "border-b border-white/[0.06]" : ""
                      }`}
                    >
                      <span className="text-sm text-white/70">{item}</span>
                      <span className="flex-1 border-b-2 border-dotted border-white/10 translate-y-[-3px]" />
                      <span className="text-sm text-white/40 italic">shown here</span>
                    </li>
                  ))}
                </ul>

                {/* Total */}
                <div className="bg-[#F2B632] text-[#2B2000] px-6 py-5 flex items-baseline justify-between">
                  <span className="font-display text-xl font-bold">Total</span>
                  <span className="text-sm font-semibold">the number you pay</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-white/30 px-1">
                Layout preview. Amounts appear when live fares launch.
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* ── Three Pillars ── */}
        <section id="how" className="bg-white text-[#1B2033] rounded-t-[40px]">
          <div className="mx-auto max-w-5xl px-6 pt-20 pb-16 md:pt-28 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-10">
                Three things we&apos;re building around.
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="grid md:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: <ShieldCheck className="w-6 h-6" />,
                  color: "bg-[#E8FBFF] text-[#1C9BB8]",
                  title: "See the whole fare.",
                  body: "Taxes, baggage, and total price, shown before you decide.",
                },
                {
                  icon: <PlaneTakeoff className="w-6 h-6" />,
                  color: "bg-[#E5E9FA] text-[#4152B0]",
                  title: "Compare the whole itinerary.",
                  body: "Side-by-side options, so you can weigh layovers, bags, and total cost.",
                },
                {
                  icon: <HeartHandshake className="w-6 h-6" />,
                  color: "bg-[#FFF3E0] text-[#E65100]",
                  title: "A person when plans shift.",
                  body: "Messaging support is planned for delays, changes, and refund requests.",
                },
              ].map((p) => (
                <motion.div
                  key={p.title}
                  variants={fadeUp}
                  className="border-t-[3px] border-[#0A1128] pt-5"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${p.color} flex items-center justify-center mb-4`}
                  >
                    {p.icon}
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{p.title}</h3>
                  <p className="text-[#8891A6] leading-relaxed">{p.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ── Routes ── */}
          <div className="mx-auto max-w-5xl px-6 pb-16 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-3">
                Built for the routes that matter to you.
              </h2>
              <p className="text-[#8891A6] text-base md:text-lg max-w-2xl leading-relaxed mb-8">
                Built for African and diaspora corridors, from wherever you fly. We&apos;re
                starting with routes between Nigeria and East Africa, the UK, the US, and the
                Gulf, and expanding from there. Tell us your route and we&apos;ll prioritize it.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex flex-wrap gap-3"
            >
              {ROUTES.map((r) => (
                <motion.span
                  key={r}
                  variants={fadeUp}
                  className="border border-[#1B2033] rounded-full px-5 py-2.5 font-medium text-sm bg-white hover:bg-[#F4F6FA] transition-colors"
                >
                  {r}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* ── The App ── */}
          <div className="mx-auto max-w-5xl px-6 pb-16 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#0A1128] text-white rounded-3xl p-8 md:p-14 relative overflow-hidden"
            >
              {/* glow */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full bg-[#1C9BB8]/15 blur-[100px]" />
              </div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 mb-6">
                  <span className="w-2 h-2 rounded-full bg-ice animate-pulse" />
                  <span className="text-xs font-semibold text-ice tracking-widest uppercase">
                    Launching Dec 31
                  </span>
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight mb-4 max-w-xl">
                  The full experience arrives in the app on Dec 31.
                </h2>
                <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-xl mb-8">
                  Book on the web. Then unlock the AI Travel Companion, automatic check-in, visa
                  alerts, smart refunds, and real-time gate alerts in the Synqed Air app.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ice/60 mb-1 w-full">
                    Planned at launch
                  </span>
                  {["Automatic check-in", "Visa alerts", "Smart refunds", "Gate alerts"].map(
                    (feat) => (
                      <div
                        key={feat}
                        className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-white/75"
                      >
                        <Check className="w-4 h-4 text-ice shrink-0" /> {feat}
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── FAQ ── */}
          <div className="mx-auto max-w-5xl px-6 pb-16 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-8">
                Questions, answered plainly.
              </h2>
            </motion.div>
            <div className="border-t border-[#C9DADD] max-w-3xl">
              {FAQ.map((item, i) => (
                <div key={i} className="border-b border-[#C9DADD]">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-5 text-left group"
                  >
                    <span className="font-display text-base md:text-lg font-semibold pr-8">
                      {item.q}
                    </span>
                    <span className="text-[#0A1128] text-2xl font-light shrink-0 w-7 h-7 flex items-center justify-center">
                      {openFaq === i ? (
                        <Minus className="w-5 h-5" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </span>
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pb-5"
                    >
                      <p className="text-[#8891A6] leading-relaxed max-w-2xl">
                        {item.a}
                        {i === 2 && (
                          <>
                            {" "}
                            You can already message us on{" "}
                            <a
                              href="https://wa.me/2348108372982"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1C9BB8] font-semibold hover:underline"
                            >
                              WhatsApp
                            </a>{" "}
                            with questions.
                          </>
                        )}
                      </p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Waitlist ── */}
          <div
            id="waitlist"
            className="mx-auto max-w-5xl px-6 pb-20 md:pb-28"
          >
            <div className="bg-[#0A1128] text-white rounded-3xl overflow-hidden relative">
              {/* glow */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-16 -right-16 w-[400px] h-[400px] rounded-full bg-[#1C9BB8]/15 blur-[100px]" />
                <div className="absolute bottom-0 left-1/4 w-[300px] h-[200px] rounded-full bg-[#1C9BB8]/10 blur-[80px]" />
              </div>

              <div className="relative z-10 px-8 md:px-16 py-16 md:py-24">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                  {/* Left — copy */}
                  <div>
                    <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight leading-tight mb-4">
                      Get told when your route goes live.
                    </h2>
                    <p className="text-white/50 text-base md:text-lg leading-relaxed mb-6 max-w-md">
                      Two minutes, four fields. Your route tells us where to launch first.
                    </p>
                    <p className="text-white/40 text-sm leading-relaxed max-w-sm">
                      Early joiners get priority access. Launch offer details to follow.
                    </p>
                  </div>

                  {/* Right — form */}
                  <div>
                    {!done ? (
                      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                            Email
                          </span>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            placeholder="you@example.com"
                            className="w-full bg-white/[0.07] border border-white/15 text-white placeholder:text-white/30 rounded-xl px-5 py-3.5 text-base outline-none focus:ring-2 focus:ring-ice transition-all disabled:opacity-50"
                          />
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                              Flying from
                            </span>
                            <input
                              type="text"
                              value={from}
                              onChange={(e) => setFrom(e.target.value)}
                              disabled={loading}
                              placeholder="e.g. Lagos"
                              className="w-full bg-white/[0.07] border border-white/15 text-white placeholder:text-white/30 rounded-xl px-5 py-3.5 text-base outline-none focus:ring-2 focus:ring-ice transition-all disabled:opacity-50"
                            />
                          </label>
                          <label className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                              Flying to
                            </span>
                            <input
                              type="text"
                              value={to}
                              onChange={(e) => setTo(e.target.value)}
                              disabled={loading}
                              placeholder="e.g. London"
                              className="w-full bg-white/[0.07] border border-white/15 text-white placeholder:text-white/30 rounded-xl px-5 py-3.5 text-base outline-none focus:ring-2 focus:ring-ice transition-all disabled:opacity-50"
                            />
                          </label>
                        </div>
                        <label className="flex flex-col gap-1.5">
                          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                            How often do you fly internationally?
                          </span>
                          <select
                            value={freq}
                            onChange={(e) => setFreq(e.target.value)}
                            disabled={loading}
                            className="w-full bg-white/[0.07] border border-white/15 text-white rounded-xl px-5 py-3.5 text-base outline-none focus:ring-2 focus:ring-ice transition-all disabled:opacity-50 appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="text-[#0A1128]">
                              Choose one
                            </option>
                            <option value="1-2" className="text-[#0A1128]">
                              1–2 times a year
                            </option>
                            <option value="3-5" className="text-[#0A1128]">
                              3–5 times a year
                            </option>
                            <option value="6+" className="text-[#0A1128]">
                              6 or more times a year
                            </option>
                          </select>
                        </label>
                        {error && (
                          <p className="text-red-300 text-sm">{error}</p>
                        )}
                        <button
                          type="submit"
                          disabled={loading || !email.trim()}
                          className="w-full bg-white text-[#0A1128] font-semibold py-4 rounded-xl hover:bg-ice transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base shadow-[0_4px_24px_-8px_rgba(255,255,255,0.2)] mt-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" /> Securing your spot…
                            </>
                          ) : (
                            <>
                              Join the waitlist <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </button>
                        <p className="text-white/25 text-xs text-center mt-1">
                          No spam. One email when we launch — that&apos;s it.
                        </p>
                      </form>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-5 py-8"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                          <Check className="w-8 h-8 text-ice" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-display text-2xl font-semibold mb-2">
                            You&apos;re on the list.
                          </h3>
                          <p className="text-white/50 text-base max-w-sm">
                            We&apos;ll email you the moment your route is ready.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white text-[#1B2033] border-t border-[#C9DADD]">
        <div className="mx-auto max-w-5xl px-6 py-10 md:py-12">
          <p className="font-display font-semibold mb-1">
            Synqed<span className="text-[#1C9BB8]">Air</span>.
          </p>
          <p className="text-sm text-[#8891A6] mb-1">
            Clear flight booking, with people ready to help.
          </p>
          <p className="text-sm text-[#8891A6] mb-4">
            Live search, fares, bookings, and support are not available yet.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[#8891A6]">
            <a href="https://synqedair.com" className="hover:text-[#1B2033] transition-colors">
              synqedair.com
            </a>
            <span className="text-[#C9DADD]">·</span>
            <a
              href="https://wa.me/2348108372982"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1B2033] transition-colors"
            >
              WhatsApp
            </a>
            <span className="text-[#C9DADD]">·</span>
            <span>
              A sister company of{" "}
              <a
                href="https://synqedai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#1B2033] transition-colors"
              >
                SynqedAI
              </a>
            </span>
          </div>
          <p className="text-xs text-[#8891A6]/60 mt-6">
            © {new Date().getFullYear()} Synqed Air Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
