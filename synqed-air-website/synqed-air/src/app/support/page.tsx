"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { motion, Variants } from "framer-motion";
import { MessageCircle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const WA_NUMBER = "2348108372982";
const WA_MSG = encodeURIComponent("Hi Synqed Air 👋 I need help with my booking.");
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const FAQS = [
  {
    q: "Is the price on the search page really the final price?",
    a: "Yes — always. Synqed Air shows the full all-in price on every search result. That includes the base fare, all taxes, levies, and baggage fees. Nothing is added at checkout. If you ever see a different amount at checkout, contact us on WhatsApp immediately.",
  },
  {
    q: "How do I reach a human agent?",
    a: "Tap the WhatsApp button anywhere on the site or in the app. You'll be connected to a real Synqed Air agent — not a bot — in under 2 minutes. We are available every day from 06:00 to 23:00 WAT.",
  },
  {
    q: "What happens if my flight is delayed or cancelled?",
    a: "We proactively monitor your flight and message you on WhatsApp the moment an airline issues a delay or cancellation. If the airline owes you a refund or rebooking, we process it on your behalf — you don't need to call the airline.",
  },
  {
    q: "How do refunds work?",
    a: "If the airline's fare rules permit cancellation, we process your refund instantly upon request. The funds are returned to your original payment method. We do not hold refunds for 30 days or charge arbitrary processing fees.",
  },
  {
    q: "Does Synqed Air charge a booking or service fee?",
    a: "Any service fee is shown explicitly on the search results page — never added later. For most standard economy fares on our supported corridors, the all-in price is what you see with no additional service charge.",
  },
  {
    q: "Which routes and airlines does Synqed Air cover?",
    a: "We currently focus on Africa's diaspora corridors — Lagos to London, Lagos to New York, Lagos to Nairobi, Accra to Toronto, Lagos to Dubai, and more. We cover 40+ airlines on 200+ routes. The full list is available on the search page.",
  },
  {
    q: "What is the AI Travel Companion?",
    a: "The AI Travel Companion is a feature launching in the Synqed Air app on December 31. It proactively sends you visa requirements, weather briefings, automatic check-in, gate change alerts, and more — all via WhatsApp and in-app notifications. It is not available on the web booking platform.",
  },
  {
    q: "Is Synqed Air available on iOS and Android?",
    a: "The Synqed Air app is launching December 31, 2026. You can book flights on the web platform right now. Join the waitlist on our homepage to get early access and a launch-week fare credit.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[rgba(10,17,40,0.07)] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <span className="font-semibold text-[#1B2033] text-sm md:text-base leading-snug">{q}</span>
        <span className="shrink-0 mt-0.5 text-[#1C9BB8]">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="overflow-hidden"
      >
        <p className="text-sm text-[#8891A6] leading-relaxed pb-5">{a}</p>
      </motion.div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#1B2033]">
      <div className="bg-[#0A1128] text-white pb-16 md:pb-24 rounded-b-[48px] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#3DDCFF]/20 blur-[100px]" />
        </div>
        <Nav />
        <div className="mx-auto max-w-4xl px-6 md:px-10 pt-16 md:pt-24 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight mb-5"
          >
            How can we help?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-xl text-white/55 max-w-2xl mx-auto"
          >
            Transparent policies and real humans on WhatsApp — no bot loops, ever.
          </motion.p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">

        {/* Contact cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-5 mb-16"
        >
          <motion.a
            variants={fadeUp}
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-3xl p-8 border border-black/[0.05] flex flex-col items-center text-center hover:border-[#25D366]/30 hover:shadow-[0_8px_32px_-12px_rgba(37,211,102,0.25)] transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#E8F5E9] text-[#25D366] flex items-center justify-center mb-5">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">WhatsApp Support</h3>
            <p className="text-[#8891A6] text-sm mb-5 leading-relaxed">
              Connect with a real Synqed Air agent in under 2 minutes. No bots, no queues, no scripted loops. Available daily 06:00–23:00 WAT.
            </p>
            <span className="mt-auto font-semibold text-[#25D366] group-hover:underline flex items-center gap-1">
              Open WhatsApp →
            </span>
          </motion.a>

          <motion.a
            variants={fadeUp}
            href="mailto:support@synqedai.com"
            className="bg-white rounded-3xl p-8 border border-black/[0.05] flex flex-col items-center text-center hover:border-[#1C9BB8]/30 hover:shadow-[0_8px_32px_-12px_rgba(28,155,184,0.2)] transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#E8FBFF] text-[#1C9BB8] flex items-center justify-center mb-5">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">Email Support</h3>
            <p className="text-[#8891A6] text-sm mb-5 leading-relaxed">
              For non-urgent queries, billing questions, or partnership enquiries. We respond to all emails within one business day.
            </p>
            <span className="mt-auto font-semibold text-[#1C9BB8] group-hover:underline flex items-center gap-1">
              support@synqedai.com →
            </span>
          </motion.a>
        </motion.div>

        {/* Our promises */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 md:p-12 border border-black/[0.05] mb-10"
        >
          <h2 className="font-display text-xl md:text-2xl font-semibold mb-8">Our Promises to You</h2>
          <div className="space-y-5">
            {[
              {
                num: "01",
                title: "Zero Hidden Fees",
                body: "The price shown on the search results page is the exact price you pay at checkout — every time. Taxes, levies, and baggage fees are itemised and included. No surprises.",
              },
              {
                num: "02",
                title: "Instant Refunds When Eligible",
                body: "If the airline's fare rules permit a cancellation, we process your refund the same day. Funds go back to your original payment method without arbitrary holds or processing fees.",
              },
              {
                num: "03",
                title: "Proactive Flight Alerts",
                body: "We monitor your booked flights and message you on WhatsApp the moment the airline issues a delay, cancellation, or gate change — before you find out at the airport.",
              },
              {
                num: "04",
                title: "Human Support, Always",
                body: "Every WhatsApp conversation is handled by a real Synqed Air agent. We do not use scripted bot flows for support. If something goes wrong, a person will fix it.",
              },
            ].map((p) => (
              <div key={p.num} className="flex gap-5 p-5 rounded-2xl bg-[#F4F6FA]">
                <div className="w-10 h-10 rounded-xl bg-[#0A1128] flex items-center justify-center shrink-0">
                  <span className="font-mono text-xs font-bold text-[#3DDCFF]">{p.num}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-[#1B2033] mb-1">{p.title}</h4>
                  <p className="text-sm text-[#8891A6] leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 md:p-12 border border-black/[0.05]"
          id="refunds"
        >
          <h2 className="font-display text-xl md:text-2xl font-semibold mb-8">Frequently Asked Questions</h2>
          <div className="divide-y divide-[rgba(10,17,40,0.06)]">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-[rgba(10,17,40,0.07)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-[#8891A6]">
              Still have a question? A real agent is waiting on WhatsApp.
            </p>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold text-sm py-2.5 px-5 rounded-xl hover:bg-[#20bd5a] transition-colors shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </motion.div>

      </main>
      <Footer />
    </div>
  );
}
