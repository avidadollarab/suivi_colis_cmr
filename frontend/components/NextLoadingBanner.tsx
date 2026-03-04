import { COMPANY } from "@/data/company";

export function NextLoadingBanner() {
  return (
    <div className="bg-gradient-to-r from-gold via-gold-light to-gold py-2.5 px-4 text-center font-bold text-primary text-base tracking-wide">
      🚢 Prochain chargement : <strong>{COMPANY.nextLoading}</strong> — Réservez votre place avant le 6 Mars !
    </div>
  );
}
