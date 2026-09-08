"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { motion, Variants } from "framer-motion";
import { Server, Zap, LineChart } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function CorporatePage() {
  return (
    <div className="min-h-screen bg-offwhite text-ink">
      <div className="bg-indigo text-white pb-16 md:pb-24 rounded-b-[40px] shadow-sm">
        <Nav />
        <div className="mx-auto max-w-4xl px-6 md:px-10 pt-16 md:pt-24 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-6xl font-semibold tracking-tight leading-tight mb-6"
          >
            Powering Corporate Travel<br className="hidden md:block"/> at Scale.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-[#AEB6CC] max-w-2xl mx-auto"
          >
            The same provider-agnostic infrastructure that powers Synqed Air is available for corporate partners and travel management companies.
          </motion.p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          <motion.div variants={fadeUp} className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#E8FBFF] text-[#1C9BB8] flex items-center justify-center mb-6">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-3">Provider-Agnostic API</h3>
            <p className="text-mist leading-relaxed text-sm">
              Our backend unifies Duffel, Amadeus, and direct airline connectors into a single API contract. Swap providers without touching your frontend.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#E5E9FA] text-[#4152B0] flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-3">AI-Native Search</h3>
            <p className="text-mist leading-relaxed text-sm">
              Integrate our Natural Language Processing capabilities to let your employees book travel by simply typing what they want in plain English.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-indigo/5 text-indigo flex items-center justify-center mb-6">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-3">Expense Management</h3>
            <p className="text-mist leading-relaxed text-sm">
              Consolidate invoicing and control budgets with deep integrations into major ERP systems. Total visibility into your company's travel spend.
            </p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 md:mt-24 bg-ice-tint border border-[#C9F1FC] rounded-3xl p-8 md:p-12 text-center"
        >
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#0E5A6E] mb-4">
            Build the Future of Travel
          </h2>
          <p className="text-[#0E5A6E]/80 mb-8 max-w-xl mx-auto">
            Get access to our API sandbox and see how our infrastructure can power your next travel product.
          </p>
          <button className="bg-[#0E5A6E] text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo transition-colors">
            Request API Access
          </button>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
