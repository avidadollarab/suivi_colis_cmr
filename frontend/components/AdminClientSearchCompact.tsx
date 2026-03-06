"use client";

/**
 * Recherche clients fidèles — version compacte pour le dashboard admin.
 * Interroge /api/admin/clients?query=... (table clients).
 * Debounce 300 ms. Affiche les résultats (nom, téléphone, pays).
 */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiAdminClients } from "@/data/api";

const DEBOUNCE_MS = 300;

export function AdminClientSearchCompact() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [clients, setClients] = useState<Array<{ id: number; nom: string; prenom: string; telephone: string; pays_europe?: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const fetchClients = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setClients([]);
      return;
    }
    setLoading(true);
    try {
      const list = await apiAdminClients(q);
      setClients(Array.isArray(list) ? list : []);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients(debouncedQuery);
  }, [debouncedQuery, fetchClients]);

  const showResults = debouncedQuery.length >= 2;

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un client fidèle (Julienne, Michel, Germain…)"
        className="w-full max-w-md px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary outline-none"
        aria-label="Rechercher un client"
      />
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 max-w-2xl bg-white rounded-xl border-2 border-gray-200 shadow-lg z-20 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-6 flex justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : clients.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">Aucun client trouvé.</div>
          ) : (
            <ul className="py-2">
              {clients.map((c) => (
                <li key={c.id} className="border-b border-gray-100 last:border-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50">
                    <div>
                      <span className="font-semibold text-primary">
                        {String(c.prenom || "")} {String(c.nom || "")}
                      </span>
                      <span className="text-gray-600 text-sm ml-2">{c.telephone}</span>
                      {c.pays_europe && (
                        <span className="text-gray-500 text-sm ml-2">· {c.pays_europe}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/client/${c.id}`}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Fiche
                      </Link>
                      <Link
                        href={`/admin/colis/nouveau?client_id=${c.id}`}
                        className="text-sm text-green-600 hover:underline font-medium"
                      >
                        Nouveau colis
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
