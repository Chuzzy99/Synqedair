"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { ChevronDown, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { useAuth } from "@/features/client/auth/auth.hook";
import type { User } from "@/features/client/auth/auth.type";

interface AccountMenuProps {
  variant?: "desktop" | "mobile";
}

const getFirstName = (user: User) =>
  user.name?.trim().split(" ")[0] || user.email.split("@")[0] || "there";

function Avatar({ user, size }: { user: User; size: "sm" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const dimension = size === "sm" ? "h-7 w-7 text-xs" : "h-12 w-12 text-base";

  if (user.avatar && !failed) {
    return (
      <img
        src={user.avatar}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${dimension} shrink-0 rounded-full object-cover ring-2 ring-white/30`}
      />
    );
  }

  return (
    <span
      className={`${dimension} flex shrink-0 items-center justify-center rounded-full bg-white/20 font-semibold uppercase ring-2 ring-white/30`}
    >
      {(user.name ?? user.email).charAt(0)}
    </span>
  );
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
      const res = await googleLogin({ idToken: credential });
      setOpen(false);
      toast.success(`Welcome, ${getFirstName(res.data.user)}!`, {
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
          variant === "desktop" ? "w-36" : "mt-4 w-full"
        }`}
      />
    );
  }

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
        className="flex w-full items-center justify-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
      >
        {user ? (
          <>
            <Avatar user={user} size="sm" />
            <span className="max-w-[7rem] truncate">{getFirstName(user)}</span>
          </>
        ) : (
          <span className="py-0.5">My account</span>
        )}
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
              {user ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar user={user} size="lg" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {user.name ?? "Your account"}
                      </p>
                      <p className="truncate text-xs text-[#AEB6CC]">{user.email}</p>
                    </div>
                  </div>

                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-[#AEB6CC]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Signed in
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="mt-4 flex w-full items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Log out"}
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}