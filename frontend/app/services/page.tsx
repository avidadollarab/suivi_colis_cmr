import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { NextLoadingBanner } from "@/components/NextLoadingBanner";
import { ServiceCard } from "@/components/ServiceCard";
import { SERVICES, COMPANY } from "@/data/company";
import { MICRO_COPY } from "@/data/microCopy";
import { IconBox, IconBarrel, IconCar, IconTV } from "@/components/icons";

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  colis: <IconBox size={28} strokeWidth={1.5} />,
  fut: <IconBarrel size={28} strokeWidth={1.5} />,
  g1: <IconCar size={28} strokeWidth={1.5} />,
  g2: <IconCar size={28} strokeWidth={1.5} />,
  g3: <IconCar size={28} strokeWidth={1.5} />,
  tv: <IconTV size={28} strokeWidth={1.5} />,
};

export default function ServicesPage() {
  return (
    <>
      <NextLoadingBanner />

      <Section
        title="Nos services & tarifs"
        subtitle="Des solutions adaptées à tous vos envois. Prix indicatifs — contactez-nous pour un devis personnalisé."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              price={service.price}
              cta={service.cta}
              href={`${COMPANY.whatsappUrl}?text=Bonjour, je souhaite un devis pour ${service.title}`}
              icon={SERVICE_ICONS[service.id] ?? <IconBox size={28} />}
              featured={i === 0}
              index={i}
            />
          ))}
        </div>

        <div className="mt-16 text-center bg-primary/5 rounded-2xl p-8 border border-primary/10">
          <h3 className="text-xl font-bold text-primary mb-2">Groupage Premium — Corridor Europe → Cameroun</h3>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Notre service de groupage vous permet d&apos;optimiser les coûts en partageant un conteneur avec
            d&apos;autres expéditeurs. Idéal pour les particuliers et les petits envois, de l&apos;Europe jusqu&apos;au Cameroun.
          </p>
          <a href={COMPANY.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-6">
            <Button variant="primary" size="lg">
              Demander un devis personnalisé
            </Button>
          </a>
        </div>
      </Section>
    </>
  );
}
