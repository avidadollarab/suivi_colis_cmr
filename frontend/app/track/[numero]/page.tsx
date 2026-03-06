"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchShipmentByNumber, apiAdminMe, apiAdminColisStatut, getToken } from "@/data/api";
import type { Shipment } from "@/data/mockShipments";
import { TrackingResult } from "@/components/TrackingResult";
import { SearchAgainButton } from "@/components/SearchAgainButton";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { StatusIcon } from "@/components/StatusIcon";
import { IconUser } from "@/components/icons";
import type { ShipmentStatus } from "@/components/StatusIcon";

const LABELS: Record<string, string> = {
  RAMASSE: "Ramassé",
  EN_CONTENEUR: "En conteneur",
  PARTI: "Parti de France",
  ARRIVE: "Arrivé au Cameroun",
  LIVRE: "Livré",
};

const STATUTS: { code: ShipmentStatus; label: string }[] = [
  { code: "RAMASSE", label: "Ramassé" },
  { code: "EN_CONTENEUR", label: "En conteneur" },
  { code: "PARTI", label: "Parti" },
  { code: "ARRIVE", label: "Arrivé Douala" },
  { code: "LIVRE", label: "Livré" },
];

export default function TrackPage() {
  const params = useParams();
  const numero = String(params.numero || "").trim().toUpperCase();
  const [shipment, setShipment] = useState<Shipment | null | "loading">("loading");
  const [agent, setAgent] = useState<{ nom: string } | null>(null);
  const [selectedStatut, setSelectedStatut] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!numero) {
      setShipment(null);
      return;
    }
    setShipment("loading");
    fetchShipmentByNumber(numero).then((s) => setShipment(s ?? null));
  }, [numero]);

  useEffect(() => {
    const token = getToken();
    if (token) {
      apiAdminMe().then(setAgent).catch(() => setAgent(null));
    } else {
      setAgent(null);
    }
  }, []);

  const handleUpdateStatut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatut) return;
    setUpdating(true);
    setSuccess("");
    try {
      await apiAdminColisStatut(numero, selectedStatut, commentaire || undefined);
      setSuccess(`Statut mis à jour : ${LABELS[selectedStatut]}`);
      setSelectedStatut("");
      setCommentaire("");
      setLocalisation("");
      const s = await fetchShipmentByNumber(numero);
      setShipment(s ?? null);
    } catch {
      setSuccess("");
    } finally {
      setUpdating(false);
    }
  };

  if (!numero) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Numéro de suivi invalide</p>
          <Link href="/">
            <Button variant="primary">Retour à l&apos;accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (shipment === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-red-800 mb-2">Colis introuvable</h2>
          <p className="text-red-700 mb-6">Aucun colis trouvé avec le numéro {numero}</p>
          <Link href="/">
            <Button variant="primary">Retour à l&apos;accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAgent = !!agent;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Logo size="sm" />
            </Link>
            <div className="flex items-center gap-4">
              {isAgent && (
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  <IconUser size={16} strokeWidth={2} />
                  {agent.nom}
                </span>
              )}
              <Link href="/" className="text-sm text-primary font-medium hover:underline">
                Accueil
              </Link>
              {!isAgent && (
                <Link href="/admin/login" className="text-sm text-gray-600 hover:text-primary">
                  Agent ? Se connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-4xl py-8 min-w-0">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-800">
            {success}
          </div>
        )}

        <TrackingResult shipment={shipment} enableAnimations={false} />

        {isAgent && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-primary mb-4">Mettre à jour le statut</h2>
            <form onSubmit={handleUpdateStatut} className="space-y-4">
              {/* Mobile: grille 2 colonnes. Desktop: 5 colonnes */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2">
                {STATUTS.map((s) => {
                  const isSelected = selectedStatut === s.code;
                  const isCurrent = shipment.statut === s.code;
                  const isPast = ["RAMASSE", "EN_CONTENEUR", "PARTI", "ARRIVE", "LIVRE"].indexOf(shipment.statut) > ["RAMASSE", "EN_CONTENEUR", "PARTI", "ARRIVE", "LIVRE"].indexOf(s.code);
                  return (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => setSelectedStatut(s.code)}
                      className={`flex flex-col items-center gap-1 sm:gap-1.5 p-2.5 sm:p-3 rounded-xl border-2 transition btn-glow ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : isCurrent
                          ? "border-primary bg-primary/10 text-primary"
                          : isPast
                          ? "border-primary/30 bg-primary/5 text-primary"
                          : "border-gray-200 text-gray-500 hover:border-primary/30 hover:text-gray-700"
                      }`}
                      aria-label={`Statut : ${s.label}`}
                    >
                      <span className={`w-8 h-8 flex items-center justify-center ${isSelected ? "text-white" : ""}`}>
                        <StatusIcon status={s.code} size={20} completed={isPast} active={isCurrent || isSelected} />
                      </span>
                      <span className="text-xs font-semibold">{s.label}</span>
                    </button>
                  );
                })}
              </div>
              {/* Mobile: pile verticale pleine largeur. Desktop: 2 colonnes */}
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                  <input
                    type="text"
                    value={localisation}
                    onChange={(e) => setLocalisation(e.target.value)}
                    placeholder="Ex: Port du Havre"
                    className="w-full px-4 py-3 sm:py-2 border-2 border-gray-200 rounded-xl text-base min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
                  <input
                    type="text"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Optionnel"
                    className="w-full px-4 py-3 sm:py-2 border-2 border-gray-200 rounded-xl text-base min-h-[44px]"
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                disabled={!selectedStatut || updating}
              >
                {updating ? "Mise à jour..." : `Confirmer : ${selectedStatut ? LABELS[selectedStatut] : "—"}`}
              </Button>
            </form>
          </div>
        )}

        <SearchAgainButton />
      </main>
    </div>
  );
}
