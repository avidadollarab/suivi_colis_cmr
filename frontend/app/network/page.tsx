import { Section } from "@/components/Section";
import { CITIES } from "@/data/company";
import { IconLocation } from "@/components/icons";

export default function NetworkPage() {
  return (
    <Section
      title="Zones de collecte"
      subtitle="Nous collectons vos colis dans les villes et régions suivantes. Contactez-nous pour organiser un ramassage."
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {CITIES.map((city) => (
              <div
                key={city}
                className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl hover:bg-primary/5 hover:border-primary/20 border border-transparent transition-smooth"
              >
                <IconLocation size={18} strokeWidth={1.5} className="text-primary flex-shrink-0" />
                <span className="font-medium text-gray-800">{city}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-bold text-primary mb-2">Régions couvertes</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• Saarland, Lorraine (Forbach, Metz, Nancy)</li>
              <li>• Luxembourg</li>
              <li>• Bade-Wurtemberg (Stuttgart, Karlsruhe, Heidelberg, Mannheim, Freiburg)</li>
              <li>• Rhénanie-Palatinat (Kaiserslautern, Ludwigshafen)</li>
              <li>• Suisse (Zurich, Bâle)</li>
              <li>• Bavière (Munich, Augsburg)</li>
              <li>• Alsace (Mulhouse, Strasbourg)</li>
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
