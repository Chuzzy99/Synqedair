"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Replace XXXXXXXXXX with your actual WhatsApp number (digits only, with country code)
// e.g. "2348012345678" for a Nigerian number
const WA_NUMBER = "2348012345678";
const WA_MSG = encodeURIComponent(
  "Hi Synqed Air 👋 I need help with my booking."
);
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;

export default function FloatingSupportChat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.28)] border border-black/[0.06] w-[272px] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#25D366] px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                {/* WhatsApp icon */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.528 5.845L.057 23.786a.5.5 0 0 0 .614.635l6.094-1.598A11.937 11.937 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.718 9.718 0 0 1-4.954-1.357l-.353-.21-3.664.961.977-3.568-.23-.368A9.716 9.716 0 0 1 2.25 12C2.25 6.61 6.61 2.25 12 2.25S21.75 6.61 21.75 12 17.39 21.75 12 21.75z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white leading-tight">Synqed Air Support</p>
                <p className="text-xs text-white/80 mt-0.5">Typically replies in under 2 min</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <div className="bg-[#F0F4F8] rounded-xl rounded-tl-none px-3.5 py-2.5 text-sm text-[#1B2033] leading-relaxed mb-4">
                Hi there 👋 Have a question about your booking, a delay, or need help with a refund? We&apos;re on WhatsApp.
              </div>
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.528 5.845L.057 23.786a.5.5 0 0 0 .614.635l6.094-1.598A11.937 11.937 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.718 9.718 0 0 1-4.954-1.357l-.353-.21-3.664.961.977-3.568-.23-.368A9.716 9.716 0 0 1 2.25 12C2.25 6.61 6.61 2.25 12 2.25S21.75 6.61 21.75 12 17.39 21.75 12 21.75z" />
                </svg>
                Open WhatsApp
              </a>
              <p className="text-center text-[10px] text-[#8891A6] mt-3">
                Real humans · No bot loops · Available now
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.8, type: "spring", stiffness: 280, damping: 22 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_4px_20px_-4px_rgba(37,211,102,0.55)] hover:scale-105 active:scale-95 transition-transform"
        aria-label="WhatsApp Support"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.118 1.528 5.845L.057 23.786a.5.5 0 0 0 .614.635l6.094-1.598A11.937 11.937 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.718 9.718 0 0 1-4.954-1.357l-.353-.21-3.664.961.977-3.568-.23-.368A9.716 9.716 0 0 1 2.25 12C2.25 6.61 6.61 2.25 12 2.25S21.75 6.61 21.75 12 17.39 21.75 12 21.75z" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
