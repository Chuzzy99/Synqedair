"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { useAuth } from "@/features/client/auth/auth.hook";
import { isSnoozed, snooze } from "@/lib/snooze";

const SHOW_DELAY_MS = 1200;

export default function SignInPrompt() {
  const { user, isInitializing, googleLogin, isLoggingIn } = useAuth();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const decided = useRef(false);

  // Decide once per page load, right after the session check finishes
  useEffect(() => {
    if (isInitializing || decided.current) return;

    // Already logged in or snoozed: never show during this page load,
    // even if the user logs out later
    if (user || isSnoozed()) {
      decided.current = true;
      return;
    }

    const timer = setTimeout(() => {
      decided.current = true;
      setOpen(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isInitializing, user]);

  // Logged in elsewhere (e.g. the My account dropdown): close this
  useEffect(() => {
    if (user) setOpen(false);
  }, [user]);

  const dismiss = () => {
    snooze();
    setOpen(false);
  };

  // Escape to close + lock page scroll while open
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        snooze();
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
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
      const res = await googleLogin({ idToken: credential });
      setOpen(false);

      const firstName = res.data.user.name?.trim().split(" ")[0] || "there";
      toast.success(`Welcome, ${firstName}!`, {
        description: "You're now signed in.",
      });
    } catch (err) {
      setError(
        isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Sign in failed. Please try again."
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) dismiss();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="signin-prompt-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/15 bg-indigo p-7 text-white shadow-2xl shadow-black/50"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

            <button
              type="button"
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative text-center">
              <img
                src="/logo.jpg"
                alt=""
                className="mx-auto h-12 w-12 rounded-xl object-cover ring-2 ring-white/20"
              />

              <h2
                id="signin-prompt-title"
                className="mt-5 font-display text-2xl font-semibold tracking-tight"
              >
                Fly smarter with Synqed Air
              </h2>
              <p className="mt-2 text-sm text-[#AEB6CC]">
                Sign in to manage your bookings and get a faster checkout. It
                takes one tap.
              </p>

              <div className="mt-6 flex justify-center">
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

              <button
                type="button"
                onClick={dismiss}
                className="mt-5 text-sm text-[#AEB6CC] transition-colors hover:text-white"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}