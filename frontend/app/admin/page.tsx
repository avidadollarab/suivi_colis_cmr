"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiAdminColis, apiAdminReportsDownload } from "@/data/api";
import { AdminClientSearchCompact } from "@/components/AdminClientSearchCompact";

const LABELS: Record<string, string> = {
  RAMASSE: "Ramassé",
  EN_CONTENEUR: "En conteneur",
  PARTI: "Parti",
  ARRIVE: "Arrivé",
  LIVRE: "Livré",
};

const STATUT_KEYS = ["RAMASSE", "EN_CONTENEUR", "PARTI", "ARRIVE", "LIVRE"] as const;

const COULEURS: Record<string, string> = {
  RAMASSE: "bg-amber-100 text-amber-800 border-amber-200",
  EN_CONTENEUR: "bg-blue-100 text-blue-800 border-blue-200",
  PARTI: "bg-purple-100 text-purple-800 border-purple-200",
  ARRIVE: "bg-teal-100 text-teal-800 border-teal-200",
  LIVRE: "bg-green-100 text-green-800 border-green-200",
};

const STAT_CARD_COLORS: Record<string, string> = {
  RAMASSE: "amber",
  EN_CONTENEUR: "blue",
  PARTI: "purple",
  ARRIVE: "teal",
  LIVRE: "green",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    colis: Array<{
      id_client?: number;
      numero_suivi: string;
      statut: string;
      description: string;
      client_nom: string;
      client_prenom: string;
      dest_ville: string;
      date_creation: string;
      est_paye: boolean;
    }>;
    stats: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const debouncedQuery = useDebounce(searchQuery, 400);

  const load = useCallback(() => {
    setLoading(true);
    apiAdminColis({
      query: debouncedQuery || undefined,
      status: statusFilter || undefined,
    })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, [debouncedQuery, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Export / Bilan
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exportType, setExportType] = useState<"list" | "summary">("list");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const handleExport = async () => {
    if (!exportFrom || !exportTo) {
      setExportError("Veuillez renseigner les deux dates.");
      return;
    }
    setExporting(true);
    setExportError("");
    try {
      const blob = await apiAdminReportsDownload({
        from: exportFrom,
        to: exportTo,
        type: exportType,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ELISEE_XPRESS_LOG_rapport_colis_${exportFrom.replace(/-/g, "")}_${exportTo.replace(/-/g, "")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setExporting(false);
    }
  };

  if (loading && !data) {
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

  const { colis, stats } = data;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary">Tableau de bord</h1>
        <Link
          href="/admin/colis/nouveau"
          className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition"
        >
          + Nouveau colis
        </Link>
      </div>

      {/* Barre de recherche colis */}
      <div className="mb-6">
        <input
          type="search"
          placeholder="Rechercher un colis (nom client, téléphone ou numéro de suivi)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary outline-none"
        />
      </div>

      {/* Recherche clients fidèles */}
      <div className="mb-6">
        <AdminClientSearchCompact />
      </div>

      {/* Boîtes de synthèse cliquables — grille symétrique */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 min-h-[100px]">
        <StatCard
          label="Total"
          value={stats.total}
          onClick={() => setStatusFilter(null)}
          active={!statusFilter}
          clickable
        />
        {STATUT_KEYS.map((statut) => (
          <StatCard
            key={statut}
            label={LABELS[statut]}
            value={stats[statut.toLowerCase()] ?? 0}
            color={STAT_CARD_COLORS[statut]}
            onClick={() => setStatusFilter(statusFilter === statut ? null : statut)}
            active={statusFilter === statut}
            clickable
          />
        ))}
      </div>
      {statusFilter && (
        <div className="mb-4">
          <button
            onClick={() => setStatusFilter(null)}
            className="px-4 py-2 text-sm font-medium text-primary border-2 border-primary rounded-xl hover:bg-primary/5"
          >
            Tous les colis
          </button>
        </div>
      )}

      {stats.non_paye > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-amber-800">
          {stats.non_paye} colis non payé(s)
        </div>
      )}

      {/* Export / Bilan */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-primary mb-4">Export / Bilan</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              value={exportFrom}
              onChange={(e) => setExportFrom(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input
              type="date"
              value={exportTo}
              onChange={(e) => setExportTo(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de rapport</label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as "list" | "summary")}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary outline-none"
            >
              <option value="list">Liste des colis</option>
              <option value="summary">Résumé par statut</option>
              {/* Résumé financier : commenter si pas de montants */}
              {/* <option value="financial">Résumé financier</option> */}
            </select>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50"
          >
            {exporting ? "Téléchargement..." : "Télécharger"}
          </button>
        </div>
        {exportError && (
          <p className="mt-2 text-sm text-red-600">{exportError}</p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">N° Suivi</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Destination</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Statut</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Paiement</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {colis.map((c) => (
                <tr key={c.numero_suivi} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/colis/${c.numero_suivi}`}
                      className="font-mono font-bold text-primary hover:underline"
                    >
                      {c.numero_suivi}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {c.id_client ? (
                      <Link
                        href={`/client/${c.id_client}`}
                        className="hover:text-primary hover:underline"
                      >
                        {c.client_prenom} {c.client_nom}
                      </Link>
                    ) : (
                      `${c.client_prenom} ${c.client_nom}`
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.dest_ville}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium border ${
                        COULEURS[c.statut] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {LABELS[c.statut] || c.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.est_paye ? (
                      <span className="text-green-600 font-medium">Payé</span>
                    ) : (
                      <span className="text-red-600 text-sm">Non payé</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/colis/${c.numero_suivi}/modifier`}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        Modifier
                      </Link>
                      <Link
                        href={`/admin/colis/${c.numero_suivi}`}
                        className="text-sm text-gray-600 hover:underline"
                      >
                        Détail
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  onClick,
  active,
  clickable,
}: {
  label: string;
  value: number;
  color?: string;
  onClick?: () => void;
  active?: boolean;
  clickable?: boolean;
}) {
  const colorClass =
    color === "amber"
      ? "border-amber-200 bg-amber-50"
      : color === "blue"
      ? "border-blue-200 bg-blue-50"
      : color === "purple"
      ? "border-purple-200 bg-purple-50"
      : color === "teal"
      ? "border-teal-200 bg-teal-50"
      : color === "green"
      ? "border-green-200 bg-green-50"
      : "border-gray-200 bg-gray-50";

  const activeClass = active ? "ring-2 ring-primary ring-offset-2" : "";
  const cursorClass = clickable ? "cursor-pointer hover:opacity-90" : "";

  const content = (
    <>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </>
  );

  const baseClass = `rounded-xl border-2 p-4 text-left min-h-[88px] flex flex-col justify-center transition ${colorClass}`;
  if (clickable && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClass} ${activeClass} ${cursorClass}`}
      >
        {content}
      </button>
    );
  }
  return <div className={baseClass}>{content}</div>;
}
