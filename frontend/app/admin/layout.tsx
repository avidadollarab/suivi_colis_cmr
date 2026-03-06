"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getToken, apiAdminMe, apiLogout } from "@/data/api";
import { Logo } from "@/components/Logo";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [agent, setAgent] = useState<{ nom: string } | null>(null);
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    apiAdminMe()
      .then((a) => {
        setAgent(a || null);
        if (!a) router.replace("/admin/login");
      })
      .catch(() => router.replace("/admin/login"))
      .finally(() => setChecking(false));
  }, [isLoginPage, router, pathname]);

  const handleLogout = async () => {
    await apiLogout();
    router.replace("/admin/login");
    router.refresh();
  };

  if (isLoginPage) return <>{children}</>;
  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin" className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-primary font-bold hidden sm:inline">Admin</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/admin"
                className={`font-medium ${pathname === "/admin" ? "text-primary" : "text-gray-600 hover:text-primary"}`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/colis/nouveau"
                className={`font-medium ${pathname === "/admin/colis/nouveau" ? "text-primary" : "text-gray-600 hover:text-primary"}`}
              >
                Nouveau colis
              </Link>
              <Link
                href="/admin/clients"
                className={`font-medium ${pathname === "/admin/clients" ? "text-primary" : "text-gray-600 hover:text-primary"}`}
              >
                Clients
              </Link>
              <Link href="/" className="text-gray-600 hover:text-primary text-sm">
                Site public
              </Link>
              <span className="text-gray-500 text-sm hidden sm:inline">{agent?.nom}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Déconnexion
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 max-w-6xl py-8">{children}</main>
    </div>
  );
}
