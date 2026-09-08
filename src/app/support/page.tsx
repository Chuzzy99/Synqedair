"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { motion, Variants } from "framer-motion";
import { MessageCircle, HelpCircle, MapPin } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function SupportPage() {
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
            How can we help?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-[#AEB6CC] max-w-2xl mx-auto"
          >
            Transparent policies and instant human support when you need it.
          </motion.p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        
        {/* Support Options */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6 mb-16"
        >
          <motion.div variants={fadeUp} className="bg-white rounded-3xl p-8 border border-line flex flex-col items-center text-center hover:shadow-[0_8px_24px_-12px_rgba(61,220,255,0.4)] transition-all cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-[#E5F3E6] text-[#2E7D32] flex items-center justify-center mb-6">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">WhatsApp Support</h3>
            <p className="text-mist text-sm mb-6">
              Connect with a human agent in under 2 minutes. We don't use infinite bot loops.
            </p>
            <button className="mt-auto font-semibold text-[#2E7D32] hover:underline">Chat with us →</button>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white rounded-3xl p-8 border border-line flex flex-col items-center text-center hover:shadow-[0_8px_24px_-12px_rgba(61,220,255,0.4)] transition-all cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-indigo/5 text-indigo flex items-center justify-center mb-6">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">Help Center</h3>
            <p className="text-mist text-sm mb-6">
              Browse our transparent policies on baggage, refunds, and ticket changes.
            </p>
            <button className="mt-auto font-semibold text-indigo hover:underline">Read articles →</button>
          </motion.div>
        </motion.div>

        {/* Transparent Policies */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm">
          <h2 className="font-display text-2xl font-semibold mb-8 text-center">Our Promises</h2>
          <div className="space-y-6">
            <div className="flex gap-4 p-4 rounded-xl bg-offwhite">
              <div className="w-8 h-8 rounded-full bg-ice flex items-center justify-center shrink-0">
                <span className="font-bold text-indigo">1</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Zero Hidden Fees</h4>
                <p className="text-sm text-mist">
                  The price you see on the search results page is the price you pay at checkout. No unexpected "booking fees" or "platform charges" will be added.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl bg-offwhite">
              <div className="w-8 h-8 rounded-full bg-ice flex items-center justify-center shrink-0">
                <span className="font-bold text-indigo">2</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Instant Cancellations</h4>
                <p className="text-sm text-mist">
                  If the airline allows cancellations, we process it instantly. Your refund will be returned to your original payment method without arbitrary 30-day holds.
                </p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl bg-offwhite">
              <div className="w-8 h-8 rounded-full bg-ice flex items-center justify-center shrink-0">
                <span className="font-bold text-indigo">3</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Proactive Companion</h4>
                <p className="text-sm text-mist">
                  We monitor your flight status and will proactively message you on WhatsApp if there's a delay, cancellation, or gate change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
