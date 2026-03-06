"use client";

import Link from "next/link";
import { Button } from "./Button";
import { MICRO_COPY } from "@/data/microCopy";

/**
 * Bouton unique pour relancer une recherche de colis.
 * Afficher une seule fois en bas de la page de résultats, centré.
 * Redirige vers "/" (accueil) pour saisir un nouveau numéro.
 */
export function SearchAgainButton() {
  return (
    <div className="text-center mt-8">
      <Link href="/">
        <Button variant="glass" size="lg">
          ← {MICRO_COPY.tracking.timeline.newSearch}
        </Button>
      </Link>
    </div>
  );
}
