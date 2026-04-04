"use client";

import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function WartaHeader() {
  const today = format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/#berita", label: "Berita" },
    { href: "/#tentang", label: "Tentang" },
    { href: "/#kontak", label: "Kontak" },
    { href: "/news", label: "Semua Berita" },
  ];

  return (
    <header className="w-full border-b border-black/10 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          <Link
            href="/"
            className="text-xl md:text-3xl font-black font-headline tracking-tighter text-black"
          >
            WARTA HARUM
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.7rem] font-bold tracking-widest uppercase hover:text-black/60 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-[0.6rem] font-bold uppercase tracking-tighter leading-none capitalize">
              {today}
            </p>
          </div>
          <Search className="w-5 h-5 text-black cursor-pointer hover:text-black/60 transition-colors hidden sm:block" />
          <button
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            className="md:hidden w-9 h-9 flex items-center justify-center -mr-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile slide-down nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/5 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3 px-3 text-[0.75rem] font-bold tracking-widest uppercase hover:bg-neutral-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-black/5 mt-2 pt-3 px-3">
              <p className="text-[0.6rem] font-bold uppercase tracking-tighter text-neutral-400 capitalize">
                {today}
              </p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
