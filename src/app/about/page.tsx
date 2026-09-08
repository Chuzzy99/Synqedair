"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { motion, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-offwhite text-ink">
      <div className="bg-indigo text-white pb-16 md:pb-24 rounded-b-[40px] shadow-sm">
        <Nav />
        <div className="mx-auto max-w-4xl px-6 md:px-10 pt-16 md:pt-24 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight mb-6"
          >
            A Travel Operating System<br className="hidden md:block"/> for the Diaspora.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-[#AEB6CC] max-w-2xl mx-auto"
          >
            Synqed Air was born from a simple truth: traveling across emerging markets is full of unnecessary friction. We're here to fix the infrastructure of travel.
          </motion.p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-16 md:space-y-24"
        >
          {/* Section 1 */}
          <motion.section variants={fadeUp} className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">
                The Synqed Ecosystem
              </h2>
              <p className="text-mist leading-relaxed mb-4">
                As a sister company to SynqedAI, we believe that intelligent software can eliminate the administrative burden of travel. 
              </p>
              <p className="text-mist leading-relaxed">
                Whether you are a student heading home for the holidays, a business traveler moving across the continent, or an investor flying into Lagos, you deserve an experience that respects your time and your wallet.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-8 aspect-square flex items-center justify-center shadow-sm">
               <div className="w-24 h-24 rounded-full bg-indigo/5 text-indigo flex items-center justify-center font-display font-bold text-4xl">
                 S
               </div>
            </div>
          </motion.section>

          {/* Section 2 */}
          <motion.section variants={fadeUp} className="grid md:grid-cols-2 gap-8 md:gap-16 items-center md:flex-row-reverse">
            <div className="md:order-2">
              <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">
                Transparent by Design
              </h2>
              <p className="text-mist leading-relaxed mb-4">
                The airline industry has normalized hidden fees and deceptive pricing. We are building the antidote. 
              </p>
              <p className="text-mist leading-relaxed">
                When you search on Synqed Air, the price you see is the absolute final price—inclusive of all taxes, baggage fees, and platform costs. No last-minute surprises.
              </p>
            </div>
            <div className="bg-ice-tint rounded-3xl p-8 aspect-square flex items-center justify-center md:order-1 border border-[#C9F1FC]">
               <div className="text-[#0E5A6E] font-mono text-center">
                 <div className="text-sm uppercase tracking-widest opacity-60 mb-2">Checkout Total</div>
                 <div className="text-4xl font-semibold">₦387,200</div>
                 <div className="text-xs opacity-60 mt-2">Zero hidden fees applied</div>
               </div>
            </div>
          </motion.section>

        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
