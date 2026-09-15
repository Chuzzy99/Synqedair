"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-transparent relative z-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:py-7 md:px-10 text-white relative z-50">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo.jpg" alt="Synqed Air Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover" />
          <span className="font-display text-lg md:text-xl font-semibold tracking-tight text-white hidden sm:block">
            Synqed Air
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[#AEB6CC] md:flex">
          <Link href="/about" className="transition-colors hover:text-white">
            About Us
          </Link>
          <Link href="/corporate" className="transition-colors hover:text-white">
            Corporate
          </Link>
          <Link href="/support" className="transition-colors hover:text-white">
            Support
          </Link>
        </nav>
        <div className="hidden md:block">
          <Link
            href="/search"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-indigo transition-colors hover:bg-offwhite"
          >
            Book a flight
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 -mr-2 text-white hover:opacity-70 transition-opacity"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-indigo shadow-lg border-t border-white/10 md:hidden flex flex-col py-4 px-6 z-40"
          >
            <Link 
              href="/about" 
              onClick={() => setIsOpen(false)}
              className="py-3 text-[#AEB6CC] hover:text-white transition-colors border-b border-white/5"
            >
              About Us
            </Link>
            <Link 
              href="/corporate" 
              onClick={() => setIsOpen(false)}
              className="py-3 text-[#AEB6CC] hover:text-white transition-colors border-b border-white/5"
            >
              Corporate
            </Link>
            <Link 
              href="/support" 
              onClick={() => setIsOpen(false)}
              className="py-3 text-[#AEB6CC] hover:text-white transition-colors border-b border-white/5"
            >
              Support
            </Link>
            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className="mt-6 rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-indigo transition-colors hover:bg-offwhite"
            >
              Book a flight
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
