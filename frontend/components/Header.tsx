"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Services" },
  { href: "/network", label: "Réseau" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div
        role="banner"
        className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Logo size="sm" />

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-gray-600 hover:text-primary font-medium rounded-lg hover:bg-primary/5 transition-smooth"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/#suivi"
                className="ml-2 px-5 py-2.5 bg-gold hover:bg-gold-dark text-white font-semibold rounded-xl transition-smooth shadow-md hover:shadow-lg"
              >
                Suivre un colis
              </Link>
            </nav>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {mobileOpen && (
            <nav className="md:hidden py-4 border-t border-gray-200 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-gray-600 hover:text-primary font-medium rounded-lg hover:bg-primary/5"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/#suivi"
                onClick={() => setMobileOpen(false)}
                className="mx-4 mt-2 px-5 py-3 bg-gold hover:bg-gold-dark text-white font-semibold rounded-xl text-center"
              >
                Suivre un colis
              </Link>
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
