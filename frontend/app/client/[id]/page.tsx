"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/data/api";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";

const LABELS: Record<string, string> = {
  RAMASSE: "Ramassé",
  EN_CONTENEUR: "En conteneur",
  PARTI: "Parti",
  ARRIVE: "Arrivé",
  LIVRE: "Livré",
};

const COULEURS: Record<string, string> = {
  RAMASSE: "bg-amber-100 text-amber-800",
  EN_CONTENEUR: "bg-blue-100 text-blue-800",
  PARTI: "bg-purple-100 text-purple-800",
  ARRIVE: "bg-teal-100 text-teal-800",
  LIVRE: "bg-green-100 text-green-800",
};

export default function FicheClientPage() {
  const params = useParams();
  const clientId = parseInt(String(params.id || "0"), 10);
  const [data, setData] = useState<{
    client: Record<string, unknown>;
    colis: Array<Record<string, unknown>>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    apiClient(clientId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-700">{error || "Client introuvable"}</p>
          <Link href="/" className="mt-4 inline-block">
            <Button variant="primary">Retour à l&apos;accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { client, colis } = data;
  const nbLivres = colis.filter((c) => c.statut === "LIVRE").length;
  const nbEnCours = colis.length - nbLivres;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Logo size="sm" />
            </Link>
            <Link href="/" className="text-sm text-primary font-medium">
              ← Accueil
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-2xl py-8">
        <h1 className="text-xl font-bold text-primary mb-6">📋 Fiche client</h1>

        <div
          className="rounded-2xl p-6 mb-8 text-white"
          style={{ background: "linear-gradient(135deg, #0D1B3E, #1a3a6b)" }}
        >
          <div
            className="w-14 h-14 rounded-full bg-gold text-primary font-bold text-xl flex items-center justify-center mb-4"
          >
            {String(client.prenom || "").charAt(0)}
            {String(client.nom || "").charAt(0)}
          </div>
          <div className="text-xl font-bold">
            {String(client.prenom || "")} {String(client.nom || "")}
          </div>
          <div className="text-white/70 text-sm mt-2 space-y-1">
            <p>📱 {String(client.telephone || "")}</p>
            {client.email != null && client.email !== "" && <p>✉️ {String(client.email)}</p>}
            {(client.adresse_europe != null && client.adresse_europe !== "") || (client.ville_europe != null && client.ville_europe !== "") ? (
              <p>📍 {[client.adresse_europe, client.ville_europe].filter((x) => x != null && x !== "").map(String).join(", ")}</p>
            ) : null}
          </div>
          <div className="flex gap-6 mt-6 pt-4 border-t border-white/20">
            <div>
              <div className="text-2xl font-bold text-gold">{colis.length}</div>
              <div className="text-xs text-white/60 uppercase">Colis total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gold">{nbLivres}</div>
              <div className="text-xs text-white/60 uppercase">Livrés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gold">{nbEnCours}</div>
              <div className="text-xs text-white/60 uppercase">En cours</div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-primary mb-4">📦 Historique des colis</h2>

        {colis.length > 0 ? (
          <div className="space-y-3">
            {colis.map((c) => (
              <Link
                key={String(c.numero_suivi)}
                href={`/track/${c.numero_suivi}`}
                className={`block bg-white rounded-xl border-2 p-4 hover:border-gold transition ${
                  c.statut === "LIVRE" ? "border-l-4 border-l-green-500" : "border-l-4 border-l-blue-500"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-mono font-bold text-primary">{String(c.numero_suivi)}</div>
                    <div className="font-semibold text-gray-900 mt-1">{String(c.description || "")}</div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      📍 {String(c.dest_prenom || "")} {String(c.dest_nom || "")} · {String(c.dest_ville || "")}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Créé le {String((c.date_creation || "").toString().slice(0, 10))}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      COULEURS[String(c.statut || "")] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {LABELS[String(c.statut || "")] || String(c.statut)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-100">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-600">Aucun colis enregistré pour ce client.</p>
          </div>
        )}

        <div className="mt-8">
          <Link href={`/admin/colis/nouveau?client_id=${clientId}`}>
            <Button variant="primary" size="lg">
              ➕ Nouveau colis pour ce client
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
