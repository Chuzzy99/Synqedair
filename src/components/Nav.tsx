import React from "react";
import Link from "next/link";

export default function Nav() {
  return (
    <div className="bg-transparent relative z-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-7 md:px-10 text-white">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-white hover:opacity-80 transition-opacity">
          {/* <!-- TODO: swap for Synqed Air logo asset --> */}
          Synqed Air
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-mist md:flex">
          <a href="/#pricing" className="transition-colors hover:text-white">
            Pricing
          </a>
          <a href="/search" className="transition-colors hover:text-white">
            Flights
          </a>
          <a href="/companion" className="transition-colors hover:text-white">
            Companion
          </a>
        </nav>
        <a
          href="/search"
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-indigo transition-colors hover:bg-offwhite"
        >
          Book a flight
        </a>
      </header>
    </div>
  );
}
