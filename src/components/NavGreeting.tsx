"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Sunrise, Sunset } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAuth } from "@/features/client/auth/auth.hook";
import { getFirstName, getGreetingPeriod } from "@/lib/greeting";
import type { GreetingPeriod } from "@/lib/greeting";

const ICONS: Record<GreetingPeriod, LucideIcon> = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
  night: Moon,
};

const LABELS: Record<GreetingPeriod, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
  night: "Welcome back",
};

interface NavGreetingProps {
  className?: string;
}

export default function NavGreeting({ className = "" }: NavGreetingProps) {
  const { user } = useAuth();
  const [period, setPeriod] = useState<GreetingPeriod | null>(null);

  // Computed after mount so server and browser HTML always match,
  // and refreshed every minute so a tab left open changes at the right hour
  useEffect(() => {
    const update = () => setPeriod(getGreetingPeriod());

    update();
    const timer = setInterval(update, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  if (!user || !period) return null;

  const Icon = ICONS[period];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className={`flex min-w-0 items-center gap-2.5 border-l border-white/20 pl-3 md:pl-4 ${className}`}
    >
      {/* <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300/30 via-white/10 to-transparent ring-1 ring-white/25 md:h-10 md:w-10">
        <span className="absolute inset-0 rounded-full bg-amber-300/20 blur-md" />
        <Icon className="relative h-[18px] w-[18px] text-amber-200 md:h-5 md:w-5" />
      </span> */}

      <div className="min-w-0 leading-tight">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#AEB6CC] md:text-[11px]">
          {LABELS[period]}
        </p>
        <p className="max-w-[8rem] truncate bg-gradient-to-r from-white via-white to-amber-200 bg-clip-text font-display text-base font-semibold tracking-tight text-transparent sm:max-w-[12rem] md:text-lg">
          {getFirstName(user)}
        </p>
      </div>
    </motion.div>
  );
}