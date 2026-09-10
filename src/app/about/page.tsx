"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { motion, Variants } from "framer-motion";
import { PlaneTakeoff, Zap, Globe2, Users2, ArrowRight } from "lucide-react";
import Link from "next/link";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.13 } },
};

const TEAM = [
  {
    name: "Perez Azazi",
    title: "Chief Executive Officer",
    bio: "Founder of SynqedAI. Built AI automation infrastructure for companies across Africa and the diaspora. Knows firsthand the pain of booking diaspora corridors with hidden fees.",
    initials: "PA",
    color: "bg-[#1C9BB8]",
  },
  {
    name: "Emmanuel Onyia",
    title: "Chief Operating Officer",
    bio: "Operations leader with deep experience scaling logistics across West Africa. Drives the partnerships and airline relationships that power Synqed Air's live inventory.",
    initials: "EO",
    color: "bg-[#4152B0]",
  },
  {
    name: "Henry Erigbe",
    title: "Chief Technology Officer",
    bio: "Full-stack engineer and architect of the Synqed Air platform. Previously built high-throughput systems for African fintech. Leads the engineering team building the app.",
    initials: "HE",
    color: "bg-[#0A1128]",
  },
];

const VALUES = [
  {
    icon: <PlaneTakeoff className="w-6 h-6" />,
    color: "bg-[#E8FBFF] text-[#1C9BB8]",
    title: "Radical transparency",
    body: "No fee appears at checkout that wasn't shown at search. We don't believe pricing games are a business model.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    color: "bg-[#E5E9FA] text-[#4152B0]",
    title: "Speed over everything",
    body: "Booking a flight should take under 3 minutes. Support should respond in under 2. We measure both.",
  },
  {
    icon: <Globe2 className="w-6 h-6" />,
    color: "bg-[#FFF3E0] text-[#E65100]",
    title: "Corridor-first design",
    body: "Every product decision starts with the specific routes diaspora travelers actually fly — not the routes generic OTAs optimise for.",
  },
  {
    icon: <Users2 className="w-6 h-6" />,
    color: "bg-[#E8F5E9] text-[#2E7D32]",
    title: "Human over bot",
    body: "AI handles the data work. Humans handle the support. That combination is what turns a traveler into a loyal customer.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#1B2033]">

      {/* Header */}
      <div className="bg-[#0A1128] text-white pb-20 md:pb-28 rounded-b-[48px] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#3DDCFF]/20 blur-[100px]" />
        </div>
        <Nav />
        <div className="mx-auto max-w-4xl px-6 md:px-10 pt-16 md:pt-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold text-[#3DDCFF] tracking-widest uppercase mb-8"
          >
            <PlaneTakeoff className="w-3.5 h-3.5" />
            Our story
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight mb-6"
          >
            We built the airline experience<br className="hidden md:block" /> the diaspora deserves.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-base md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed"
          >
            Synqed Air is an AI-native flight booking company built specifically for Africa&apos;s diaspora corridors — with transparent pricing, real human support, and technology that works for you before, during, and after the flight.
          </motion.p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 md:px-10 py-20 md:py-28">

        {/* Origin story */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-10 md:gap-16 mb-24 items-center"
        >
          <div>
            <span className="font-mono text-xs tracking-widest text-[#1C9BB8] uppercase mb-4 block">Why we exist</span>
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-5 leading-snug">
              The corridor problem no one else is solving.
            </h2>
            <div className="space-y-4 text-[#8891A6] leading-relaxed">
              <p>
                Lagos to London. Lagos to Nairobi. Accra to Toronto. These routes carry millions of diaspora travelers every year — people visiting family, closing business deals, carrying remittances home.
              </p>
              <p>
                And yet every major booking platform treats them as afterthoughts. Prices are manipulated between search and checkout. Support is a bot loop. Visa requirements are your problem.
              </p>
              <p className="text-[#1B2033] font-medium">
                We built Synqed Air because we fly these routes ourselves. We know what it costs — in money, time, and stress — when the system doesn&apos;t work.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "$15B+", label: "Diaspora travel market size" },
              { value: "3x", label: "More likely to be hit with hidden fees on diaspora routes vs European routes" },
              { value: "< 2 min", label: "Our WhatsApp support response target" },
              { value: "Dec 31", label: "App launch date" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-5 border border-black/[0.05]">
                <div className="font-display text-2xl md:text-3xl font-bold text-[#0A1128] mb-2">{s.value}</div>
                <div className="text-xs text-[#8891A6] leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Values */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="font-mono text-xs tracking-widest text-[#1C9BB8] uppercase mb-3 block">What we stand for</span>
            <h2 className="font-display text-2xl md:text-4xl font-semibold">Our operating principles</h2>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid md:grid-cols-2 gap-5"
          >
            {VALUES.map((v) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                className="bg-white rounded-3xl p-7 border border-black/[0.05] flex gap-5 items-start"
              >
                <div className={`w-12 h-12 rounded-2xl ${v.color} flex items-center justify-center shrink-0`}>
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-[#8891A6] leading-relaxed">{v.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Team */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="font-mono text-xs tracking-widest text-[#1C9BB8] uppercase mb-3 block">The founders</span>
            <h2 className="font-display text-2xl md:text-4xl font-semibold">Who&apos;s building this</h2>
          </motion.div>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="grid md:grid-cols-3 gap-6"
          >
            {TEAM.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                className="bg-white rounded-3xl p-7 border border-black/[0.05] flex flex-col"
              >
                <div className={`w-14 h-14 rounded-2xl ${member.color} flex items-center justify-center mb-5 shrink-0`}>
                  <span className="font-display font-bold text-lg text-white">{member.initials}</span>
                </div>
                <h3 className="font-display text-base font-semibold">{member.name}</h3>
                <p className="text-xs text-[#1C9BB8] font-semibold mb-3 mt-0.5">{member.title}</p>
                <p className="text-sm text-[#8891A6] leading-relaxed flex-1">{member.bio}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* SynqedAI connection */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#0A1128] rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-[#3DDCFF]/25 blur-[80px]" />
          </div>
          <div className="relative z-10">
            <span className="font-mono text-xs tracking-widest text-[#3DDCFF] uppercase mb-4 block">The infrastructure</span>
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">Powered by SynqedAI</h2>
            <p className="text-white/55 max-w-xl mx-auto mb-8 leading-relaxed">
              Synqed Air is built on the same AI automation infrastructure that powers SynqedAI — our sister company delivering enterprise AI solutions across Africa and the diaspora. That means our flight intelligence, NLP search, and companion features are production-grade from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="https://synqedai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#0A1128] font-semibold py-3 px-6 rounded-xl hover:bg-[#3DDCFF] transition-colors text-sm"
              >
                Visit SynqedAI <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#waitlist"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/15 transition-colors text-sm"
              >
                Join our waitlist <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

      </main>
      <Footer />
    </div>
  );
}
