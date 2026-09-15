"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { motion, Variants } from "framer-motion";
import { AlertCircle, Briefcase, CloudSun, MessageCircle, Plane, Smartphone, Lock } from "lucide-react";
import Link from "next/link";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Companion() {
  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#1B2033]">
      <div className="bg-[#0A1128] text-white">
        <Nav />
      </div>

      <main className="mx-auto max-w-3xl px-6 py-10 md:px-10">

        {/* App-only badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-[#0A1128] text-white rounded-2xl px-5 py-3 mb-8 w-fit"
        >
          <Smartphone className="w-4 h-4 text-[#3DDCFF]" />
          <span className="text-sm font-semibold">App feature — launching Dec 31</span>
          <span className="bg-[#3DDCFF]/20 text-[#3DDCFF] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Preview</span>
        </motion.div>

        <motion.div initial="hidden" animate="show" variants={fadeUp} className="mb-6 md:mb-10">
          <span className="font-mono text-xs tracking-widest text-[#1C9BB8] uppercase">
            AI Travel Companion
          </span>
          <h1 className="font-display text-2xl md:text-4xl font-semibold mt-2 text-[#0A1128]">
            You&apos;re all set for Nairobi.
          </h1>
          <p className="text-[#8891A6] mt-2 text-sm md:text-base">
            This is a preview of what the AI Travel Companion looks like inside the app. It works silently in the background — briefing you, handling check-in, and alerting you before anything becomes a problem.
          </p>
        </motion.div>

        {/* Boarding Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#0A1128] rounded-[24px] p-6 md:p-8 text-white relative overflow-hidden mb-12 shadow-[0_20px_40px_-15px_rgba(10,17,40,.5)]"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#1C9BB8]/15 blur-[60px] pointer-events-none" />

          <div className="flex justify-between items-center relative z-10">
            <div className="font-display text-4xl md:text-5xl font-bold">LOS</div>
            <Plane className="w-8 h-8 text-[#3DDCFF] transform rotate-45 mx-4" />
            <div className="font-display text-4xl md:text-5xl font-bold">NBO</div>
          </div>
          <div className="text-sm text-white/45 mt-2 relative z-10">
            Kenya Airways KQ 512 · Thu, 3 Sep
          </div>

          <div className="flex justify-between items-end mt-12 pt-6 border-t border-white/15 border-dashed relative z-10">
            {[
              { label: "Gate", value: "B14" },
              { label: "Seat", value: "22C" },
              { label: "Boards", value: "5:45a" },
              { label: "Status", value: "On time", green: true },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-xs text-white/35 uppercase tracking-wider">{item.label}</div>
                <b className={`block font-mono text-xl mt-1 ${item.green ? "text-[#8FE3A3]" : "text-white"}`}>
                  {item.value}
                </b>
              </div>
            ))}
          </div>

          {/* Perforated edge */}
          <div className="absolute left-0 right-0 -bottom-3 h-6 flex justify-around opacity-30">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-[#F4F6FA]" />
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="flex flex-col gap-0 ml-2 md:ml-6 mb-12">
          {[
            {
              delay: 0.3,
              iconBg: "bg-[#F2604B]",
              icon: <AlertCircle className="w-5 h-5 text-white" />,
              label: "Action needed · today",
              title: "Kenya requires an eTA before arrival",
              body: "Based on your Nigerian passport. Takes about 4 minutes — we'll pre-fill what we already know.",
              hasLine: true,
            },
            {
              delay: 0.4,
              iconBg: "bg-white border border-[rgba(10,17,40,0.08)]",
              icon: <Briefcase className="w-5 h-5 text-[#8891A6]" />,
              label: "Tomorrow, 6:00a",
              title: "Check-in opens",
              body: "We'll check you in automatically and send your boarding pass to WhatsApp.",
              hasLine: true,
            },
            {
              delay: 0.5,
              iconBg: "bg-white border border-[rgba(10,17,40,0.08)]",
              icon: <CloudSun className="w-5 h-5 text-[#8891A6]" />,
              label: "Departure day",
              title: "Nairobi: 24°C, light rain expected",
              body: "Pack a light jacket for the evening.",
              hasLine: true,
            },
            {
              delay: 0.6,
              iconBg: "bg-white border border-[rgba(10,17,40,0.08)]",
              icon: <MessageCircle className="w-5 h-5 text-[#8891A6]" />,
              label: "Anytime",
              title: "Talk to a real person in under 2 minutes",
              body: "Delays, changes, refunds — no ticket queue, no bot loop. Just WhatsApp.",
              hasLine: false,
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: item.delay }}
              className="flex gap-5 relative pb-10 last:pb-0"
            >
              {item.hasLine && (
                <div className="absolute left-[19px] top-10 bottom-0 w-px bg-[rgba(10,17,40,0.08)]" />
              )}
              <div className={`w-10 h-10 rounded-full ${item.iconBg} flex items-center justify-center shrink-0 shadow-sm relative z-10`}>
                {item.icon}
              </div>
              <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-[rgba(10,17,40,0.06)]">
                <span className="text-[10px] text-[#1C9BB8] font-bold uppercase tracking-wider mb-1 block">
                  {item.label}
                </span>
                <div className="font-display text-base font-semibold text-[#1B2033]">{item.title}</div>
                <div className="text-sm text-[#8891A6] mt-1 leading-relaxed">{item.body}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-[#0A1128] text-white rounded-3xl p-8 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full bg-[#1C9BB8]/30 blur-[60px]" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs font-semibold text-[#3DDCFF] mb-4">
              <Lock className="w-3 h-3" /> App exclusive feature
            </div>
            <h2 className="font-display text-xl md:text-2xl font-semibold mb-3">
              The full companion experience is in the app.
            </h2>
            <p className="text-white/55 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
              Join the waitlist for early access when we launch December 31 — and a launch-week fare credit.
            </p>
            <Link
              href="/#waitlist"
              className="inline-flex items-center gap-2 bg-white text-[#0A1128] font-semibold py-3 px-6 rounded-xl hover:bg-[#3DDCFF] transition-colors text-sm"
            >
              Join the waitlist →
            </Link>
          </div>
        </motion.div>

      </main>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}
