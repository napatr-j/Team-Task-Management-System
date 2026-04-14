"use client";

import { useEffect, useState } from "react";
import GetStartedCta from "@/components/landing-page/GetStartedCta";

const links = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-500 ${
        isScrolled
          ? "border-white/80 bg-white/85 shadow-sm shadow-slate-900/5 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a
          href="#hero"
          className="text-lg font-semibold tracking-tight text-[#1A1A1A]"
        >
          TeamSync
        </a>

        <nav className="hidden items-center gap-4 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#494949] transition hover:text-[#656D3F]"
            >
              {link.label}
            </a>
          ))}

          <GetStartedCta />
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#1A1A1A] shadow-sm transition hover:border-[#84934A]/60 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div
        className={`md:hidden ${
          menuOpen ? "block" : "hidden"
        } border-t border-white/80 bg-white/95 backdrop-blur-xl`}
      >
        <div className="space-y-2 px-5 pb-6 pt-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-[#494949] transition hover:bg-[#EEF1E3]"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}

          <GetStartedCta
            className="block w-full rounded-full px-4 py-3 text-center text-sm font-semibold"
            onOpen={() => setMenuOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}