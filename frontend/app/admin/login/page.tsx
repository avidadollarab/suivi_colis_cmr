"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiLogin, setToken } from "@/data/api";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifiant, setIdentifiant] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);
    try {
      const data = await apiLogin(identifiant, motDePasse);
      setToken(data.token);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-primary/5 to-white py-16">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <Logo size="md" />
            </Link>
            <h1 className="text-xl font-bold text-primary mt-6">Administration</h1>
            <p className="text-gray-600 text-sm mt-1">Connectez-vous pour gérer les colis</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {erreur && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {erreur}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant</label>
              <input
                type="text"
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link href="/" className="text-primary hover:underline">Retour à l&apos;accueil</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
