/**
 * Client API pour le backend Flask - ELISÉE XPRESS LOG
 */

import type { Shipment } from "./mockShipments";

const API_BASE =
  (typeof process !== "undefined" && (process as NodeJS.Process).env?.NEXT_PUBLIC_API_URL) ||
  "https://suivi-colis-cmr.onrender.com";

const TOKEN_KEY = "elisee_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (token) (h as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  return h;
}

export async function apiLogin(identifiant: string, motDePasse: string) {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifiant, mot_de_passe: motDePasse }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur connexion");
  return data;
}

export async function apiLogout() {
  const token = getToken();
  if (token) {
    await fetch(`${API_BASE}/api/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    clearToken();
  }
}

export async function apiAdminMe() {
  const res = await fetch(`${API_BASE}/api/admin/me`, { headers: authHeaders() });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Erreur");
  return (await res.json()).agent;
}

export async function apiAdminColis() {
  const res = await fetch(`${API_BASE}/api/admin/colis`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("Non autorisé");
  if (!res.ok) throw new Error("Erreur");
  return res.json();
}

export async function apiAdminColisDetail(numero: string) {
  const res = await fetch(`${API_BASE}/api/admin/colis/${encodeURIComponent(numero)}`, {
    headers: authHeaders(),
  });
  if (res.status === 401) throw new Error("Non autorisé");
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Erreur");
  return res.json();
}

export async function apiAdminColisCreate(data: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/admin/colis`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Erreur");
  return json;
}

export async function apiAdminColisStatut(numero: string, statut: string, commentaire?: string) {
  const res = await fetch(`${API_BASE}/api/admin/colis/${encodeURIComponent(numero)}/statut`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ statut, commentaire }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Erreur");
  return json;
}

export async function apiAdminColisPaiement(numero: string) {
  const res = await fetch(`${API_BASE}/api/admin/colis/${encodeURIComponent(numero)}/paiement`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erreur");
  return res.json();
}

export async function apiAdminClients(query?: string) {
  const url = query
    ? `${API_BASE}/api/admin/clients?query=${encodeURIComponent(query)}`
    : `${API_BASE}/api/admin/clients`;
  const res = await fetch(url, { headers: authHeaders() });
  if (res.status === 401) throw new Error("Non autorisé");
  if (!res.ok) throw new Error("Erreur");
  return (await res.json()).clients;
}

export async function apiAdminDestinataires() {
  const res = await fetch(`${API_BASE}/api/admin/destinataires`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("Non autorisé");
  if (!res.ok) throw new Error("Erreur");
  return (await res.json()).destinataires;
}

const FRONTEND_URL =
  (typeof process !== "undefined" && (process as NodeJS.Process).env?.NEXT_PUBLIC_APP_URL) ||
  "https://elisee-xpress-frontend.onrender.com";

/** URL du frontend pour les liens track/QR */
export function getTrackUrl(numero: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : FRONTEND_URL;
  return `${base}/track/${encodeURIComponent(numero.trim().toUpperCase())}`;
}

export async function apiClient(clientId: number) {
  const res = await fetch(`${API_BASE}/api/client/${clientId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Erreur");
  return res.json();
}

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
