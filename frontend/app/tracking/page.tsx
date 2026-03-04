"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { getShipmentByNumber } from "@/data/mockShipments";
import { TrackingSearch } from "@/components/TrackingSearch";
import { TrackingResult } from "@/components/TrackingResult";
import { Button } from "@/components/Button";
import Link from "next/link";

function TrackingContent() {
  const searchParams = useSearchParams();
  const numeroParam = searchParams.get("numero");
  const [shipment, setShipment] = useState<ReturnType<typeof getShipmentByNumber> | "loading">(
    numeroParam ? "loading" : null
  );

  useEffect(() => {
    if (numeroParam) {
      setShipment(getShipmentByNumber(numeroParam));
    } else {
      setShipment(null);
    }
  }, [numeroParam]);

  // Pas de numéro : afficher le formulaire
  if (!numeroParam) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-4">
            Suivre un colis
          </h1>
          <p className="text-gray-600 mb-8">
            Entrez votre numéro de suivi pour consulter l&apos;état de votre envoi.
          </p>
          <TrackingSearch size="sm" />
        </div>
      </section>
    );
  }

  // Chargement
  if (shipment === "loading") {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse h-64 bg-gray-100 rounded-2xl" />
        </div>
      </section>
    );
  }

  // Numéro invalide / introuvable
  if (!shipment) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-red-800 mb-2">
              Numéro introuvable
            </h2>
            <p className="text-red-700 mb-6">
              Aucun colis trouvé avec le numéro <strong>{numeroParam}</strong>.
              Vérifiez que le numéro est correct (format EXL2026XXX).
            </p>
            <div className="space-y-3">
              <TrackingSearch size="sm" placeholder="Nouvelle recherche" />
              <Link href="/">
                <Button variant="secondary">Retour à l&apos;accueil</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Résultat trouvé
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <TrackingResult shipment={shipment} />
      </div>
    </section>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-pulse h-64 bg-gray-100 rounded-2xl" />
          </div>
        </section>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
