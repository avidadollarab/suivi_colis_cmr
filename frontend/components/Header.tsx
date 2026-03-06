"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Services" },
  { href: "/network", label: "Réseau" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

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
              {navLinks.map((link) => {
                const active = isActive(link.href, pathname);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      active
                        ? "text-primary font-bold bg-gold/15 border-b-2 border-gold"
                        : "text-gray-600 hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/tracking"
                className={`ml-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.97] ${
                  pathname === "/tracking"
                    ? "bg-gold-dark text-white ring-2 ring-gold"
                    : "bg-gold hover:bg-gold-dark text-white"
                }`}
              >
                Suivre un colis
              </Link>
              <Link
                href="/admin"
                className="ml-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary"
              >
                Admin
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
              {navLinks.map((link) => {
                const active = isActive(link.href, pathname);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-lg font-medium ${
                      active
                        ? "text-primary font-bold bg-gold/15 border-l-4 border-gold"
                        : "text-gray-600 hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/tracking"
                onClick={() => setMobileOpen(false)}
                className={`mx-4 mt-2 px-5 py-3 font-semibold rounded-xl text-center transition-all ${
                  pathname === "/tracking"
                    ? "bg-gold-dark text-white ring-2 ring-gold"
                    : "bg-gold hover:bg-gold-dark text-white"
                }`}
              >
                Suivre un colis
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="mx-4 mt-2 px-5 py-3 text-sm font-medium text-gray-600"
              >
                Admin
              </Link>
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
