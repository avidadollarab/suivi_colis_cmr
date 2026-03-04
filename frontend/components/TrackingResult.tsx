"use client";

import type { Shipment } from "@/data/mockShipments";
import { Card } from "./Card";
import { Timeline } from "./Timeline";
import { Button } from "./Button";
import Link from "next/link";

interface TrackingResultProps {
  shipment: Shipment;
}

const statutColors: Record<string, string> = {
  RAMASSE: "bg-amber-100 text-amber-800",
  EN_CONTENEUR: "bg-blue-100 text-blue-800",
  PARTI: "bg-purple-100 text-purple-800",
  ARRIVE: "bg-teal-100 text-teal-800",
  LIVRE: "bg-green-100 text-green-800",
};

function getProgressPercent(statut: string): number {
  const order = ["RAMASSE", "EN_CONTENEUR", "PARTI", "ARRIVE", "LIVRE"];
  const idx = order.indexOf(statut);
  return idx >= 0 ? ((idx + 1) / order.length) * 100 : 0;
}

export function TrackingResult({ shipment }: TrackingResultProps) {
  const progress = getProgressPercent(shipment.statut);

  return (
    <div className="space-y-8">
      {/* Layout 2 colonnes desktop : résumé à gauche, frise à droite */}
      <div className="grid md:grid-cols-[1fr,1.2fr] gap-8 items-start">
        {/* Carte récapitulative - gauche */}
        <Card className="!p-6 md:!p-8 md:sticky md:top-24">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
              Numéro de suivi
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
                <span className="font-medium">ETA :</span> {shipment.eta}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Dernière mise à jour :{" "}
              {shipment.historique.filter((h) => h.completed).slice(-1)[0]
                ?.date || shipment.date_creation}
            </p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progression</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Infos colis */}
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Description</p>
            <p className="font-medium">{shipment.description}</p>
          </div>
          <div>
            <p className="text-gray-500">Poids</p>
            <p className="font-medium">{shipment.poids_kg} kg</p>
          </div>
          <div>
            <p className="text-gray-500">Destination</p>
            <p className="font-medium">
              {shipment.dest_ville}
              {shipment.dest_quartier && `, ${shipment.dest_quartier}`}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Client</p>
            <p className="font-medium">
              {shipment.client_prenom} {shipment.client_nom}
            </p>
          </div>
        </div>
        </Card>

        {/* Frise chronologique - droite */}
        <Card>
          <h3 className="text-lg font-bold text-primary mb-6">
            Historique du colis
          </h3>
          <Timeline events={shipment.historique} />
        </Card>
      </div>

      <div className="text-center">
        <Link href="/">
          <Button variant="outline" size="lg">
            ← Nouvelle recherche
          </Button>
        </Link>
      </div>
    </div>
  );
}
