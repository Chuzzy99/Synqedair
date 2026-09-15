"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { motion, Variants } from "framer-motion";
import { Server, Zap, LineChart, ShieldCheck, ArrowRight } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.13 } },
};

const FEATURES = [
  {
    icon: <Server className="w-6 h-6" />,
    color: "bg-[#E8FBFF] text-[#1C9BB8]",
    title: "Provider-Agnostic API",
    body: "Our backend unifies Duffel, Amadeus, and direct airline connectors into a single contract. Swap inventory providers without touching your frontend.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    color: "bg-[#E5E9FA] text-[#4152B0]",
    title: "NLP-Native Search",
    body: "Embed our natural language booking engine to let employees search travel by typing what they want in plain English. No form, no dropdowns.",
  },
  {
    icon: <LineChart className="w-6 h-6" />,
    color: "bg-[#FFF3E0] text-[#E65100]",
    title: "Spend Analytics",
    body: "Full invoice consolidation and per-department budget controls. Deep integrations with major ERP systems for total visibility into travel spend.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "bg-[#E8F5E9] text-[#2E7D32]",
    title: "Policy Enforcement",
    body: "Set fare class rules, advance booking requirements, and preferred airline policies. The engine enforces them automatically at point of booking.",
  },
];

const STEPS = [
  { num: "01", title: "Request access", body: "Submit your company details and use case. We review all applications within 2 business days." },
  { num: "02", title: "Get your sandbox", body: "Access our API sandbox environment with full documentation, Postman collections, and test inventory." },
  { num: "03", title: "Go live", body: "Once your integration is validated, we flip you to production with a dedicated technical account manager." },
];

export default function CorporatePage() {
  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#1B2033]">
      <div className="bg-[#0A1128] text-white pb-16 md:pb-24 rounded-b-[48px] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#3DDCFF]/20 blur-[100px]" />
        </div>
        <Nav />
        <div className="mx-auto max-w-4xl px-6 md:px-10 pt-16 md:pt-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold text-[#3DDCFF] tracking-widest uppercase mb-8"
          >
            <Server className="w-3.5 h-3.5" /> Corporate & API
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight mb-5"
          >
            Corporate travel and<br className="hidden md:block" /> API access.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-base md:text-xl text-white/55 max-w-2xl mx-auto"
          >
            The same infrastructure powering Synqed Air is available to corporations and travel management companies via a clean REST API.
          </motion.p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">

        {/* Features */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 gap-5 mb-20"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="bg-white rounded-3xl p-7 border border-black/[0.05] flex gap-5 items-start"
            >
              <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center shrink-0`}>
                {f.icon}
              </div>
              <div>
                <h3 className="font-display text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-[#8891A6] leading-relaxed">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-4xl font-semibold">How to get started</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div key={step.num} className="bg-white rounded-3xl p-7 border border-black/[0.05]">
                <div className="w-12 h-12 rounded-2xl bg-[#0A1128] flex items-center justify-center mb-5">
                  <span className="font-mono text-sm font-bold text-[#3DDCFF]">{step.num}</span>
                </div>
                <h3 className="font-display text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-[#8891A6] leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#0A1128] text-white rounded-3xl p-8 md:p-14 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full bg-[#1C9BB8]/30 blur-[80px]" />
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">
              Ready to build on Synqed Air?
            </h2>
            <p className="text-white/55 mb-8 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
              Get access to our API sandbox, full documentation, and a technical onboarding session. All serious enquiries reviewed within 2 business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:ceo@synqedai.com?subject=Corporate API Access Request"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#0A1128] font-semibold py-3.5 px-7 rounded-2xl hover:bg-[#3DDCFF] transition-colors text-sm"
              >
                Request API Access <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="mailto:ceo@synqedai.com?subject=Corporate Travel Enquiry"
                className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold py-3.5 px-7 rounded-2xl hover:bg-white/15 transition-colors text-sm"
              >
                Book a demo call
              </a>
            </div>
          </div>
        </motion.div>

      </main>
      <Footer />
    </div>
  );
}
