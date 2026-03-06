"use client";

/**
 * AdminClientSearch — Recherche de clients (nom, téléphone).
 * Paramètres : DEBOUNCE_MS (délai avant appel API, défaut 300ms).
 * Limite résultats : 50 (côté backend, voir database.rechercher_clients).
 */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiAdminClients } from "@/data/api";
import { IconPhone, IconLocation } from "@/components/icons";

const DEBOUNCE_MS = 300;

export interface ClientRecord {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  ville_europe?: string;
  pays_europe?: string;
}

export function AdminClientSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debounce : attendre DEBOUNCE_MS avant d'envoyer la requête
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const fetchClients = useCallback(async (q: string) => {
    setLoading(true);
    setError("");
    try {
      const list = await apiAdminClients(q || undefined);
      setClients(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients(debouncedQuery);
  }, [debouncedQuery, fetchClients]);

  return (
    <div className="space-y-6">
      <div className="w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un client (nom ou téléphone)"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-base"
          aria-label="Rechercher un client"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-600">
          Aucun client trouvé pour cette recherche.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-primary/30 transition"
            >
              <div className="font-semibold text-primary">
                {String(c.prenom || "")} {String(c.nom || "")}
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <IconPhone size={14} strokeWidth={2} className="shrink-0" />
                {String(c.telephone || "")}
              </div>
              {(c.ville_europe || c.pays_europe) && (
                <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
                  <IconLocation size={14} strokeWidth={2} className="shrink-0" />
                  {[c.ville_europe, c.pays_europe].filter(Boolean).join(", ")}
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/client/${c.id}`}
                  className="flex-1 text-center py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition"
                >
                  Voir les colis
                </Link>
                <Link
                  href={`/admin/colis/nouveau?client_id=${c.id}`}
                  className="flex-1 text-center py-2 rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition"
                >
                  Nouvel envoi
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
