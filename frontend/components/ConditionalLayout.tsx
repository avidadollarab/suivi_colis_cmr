"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChatbotWidget } from "./ChatbotWidget";
import { clearToken } from "@/data/api";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // Option stricte : dès qu'on quitte la section admin, on détruit la session.
  // Ainsi, si on revient sur /admin, il faut re-saisir le mot de passe.
  useEffect(() => {
    if (pathname && !pathname.startsWith("/admin")) {
      clearToken();
    }
  }, [pathname]);
  const isTrack = pathname?.startsWith("/track");
  const isClient = pathname?.startsWith("/client");

  if (isAdmin || isTrack || isClient) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatbotWidget />
    </>
  );
}
