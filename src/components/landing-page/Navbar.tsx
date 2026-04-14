"use client";

import { useEffect, useState } from "react";
import GetStartedCta from "@/components/landing-page/GetStartedCta";

const links = [
  { label: "Features", target: "features" },
  { label: "How it Works", target: "how-it-works" },
];

const handleScrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

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
        <button
          onClick={() => handleScrollTo("hero")}
          className="text-lg font-semibold tracking-tight text-[#1A1A1A]"
        >
          TeamSync
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-4 md:flex">
          {links.map((link) => (
            <button
              key={link.target}
              onClick={() => handleScrollTo(link.target)}
              className="text-sm font-medium text-[#494949] transition hover:text-[#656D3F]"
            >
              {link.label}
            </button>
          ))}

          <GetStartedCta />
        </nav>

        {/* Mobile Button */}
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

      {/* Mobile Menu */}
      <div
        className={`md:hidden ${
          menuOpen ? "block" : "hidden"
        } border-t border-white/80 bg-white/95 backdrop-blur-xl`}
      >
        <div className="space-y-2 px-5 pb-6 pt-4">
          {links.map((link) => (
            <button
              key={link.target}
              onClick={() => {
                handleScrollTo(link.target);
                setMenuOpen(false);
              }}
              className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#494949] transition hover:bg-[#EEF1E3]"
            >
              {link.label}
            </button>
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