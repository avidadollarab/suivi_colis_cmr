"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiAdminColis } from "@/data/api";

const LABELS: Record<string, string> = {
  RAMASSE: "Ramassé",
  EN_CONTENEUR: "En conteneur",
  PARTI: "Parti",
  ARRIVE: "Arrivé",
  LIVRE: "Livré",
};

const COULEURS: Record<string, string> = {
  RAMASSE: "bg-amber-100 text-amber-800 border-amber-200",
  EN_CONTENEUR: "bg-blue-100 text-blue-800 border-blue-200",
  PARTI: "bg-purple-100 text-purple-800 border-purple-200",
  ARRIVE: "bg-teal-100 text-teal-800 border-teal-200",
  LIVRE: "bg-green-100 text-green-800 border-green-200",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    colis: Array<{
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

  useEffect(() => {
    apiAdminColis()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Ramassés" value={stats.ramasse} color="amber" />
        <StatCard label="En conteneur" value={stats.en_conteneur} color="blue" />
        <StatCard label="Partis" value={stats.parti} color="purple" />
        <StatCard label="Arrivés" value={stats.arrive} color="teal" />
        <StatCard label="Livrés" value={stats.livre} color="green" />
      </div>

      {stats.non_paye > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-amber-800">
          {stats.non_paye} colis non payé(s)
        </div>
      )}

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
                    {c.client_prenom} {c.client_nom}
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
}: {
  label: string;
  value: number;
  color?: string;
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

  return (
    <div className={`rounded-xl border-2 p-4 ${colorClass}`}>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </div>
  );
}
