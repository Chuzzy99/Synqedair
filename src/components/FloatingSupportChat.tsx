"use client";

import { MessageSquareText } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingSupportChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom left" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 bg-white text-ink w-[300px] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] overflow-hidden border border-line"
          >
            <div className="bg-indigo p-4 text-white">
              <h3 className="font-display font-semibold text-lg">AI Support Agent</h3>
              <p className="text-xs text-ice/80">Usually replies instantly</p>
            </div>
            <div className="p-4 h-48 bg-offwhite flex flex-col gap-3 overflow-y-auto">
              <div className="bg-white border border-line rounded-2xl rounded-tl-none p-3 text-sm shadow-sm">
                Hi! I'm your Synqed Air AI assistant. How can I help you with your booking today?
              </div>
            </div>
            <div className="p-3 bg-white border-t border-line">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="w-full bg-offwhite border-none rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ice"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo2 hover:scale-105 transition-all"
      >
        <MessageSquareText className="w-6 h-6" />
      </button>
    </div>
  );
}
