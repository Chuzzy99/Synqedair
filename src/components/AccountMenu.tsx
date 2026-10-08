"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { ChevronDown, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { useAuth } from "@/features/client/auth/auth.hook";

interface AccountMenuProps {
  variant?: "desktop" | "mobile";
}

export default function AccountMenu({ variant = "desktop" }: AccountMenuProps) {
  const { user, isInitializing, googleLogin, isLoggingIn, logout, isLoggingOut } =
    useAuth();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleGoogleSuccess = async (credential: string | undefined) => {
    if (!credential) {
      setError("Google did not return a credential. Please try again.");
      return;
    }

    setError(null);

    try {
      // The welcome toast is shown by the login mutation in useAuth
      await googleLogin({ idToken: credential });
      setOpen(false);
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Sign in failed. Please try again."
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    toast("You've been logged out.");
  };

  // Avoids flashing "My account" while we find out if someone is signed in
  if (isInitializing && !user) {
    return (
      <div
        className={`h-10 animate-pulse rounded-full bg-white/10 ${
          variant === "desktop" ? "w-28" : "mt-4 w-full"
        }`}
      />
    );
  }

  // Signed in: a single Logout button replaces the avatar + dropdown
  if (user) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`group inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 active:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 ${
          variant === "mobile" ? "mt-4 w-full" : ""
        }`}
      >
        <LogOut className="h-4 w-4 shrink-0 opacity-80 transition-transform group-hover:translate-x-0.5" />
        <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
      </button>
    );
  }

  // Signed out: "My account" button with the Google sign-in panel
  const panelPosition =
    variant === "desktop"
      ? "absolute right-0 top-full z-50 mt-3 w-72"
      : "mt-3 w-full";

  return (
    <div
      ref={containerRef}
      className={variant === "desktop" ? "relative" : "mt-4 w-full"}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="My account"
        className="flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
      >
        <span className="py-0.5">My account</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 opacity-70 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`${panelPosition} overflow-hidden rounded-2xl border border-white/15 bg-indigo text-white shadow-2xl shadow-black/40`}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent" />
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />

            <div className="relative p-5">
              <p className="text-base font-semibold">Welcome to Synqed Air</p>
              <p className="mt-1 text-xs text-[#AEB6CC]">
                Sign in to manage your bookings.
              </p>

              <div className="mt-5 flex justify-center">
                {isLoggingIn ? (
                  <p className="py-2.5 text-sm text-[#AEB6CC]">Signing you in...</p>
                ) : (
                  <GoogleLogin
                    onSuccess={(res) => handleGoogleSuccess(res.credential)}
                    onError={() =>
                      setError("Google sign in failed. Please try again.")
                    }
                    text="continue_with"
                    shape="pill"
                    theme="outline"
                    width="256"
                  />
                )}
              </div>

              {error && (
                <p className="mt-4 rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-200">
                  {error}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}