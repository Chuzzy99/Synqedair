"use client";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { motion, Variants } from "framer-motion";
import { AlertCircle, Briefcase, CloudSun, MessageCircle, Plane } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Companion() {
  return (
    <div className="min-h-screen bg-offwhite text-ink">
      <div className="bg-indigo text-white">
        <Nav />
      </div>

      <main className="mx-auto max-w-3xl px-6 py-10 md:px-10">
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="mb-6 md:mb-10">
          <span className="font-mono text-xs tracking-widest text-[#1C9BB8] uppercase">
            Travel companion
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-semibold mt-2">
            You're all set for Nairobi
          </h2>
        </motion.div>

        {/* Boarding Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-indigo rounded-[24px] p-6 md:p-8 text-white relative overflow-hidden mb-12 shadow-[0_20px_40px_-15px_rgba(10,17,40,.3)]"
        >
          <div className="flex justify-between items-center relative z-10">
            <div className="font-display text-4xl md:text-5xl font-bold">LOS</div>
            <Plane className="w-8 h-8 text-ice transform rotate-45 mx-4" />
            <div className="font-display text-4xl md:text-5xl font-bold">NBO</div>
          </div>
          <div className="text-sm text-[#AEB6CC] mt-2 relative z-10">
            Kenya Airways KQ 512 · Thu, 3 Sep
          </div>
          
          <div className="flex justify-between items-end mt-12 pt-6 border-t border-white/20 border-dashed relative z-10">
            <div>
              <div className="text-xs text-[#8891A6] uppercase tracking-wider">Gate</div>
              <b className="block font-mono text-xl text-white mt-1">B14</b>
            </div>
            <div>
              <div className="text-xs text-[#8891A6] uppercase tracking-wider">Seat</div>
              <b className="block font-mono text-xl text-white mt-1">22C</b>
            </div>
            <div>
              <div className="text-xs text-[#8891A6] uppercase tracking-wider">Boards</div>
              <b className="block font-mono text-xl text-white mt-1">5:45a</b>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#8891A6] uppercase tracking-wider">Status</div>
              <b className="block font-mono text-xl text-[#8FE3A3] mt-1">On time</b>
            </div>
          </div>

          {/* Perforated edge bottom */}
          <div className="absolute left-0 right-0 -bottom-3 h-6 flex justify-around opacity-50">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="w-4 h-4 rounded-full bg-offwhite"></div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="flex flex-col gap-0 ml-2 md:ml-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-5 relative pb-10"
          >
            {/* Connecting line */}
            <div className="absolute left-[19px] top-10 bottom-0 w-px bg-line"></div>
            
            <div className="w-10 h-10 rounded-full bg-[#F2604B] text-white flex items-center justify-center shrink-0 shadow-lg relative z-10">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-line">
              <span className="text-[10px] text-[#1C9BB8] font-bold uppercase tracking-wider mb-1 block">
                Action needed · today
              </span>
              <div className="font-display text-base font-semibold text-ink">
                Kenya requires an eTA before arrival
              </div>
              <div className="text-sm text-mist mt-1 leading-relaxed">
                Based on your Nigerian passport. Takes about 4 minutes — we'll pre-fill what we already know.
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-5 relative pb-10"
          >
            <div className="absolute left-[19px] top-10 bottom-0 w-px bg-line"></div>
            <div className="w-10 h-10 rounded-full bg-white border border-line text-mist flex items-center justify-center shrink-0 shadow-sm relative z-10">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-line">
              <span className="text-[10px] text-[#1C9BB8] font-bold uppercase tracking-wider mb-1 block">
                Tomorrow, 6:00a
              </span>
              <div className="font-display text-base font-semibold text-ink">
                Check-in opens
              </div>
              <div className="text-sm text-mist mt-1 leading-relaxed">
                We'll check you in automatically and send your boarding pass.
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-5 relative pb-10"
          >
            <div className="absolute left-[19px] top-10 bottom-0 w-px bg-line"></div>
            <div className="w-10 h-10 rounded-full bg-white border border-line text-mist flex items-center justify-center shrink-0 shadow-sm relative z-10">
              <CloudSun className="w-5 h-5" />
            </div>
            <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-line">
              <span className="text-[10px] text-[#1C9BB8] font-bold uppercase tracking-wider mb-1 block">
                Departure day
              </span>
              <div className="font-display text-base font-semibold text-ink">
                Nairobi: 24°C, light rain expected
              </div>
              <div className="text-sm text-mist mt-1 leading-relaxed">
                Pack a light jacket for the evening.
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-5 relative"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-line text-mist flex items-center justify-center shrink-0 shadow-sm relative z-10">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-line">
              <span className="text-[10px] text-[#1C9BB8] font-bold uppercase tracking-wider mb-1 block">
                Anytime
              </span>
              <div className="font-display text-base font-semibold text-ink">
                Talk to a real person in under 2 minutes
              </div>
              <div className="text-sm text-mist mt-1 leading-relaxed">
                Delays, changes, refunds — no ticket queue, no bot loop.
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
