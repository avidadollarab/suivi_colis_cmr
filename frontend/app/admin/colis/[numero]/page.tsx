"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  apiAdminColisDetail,
  apiAdminColisStatut,
  apiAdminColisPaiement,
} from "@/data/api";
import { Button } from "@/components/Button";

const LABELS: Record<string, string> = {
  RAMASSE: "Ramassé",
  EN_CONTENEUR: "En conteneur",
  PARTI: "Parti de France",
  ARRIVE: "Arrivé au Cameroun",
  LIVRE: "Livré",
};

const STATUTS = ["RAMASSE", "EN_CONTENEUR", "PARTI", "ARRIVE", "LIVRE"];

export default function DetailColisPage() {
  const params = useParams();
  const router = useRouter();
  const numero = String(params.numero || "");
  const [data, setData] = useState<{
    colis: Record<string, unknown>;
    historique: Array<Record<string, unknown>>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [nouveauStatut, setNouveauStatut] = useState("");
  const [commentaire, setCommentaire] = useState("");

  const load = () => {
    apiAdminColisDetail(numero)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [numero]);

  const handleStatut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauStatut) return;
    setUpdating(true);
    setError("");
    try {
      await apiAdminColisStatut(numero, nouveauStatut, commentaire || undefined);
      setNouveauStatut("");
      setCommentaire("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaiement = async () => {
    setUpdating(true);
    setError("");
    try {
      await apiAdminColisPaiement(numero);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { colis, historique } = data;
  const statut = String(colis.statut || "RAMASSE");
  const estPaye = Boolean(colis.est_paye);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-gray-600 hover:text-primary">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-primary font-mono">{numero}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/track/${numero}`}
            target="_blank"
            className="px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 text-sm"
          >
            📱 QR / Suivi
          </Link>
          <Link
            href={`/admin/colis/${numero}/etiquette`}
            className="px-4 py-2 bg-gold text-primary font-semibold rounded-xl hover:bg-gold-dark text-sm"
          >
            🖨 Étiquette
          </Link>
          {colis.id_client != null && Number(colis.id_client) > 0 && (
            <Link
              href={`/client/${colis.id_client}`}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 text-sm"
            >
              👤 Fiche client
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Client</h2>
          <p className="font-medium">
            {String(colis.client_prenom || "")} {String(colis.client_nom || "")}
          </p>
          <p className="text-gray-600 text-sm">{String(colis.client_tel || "")}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-primary mb-4">Destinataire</h2>
          <p className="font-medium">
            {String(colis.dest_prenom || "")} {String(colis.dest_nom || "")}
          </p>
          <p className="text-gray-600 text-sm">
            {String(colis.dest_ville || "")}
            {colis.dest_quartier ? `, ${String(colis.dest_quartier)}` : ""}
          </p>
          <p className="text-gray-600 text-sm">{String(colis.dest_tel || "")}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-gray-600">{String(colis.description || "")}</p>
            <p className="text-sm text-gray-500 mt-1">
              {colis.poids_kg != null && `${String(colis.poids_kg)} kg`}
              {colis.prix_total != null && ` • ${String(colis.prix_total)} €`}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                statut === "LIVRE"
                  ? "bg-green-100 text-green-800"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {LABELS[statut] || statut}
            </span>
            {!estPaye && (
              <Button
                variant="primary"
                size="sm"
                onClick={handlePaiement}
                disabled={updating}
              >
                Marquer payé
              </Button>
            )}
            {estPaye && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                Payé
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleStatut} className="flex flex-wrap gap-3 items-end pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Changer statut</label>
            <select
              value={nouveauStatut}
              onChange={(e) => setNouveauStatut(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary outline-none"
            >
              <option value="">Sélectionner</option>
              {STATUTS.map((s) => (
                <option key={s} value={s}>
                  {LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
            <input
              type="text"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Optionnel"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary outline-none"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={!nouveauStatut || updating}
          >
            {updating ? "..." : "Mettre à jour"}
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-primary mb-4">Historique</h2>
        <div className="space-y-3">
          {historique.map((h, i) => (
            <div
              key={String(h.id || i)}
              className="flex gap-4 items-start py-2 border-b border-gray-100 last:border-0"
            >
              <div className="w-20 text-sm text-gray-500 shrink-0">
                {String(h.date || "")} {String(h.heure || "")}
              </div>
              <div>
                <span className="font-medium text-primary">{String(h.label || "")}</span>
                {h.message != null && h.message !== "" && (
                  <p className="text-sm text-gray-600 mt-0.5">{String(h.message)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
