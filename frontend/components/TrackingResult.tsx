"use client";

import { motion } from "framer-motion";
import type { Shipment } from "@/data/mockShipments";
import { Card } from "./Card";
import { Timeline } from "./Timeline";
import { Button } from "./Button";
import Link from "next/link";
import { IconBox, IconWarehouse, IconBoat, IconAnchor, IconCheck } from "./icons";
import { MICRO_COPY } from "@/data/microCopy";

interface TrackingResultProps {
  shipment: Shipment;
  enableAnimations?: boolean;
}

const statutColors: Record<string, string> = {
  RAMASSE: "bg-amber-100 text-amber-800",
  EN_CONTENEUR: "bg-blue-100 text-blue-800",
  PARTI: "bg-purple-100 text-purple-800",
  ARRIVE: "bg-teal-100 text-teal-800",
  LIVRE: "bg-green-100 text-green-800",
};

const ETAPES = [
  { key: "RAMASSE", icon: <IconBox size={20} strokeWidth={2} />, label: "Ramassé" },
  { key: "EN_CONTENEUR", icon: <IconWarehouse size={20} strokeWidth={2} />, label: "Conteneur" },
  { key: "PARTI", icon: <IconBoat size={20} strokeWidth={2} />, label: "En transit" },
  { key: "ARRIVE", icon: <IconAnchor size={20} strokeWidth={2} />, label: "À Douala" },
  { key: "LIVRE", icon: <IconCheck size={20} strokeWidth={2.5} />, label: "Livré" },
] as const;

function getProgressPercent(statut: string): number {
  const order = ["RAMASSE", "EN_CONTENEUR", "PARTI", "ARRIVE", "LIVRE"];
  const idx = order.indexOf(statut);
  return idx >= 0 ? ((idx + 1) / order.length) * 100 : 0;
}

export function TrackingResult({ shipment, enableAnimations = true }: TrackingResultProps) {
  const progress = getProgressPercent(shipment.statut);
  const idxActuel = ETAPES.findIndex((e) => e.key === shipment.statut);
  const datesEtape: Record<string, string | undefined> = {
    RAMASSE: shipment.date_ramassage,
    EN_CONTENEUR: shipment.date_conteneur,
    PARTI: shipment.date_depart,
    ARRIVE: shipment.date_arrivee,
    LIVRE: shipment.date_livraison,
  };

  return (
    <div className="space-y-8">
      {/* Frise de progression horizontale - style suivre.html */}
      <Card className="!p-6 overflow-x-auto">
        <div className="flex items-start gap-0 min-w-[480px]">
          {ETAPES.map((etape, i) => {
            const etat = i < idxActuel ? "done" : i === idxActuel ? "active" : "future";
            const dateE = datesEtape[etape.key];
            return (
              <div key={etape.key} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all ${
                      etat === "done"
                        ? "bg-primary border-primary text-white"
                        : etat === "active"
                        ? "bg-white border-primary ring-4 ring-primary/20"
                        : "bg-gray-100 border-gray-200 opacity-50"
                    }`}
                  >
                    {etape.icon}
                  </div>
                  <span className={`text-xs font-semibold mt-2 text-center max-w-[70px] ${etat === "future" ? "text-gray-400" : "text-gray-700"}`}>
                    {etape.label}
                  </span>
                  {dateE && <span className="text-[10px] text-gray-500">{dateE.slice(0, 10)}</span>}
                </div>
                {i < ETAPES.length - 1 && (
                  <div className={`flex-shrink-0 w-8 h-0.5 rounded mx-0.5 mt-[-24px] ${i < idxActuel ? "bg-primary" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Layout 2 colonnes desktop : résumé à gauche, frise à droite */}
      <div className="grid md:grid-cols-[1fr,1.2fr] gap-8 items-start">
        {/* Carte récapitulative - gauche */}
        <Card className="!p-6 md:!p-8 md:sticky md:top-24">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
              {MICRO_COPY.tracking.summary.number}
            </p>
            <p className="text-2xl font-mono font-bold text-primary mt-1">
              {shipment.numero_suivi}
            </p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                statutColors[shipment.statut] || "bg-gray-100 text-gray-800"
              }`}
            >
              {shipment.statut_label}
            </span>
          </div>
          <div className="text-right space-y-1">
            {shipment.eta && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">{MICRO_COPY.tracking.summary.eta} :</span> {shipment.eta}
              </p>
            )}
            <p className="text-sm text-gray-500">
              {MICRO_COPY.tracking.summary.lastUpdate} :{" "}
              {shipment.historique.filter((h) => h.completed).slice(-1)[0]
                ?.date || shipment.date_creation}
            </p>
          </div>
        </div>

        {/* Barre de progression - animation fluide */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{MICRO_COPY.tracking.summary.progress}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            {enableAnimations ? (
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            ) : (
              <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
            )}
          </div>
        </div>

        {/* Infos colis */}
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{MICRO_COPY.tracking.summary.description}</p>
            <p className="font-medium">{shipment.description}</p>
          </div>
          <div>
            <p className="text-gray-500">{MICRO_COPY.tracking.summary.weight}</p>
            <p className="font-medium">{shipment.poids_kg} kg</p>
          </div>
          <div>
            <p className="text-gray-500">{MICRO_COPY.tracking.summary.destination}</p>
            <p className="font-medium">
              {shipment.dest_ville}
              {shipment.dest_quartier && `, ${shipment.dest_quartier}`}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{MICRO_COPY.tracking.summary.client}</p>
            <p className="font-medium">
              {shipment.client_prenom} {shipment.client_nom}
            </p>
          </div>
        </div>
        </Card>

        {/* Frise chronologique - droite */}
        <Card>
          <h3 className="text-lg font-bold text-primary mb-6">
            {MICRO_COPY.tracking.timeline.title}
          </h3>
          <Timeline events={shipment.historique} enableAnimations={enableAnimations} />
        </Card>
      </div>

      <div className="text-center">
        <Link href="/">
          <Button variant="glass" size="lg">
            ← {MICRO_COPY.tracking.timeline.newSearch}
          </Button>
        </Link>
      </div>
    </div>
  );
}
