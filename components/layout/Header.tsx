"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, Zap } from "lucide-react";
import { ALL_SPORTS, SPORT_SLUG } from "@/types";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-dark border-b border-white/10">
      {/* Top bar */}
      <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Zap className="w-5 h-5 text-brand-red fill-brand-red" />
          <span className="text-white font-black text-lg tracking-tight leading-none">
            HS SPORTS<span className="text-brand-red"> ELITE</span>
          </span>
        </Link>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="text-white/60 hover:text-white transition-colors p-2"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <Link
            href="/subscribe"
            className="bg-brand-red hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-sm transition-colors"
          >
            Subscribe
          </Link>
          <Link
            href="/advertise"
            className="border border-white/30 hover:border-white text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-sm transition-colors"
          >
            Advertise
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-white/10 bg-brand-gray">
          <div className="max-w-screen-xl mx-auto px-4 py-2">
            <form action="/search" method="get">
              <input
                name="q"
                autoFocus
                placeholder="Search schools, sports, athletes…"
                className="w-full bg-transparent text-white placeholder-white/40 text-sm outline-none py-1"
              />
            </form>
          </div>
        </div>
      )}

      {/* Sport nav */}
      <SportNav />

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-brand-gray border-t border-white/10">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link href="/subscribe" className="text-brand-red font-bold uppercase tracking-wider text-sm" onClick={() => setMobileOpen(false)}>
              Subscribe
            </Link>
            <Link href="/advertise" className="text-white/70 font-bold uppercase tracking-wider text-sm" onClick={() => setMobileOpen(false)}>
              Advertise
            </Link>
            <Link href="/scores" className="text-white/70 font-bold uppercase tracking-wider text-sm" onClick={() => setMobileOpen(false)}>
              Scores
            </Link>
            <div className="border-t border-white/10 pt-3 grid grid-cols-2 gap-2">
              {ALL_SPORTS.map((sport) => (
                <Link
                  key={sport}
                  href={`/sports/${SPORT_SLUG[sport]}`}
                  className="text-white/60 hover:text-white text-sm py-1 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {sport}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function SportNav() {
  return (
    <nav className="bg-brand-gray border-t border-white/10 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-0 max-w-screen-xl mx-auto">
        <NavLink href="/" label="All" exact />
        <NavLink href="/scores" label="Scores" />
        {ALL_SPORTS.map((sport) => (
          <NavLink
            key={sport}
            href={`/sports/${SPORT_SLUG[sport]}`}
            label={sport}
          />
        ))}
        <NavLink href="/athletes" label="Athletes" />
        <NavLink href="/schools" label="Schools" />
      </div>
    </nav>
  );
}

function NavLink({ href, label, exact = false }: { href: string; label: string; exact?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex-shrink-0 text-white/60 hover:text-white text-[11px] font-bold uppercase tracking-widest px-3 py-2.5 border-b-2 border-transparent hover:border-brand-red transition-all whitespace-nowrap"
      )}
    >
      {label}
    </Link>
  );
}
