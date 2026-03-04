/**
 * Données mock pour le suivi de colis - ELISÉE XPRESS LOG
 * À remplacer par des appels API réels (Flask backend) plus tard
 */

export interface TrackingEvent {
  id: string;
  statut: string;
  label: string;
  date: string;
  heure: string;
  lieu?: string;
  message: string;
  completed: boolean;
}

export interface Shipment {
  numero_suivi: string;
  description: string;
  statut: string;
  statut_label: string;
  poids_kg: number;
  nombre_pieces: number;
  date_creation: string;
  date_ramassage?: string;
  date_conteneur?: string;
  date_depart?: string;
  date_arrivee?: string;
  date_livraison?: string;
  eta?: string;
  client_nom: string;
  client_prenom: string;
  dest_ville: string;
  dest_quartier?: string;
  historique: TrackingEvent[];
}

const STATUTS_ORDER = ["RAMASSE", "EN_CONTENEUR", "PARTI", "ARRIVE", "LIVRE"];

function buildHistorique(
  dates: Partial<Record<string, string>>,
  destVille?: string
): TrackingEvent[] {
  const events: TrackingEvent[] = [];
  const now = new Date().toISOString().split("T")[0];
  const time = "14:30";

  if (dates.date_ramassage) {
    events.push({
      id: "1",
      statut: "RAMASSE",
      label: "Ramassé en Europe",
      date: dates.date_ramassage,
      heure: "10:15",
      lieu: "Ettenheim, Allemagne",
      message: "Colis ramassé et enregistré",
      completed: true,
    });
  }
  if (dates.date_conteneur) {
    events.push({
      id: "2",
      statut: "EN_CONTENEUR",
      label: "Déposé au conteneur",
      date: dates.date_conteneur,
      heure: "09:00",
      lieu: "Le Havre",
      message: "Colis chargé dans le conteneur",
      completed: true,
    });
  }
  if (dates.date_depart) {
    events.push({
      id: "3",
      statut: "PARTI",
      label: "Parti de France",
      date: dates.date_depart,
      heure: "08:00",
      lieu: "Port du Havre",
      message: "Conteneur en transit maritime",
      completed: true,
    });
  }
  if (dates.date_arrivee) {
    events.push({
      id: "4",
      statut: "ARRIVE",
      label: "Arrivé à destination",
      date: dates.date_arrivee,
      heure: "16:45",
      lieu: "Douala",
      message: "Colis débarqué, en attente de livraison",
      completed: true,
    });
  }
  if (dates.date_livraison) {
    events.push({
      id: "5",
      statut: "LIVRE",
      label: "Livré",
      date: dates.date_livraison,
      heure: "11:20",
      lieu: destVille || "Douala",
      message: "Colis livré au destinataire",
      completed: true,
    });
  }

  // Si pas encore livré, ajouter l'étape en cours
  const lastStatut = events[events.length - 1]?.statut || "RAMASSE";
  const nextIndex = STATUTS_ORDER.indexOf(lastStatut) + 1;
  if (nextIndex < STATUTS_ORDER.length) {
    const nextStatut = STATUTS_ORDER[nextIndex];
    const labels: Record<string, string> = {
      EN_CONTENEUR: "En attente de chargement",
      PARTI: "En transit maritime",
      ARRIVE: "En attente de livraison",
      LIVRE: "Livraison prévue",
    };
    events.push({
      id: String(events.length + 1),
      statut: nextStatut,
      label: labels[nextStatut] || nextStatut,
      date: now,
      heure: "--",
      message: "En cours de traitement",
      completed: false,
    });
  }

  return events;
}

export const MOCK_SHIPMENTS: Record<string, Shipment> = {
  EXL2026001: {
    numero_suivi: "EXL2026001",
    description: "Colis personnel - vêtements et livres",
    statut: "ARRIVE",
    statut_label: "Arrivé à destination",
    poids_kg: 12.5,
    nombre_pieces: 2,
    date_creation: "2026-01-15",
    date_ramassage: "2026-01-18",
    date_conteneur: "2026-01-25",
    date_depart: "2026-02-01",
    date_arrivee: "2026-02-28",
    eta: "2026-03-05",
    client_nom: "Dupont",
    client_prenom: "Marie",
    dest_ville: "Douala",
    dest_quartier: "Akwa",
    historique: buildHistorique(
      {
        date_ramassage: "2026-01-18",
        date_conteneur: "2026-01-25",
        date_depart: "2026-02-01",
        date_arrivee: "2026-02-28",
      },
      "Douala"
    ),
  },
  EXL2026002: {
    numero_suivi: "EXL2026002",
    description: "Électroménager - TV 55 pouces",
    statut: "LIVRE",
    statut_label: "Livré",
    poids_kg: 25,
    nombre_pieces: 1,
    date_creation: "2026-01-20",
    date_ramassage: "2026-01-22",
    date_conteneur: "2026-01-28",
    date_depart: "2026-02-05",
    date_arrivee: "2026-03-01",
    date_livraison: "2026-03-03",
    client_nom: "Mbarga",
    client_prenom: "Jean",
    dest_ville: "Yaoundé",
    dest_quartier: "Bastos",
    historique: buildHistorique(
      {
        date_ramassage: "2026-01-22",
        date_conteneur: "2026-01-28",
        date_depart: "2026-02-05",
        date_arrivee: "2026-03-01",
        date_livraison: "2026-03-03",
      },
      "Yaoundé"
    ),
  },
  EXL2026003: {
    numero_suivi: "EXL2026003",
    description: "Fût 220L - pièces automobiles",
    statut: "PARTI",
    statut_label: "Parti de France",
    poids_kg: 220,
    nombre_pieces: 1,
    date_creation: "2026-02-10",
    date_ramassage: "2026-02-12",
    date_conteneur: "2026-02-15",
    date_depart: "2026-02-20",
    eta: "2026-03-25",
    client_nom: "Ngo",
    client_prenom: "Paul",
    dest_ville: "Douala",
    historique: buildHistorique(
      {
        date_ramassage: "2026-02-12",
        date_conteneur: "2026-02-15",
        date_depart: "2026-02-20",
      },
      "Douala"
    ),
  },
  EXL2026004: {
    numero_suivi: "EXL2026004",
    description: "Colis carton - documents",
    statut: "RAMASSE",
    statut_label: "Ramassé",
    poids_kg: 2.5,
    nombre_pieces: 1,
    date_creation: "2026-03-01",
    date_ramassage: "2026-03-02",
    eta: "2026-04-15",
    client_nom: "Fotso",
    client_prenom: "Claire",
    dest_ville: "Bafoussam",
    historique: buildHistorique(
      { date_ramassage: "2026-03-02" },
      "Bafoussam"
    ),
  },
};

export function getShipmentByNumber(numero: string): Shipment | null {
  const normalized = numero.trim().toUpperCase();
  return MOCK_SHIPMENTS[normalized] || null;
}
