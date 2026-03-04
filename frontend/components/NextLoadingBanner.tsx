import { COMPANY } from "@/data/company";

export function NextLoadingBanner() {
  return (
    <div className="bg-gold text-white py-3 px-4 text-center font-semibold text-lg shadow-md">
      Prochain chargement : {COMPANY.nextLoading}
    </div>
  );
}
