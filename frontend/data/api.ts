/**
 * Client API pour le backend Flask - ELISÉE XPRESS LOG
 */

import type { Shipment } from "./mockShipments";

const API_BASE =
  (typeof process !== "undefined" && (process as NodeJS.Process).env?.NEXT_PUBLIC_API_URL) ||
  "https://suivi-colis-cmr.onrender.com";

export async function fetchShipmentByNumber(
  numero: string
): Promise<Shipment | null> {
  const normalized = numero.trim().toUpperCase();
  const url = `${API_BASE}/api/suivi/${encodeURIComponent(normalized)}`;

  try {
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    return {
      numero_suivi: data.numero_suivi,
      description: data.description || "",
      statut: data.statut || "RAMASSE",
      statut_label: data.statut_label || data.statut,
      poids_kg: data.poids_kg ?? 0,
      nombre_pieces: data.nombre_pieces ?? 1,
      date_creation: data.date_creation || "",
      date_ramassage: data.date_ramassage,
      date_conteneur: data.date_conteneur,
      date_depart: data.date_depart,
      date_arrivee: data.date_arrivee,
      date_livraison: data.date_livraison,
      eta: data.eta,
      client_nom: data.client_nom || "",
      client_prenom: data.client_prenom || "",
      dest_ville: data.dest_ville || "",
      dest_quartier: data.dest_quartier,
      historique: (data.historique || []).map((h: Record<string, unknown>) => ({
        id: String(h.id),
        statut: String(h.statut),
        label: String(h.label),
        date: String(h.date),
        heure: String(h.heure),
        lieu: h.lieu ? String(h.lieu) : undefined,
        message: String(h.message || ""),
        completed: Boolean(h.completed),
      })),
    };
  } catch {
    return null;
  }
}
