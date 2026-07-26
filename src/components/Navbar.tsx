'use client';

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
// Fixes issue 454: responsive navigation variants
import { Search, X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import WalletConnectButton from "./WalletConnectButton";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationToggle } from "./notifications/NotificationToggle";
import { useAuth, useI18n } from "@/contexts";
import { Button } from "./ui/Button";
import { LocaleSwitcher } from "./LocaleSwitcher";
import dynamic from "next/dynamic";

const GlobalSearch = dynamic(
  () => import("./search/GlobalSearch").then((mod) => mod.GlobalSearch),
  { ssr: false }
);
import { NavLinks, NavMobileLinks } from "./navbar/NavLinks";
import { NavWalletStatus } from "./navbar/NavWalletStatus";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { messages } = useI18n();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDesktopSearchActive, setIsDesktopSearchActive] = useState(false);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  useFocusTrap(mobileSearchRef, isMobileSearchOpen);

  useEffect(() => {
    if (!isMobileSearchOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSearchOpen]);

  return (
    <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-overlay border-b border-white/5 bg-dark-900/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:px-6 md:gap-4 md:px-8 md:py-5">
        <Link href="/" aria-label="NeuroWealth home" className="flex items-center gap-2 text-lg font-bold text-white">
          <span aria-hidden="true" className="text-brand-400">&#x2B21;</span> NeuroWealth
        </Link>

        <NavLinks />

        <search className="hidden md:block md:flex-1 md:max-w-xl">
          {isDesktopSearchActive ? (
            <GlobalSearch
              placeholder="Search pages, actions, or records"
              autoFocus
              onRequestClose={() => setIsDesktopSearchActive(false)}
            />
          ) : (
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
                aria-hidden="true"
              />
              <input
                type="text"
                placeholder="Search pages, actions, or records"
                onFocus={() => setIsDesktopSearchActive(true)}
                onClick={() => setIsDesktopSearchActive(true)}
                className="h-11 w-full rounded-xl border border-white/10 bg-slate-950/80 pl-10 pr-10 text-sm text-white shadow-inner shadow-black/20 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/20"
                readOnly
              />
            </div>
          )}
        </search>

        <div className="ml-auto flex items-center gap-2 sm:gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:text-white hover:bg-white/10 md:hidden"
            aria-label="Open global search"
            aria-haspopup="dialog"
            aria-expanded={isMobileSearchOpen}
          >
            <Search size={18} aria-hidden="true" />
          </button>

          <LocaleSwitcher />

          <NavMobileLinks />
          <NavWalletStatus />

          <NotificationToggle />
          <ThemeToggle />
          <WalletConnectButton />

          {user ? (
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase font-bold leading-none">{messages.navbar.account}</span>
                <span className="text-xs text-white font-medium">{user.displayName}</span>
              </div>
              <button
                onClick={signOut}
                aria-label={`Sign out of ${user.displayName}'s account`}
                className="min-h-9 rounded-md px-2 py-1 text-xs text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors uppercase font-bold"
              >
                {messages.navbar.signOut}
              </button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="secondary" size="sm" className="text-xs h-9">
                {messages.navbar.signIn}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isMobileSearchOpen && (
        <div
          ref={mobileSearchRef}
          className="fixed inset-0 z-modal bg-slate-950/90 backdrop-blur-md md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
        >
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-4 pb-4 pt-5 sm:px-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-200">Search</p>
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Close search"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <GlobalSearch
              autoFocus
              onRequestClose={() => setIsMobileSearchOpen(false)}
              className="z-dropdown"
            />

            <p className="mt-3 text-xs text-slate-400">
              Tip: Use arrow keys to move through results and Enter to navigate.
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}
