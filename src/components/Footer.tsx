"use client";

import React from "react";
import Link from "next/link";
import { PlaneTakeoff } from "lucide-react";

const links = {
  Product: [
    { label: "Book a Flight", href: "/search" },
    { label: "Popular Routes", href: "/search" },
    { label: "Corporate Travel", href: "/corporate" },
    { label: "Travel Companion", href: "/companion", badge: "App" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "SynqedAI", href: "https://synqedai.com", external: true },
    { label: "Investor Relations", href: "mailto:ceo@synqedai.com" },
    { label: "Press", href: "mailto:ceo@synqedai.com" },
  ],
  Support: [
    { label: "Help Centre", href: "/support" },
    { label: "WhatsApp Support", href: "https://wa.me/2348108372982", external: true },
    { label: "Refund Policy", href: "/support#refunds" },
    { label: "Contact Us", href: "/support" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#05070F] text-white border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-16 pb-10 md:pt-20 md:pb-12">

        {/* Main grid */}
        <div className="grid grid-cols-2 gap-y-10 gap-x-6 md:grid-cols-6 md:gap-8 mb-14">

          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="w-8 h-8 rounded-lg bg-indigo2 border border-white/10 flex items-center justify-center">
                <PlaneTakeoff className="w-4 h-4 text-ice" />
              </div>
              <span className="font-display font-semibold text-lg tracking-tight">Synqed Air</span>
            </Link>

            <p className="text-sm text-white/45 leading-relaxed mb-6 max-w-[240px]">
              Transparent-pricing flight booking built for Africa&apos;s diaspora corridors. The price you see is the price you pay.
            </p>

            {/* App launch badge */}
            <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3DDCFF] animate-pulse shrink-0" />
              <span className="text-xs font-semibold text-ice tracking-wide">App launching Dec 31</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30 mb-4">
                {title}
              </h4>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      target={(item as any).external ? "_blank" : undefined}
                      rel={(item as any).external ? "noopener noreferrer" : undefined}
                      className="text-sm text-white/55 hover:text-white transition-colors flex items-center gap-1.5 w-fit"
                    >
                      {item.label}
                      {(item as any).badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-[#3DDCFF]/15 text-[#3DDCFF] px-1.5 py-0.5 rounded">
                          {(item as any).badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/25 text-center sm:text-left">
            © {new Date().getFullYear()} Synqed Air Ltd. All rights reserved.
          </p>
          <p className="text-xs text-white/20 text-center sm:text-right">
            A sister company of{" "}
            <Link
              href="https://synqedai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/50 transition-colors underline underline-offset-2"
            >
              SynqedAI
            </Link>
            {" "}· Built for the diaspora corridor.
          </p>
        </div>
      </div>
    </footer>
  );
}
