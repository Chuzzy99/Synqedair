import React from "react";

export default function Footer() {
  return (
    <div className="bg-primary">
      <footer className="border-t border-line px-6 py-10 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-base/80 md:flex-row">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Synqed Air Logo" className="w-6 h-6 rounded-md object-cover" />
            <span className="font-display font-semibold text-white">Synqed Air</span>
          </div>
          <span>© {new Date().getFullYear()} Synqed Air</span>
          <span>Built for the diaspora corridor.</span>
        </div>
      </footer>
    </div>
  );
}
