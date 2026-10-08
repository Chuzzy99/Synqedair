"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AccountMenu from "@/components/AccountMenu";
import NavGreeting from "@/components/NavGreeting";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-transparent relative z-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:py-7 md:px-10 text-white relative z-50">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.jpg" alt="Synqed Air Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover" />
            <span className="font-display text-lg md:text-xl font-semibold tracking-tight text-white hidden sm:block">
              Synqed Air
            </span>
          </Link>

          {/* Hidden on tablets (md) where the nav links need the room */}
          <NavGreeting className="md:hidden lg:flex" />
        </div>

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

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/search"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-indigo transition-colors hover:bg-offwhite"
          >
            Book a flight
          </Link>
          <AccountMenu variant="desktop" />
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 -mr-2 text-white hover:opacity-70 transition-opacity"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
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
              className="mt-4 rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-indigo transition-colors hover:bg-offwhite"
            >
              Book a flight
            </Link>

            <AccountMenu variant="mobile" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}