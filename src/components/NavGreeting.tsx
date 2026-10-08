"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useAuth } from "@/features/client/auth/auth.hook";
import { getFirstName, getGreetingPeriod } from "@/lib/greeting";
import type { GreetingPeriod } from "@/lib/greeting";

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
  const { user, isInitializing } = useAuth();
  const [period, setPeriod] = useState<GreetingPeriod | null>(null);

  // Computed after mount so server and browser HTML always match,
  // and refreshed every minute so a tab left open changes at the right hour
  useEffect(() => {
    const update = () => setPeriod(getGreetingPeriod());

    update();
    const timer = setInterval(update, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  // Wait for the auth check too, so a returning user doesn't see
  // the name-less greeting flash before their name appears
  if (!period || (isInitializing && !user)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className={`flex min-w-0 items-center gap-2.5 border-l border-white/20 pl-3 md:pl-4 ${className}`}
    >
      <div className="min-w-0 leading-tight">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#AEB6CC] md:text-[11px]">
          {LABELS[period]}
        </p>

        {user && (
          <p className="max-w-[8rem] truncate bg-gradient-to-r from-white via-white to-amber-200 bg-clip-text font-display text-base font-semibold tracking-tight text-transparent sm:max-w-[12rem] md:text-lg">
            {getFirstName(user)}
          </p>
        )}
      </div>
    </motion.div>
  );
}