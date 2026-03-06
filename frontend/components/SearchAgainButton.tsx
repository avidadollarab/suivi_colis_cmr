"use client";

import Link from "next/link";
import { Button } from "./Button";
import { MICRO_COPY } from "@/data/microCopy";

/**
 * Bouton unique pour relancer une recherche de colis.
 * Mobile : largeur 100% (max 90%), padding vertical, marges 16px.
 * Desktop : centré en bas de page.
 */
export function SearchAgainButton() {
  return (
    <div className="search-again-wrapper text-center mt-8 px-4 sm:px-0">
      <Link href="/" className="inline-block w-full max-w-[90%] sm:max-w-none">
        <Button variant="glass" size="lg" className="search-again-btn w-full sm:w-auto py-3.5 sm:py-4">
          ← {MICRO_COPY.tracking.timeline.newSearch}
        </Button>
      </Link>
    </div>
  );
}
