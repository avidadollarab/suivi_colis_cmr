import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { NextLoadingBanner } from "@/components/NextLoadingBanner";
import { SERVICES, COMPANY } from "@/data/company";

export default function ServicesPage() {
  return (
    <>
      <NextLoadingBanner />

      <Section
        title="Nos services & tarifs"
        subtitle="Des solutions adaptées à tous vos envois. Prix indicatifs — contactez-nous pour un devis personnalisé."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <Card key={service.id} hover>
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="font-bold text-xl text-primary">{service.title}</h3>
              <p className="text-gray-600 mt-2">{service.description}</p>
              <p className="text-gold font-bold text-xl mt-4">{service.price}</p>
              <a
                href={`${COMPANY.whatsappUrl}?text=Bonjour, je souhaite un devis pour ${service.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-6"
              >
                <Button variant="gold" size="md" className="w-full">
                  {service.cta}
                </Button>
              </a>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center bg-primary/5 rounded-2xl p-8 border border-primary/10">
          <h3 className="text-xl font-bold text-primary mb-2">
            Groupage Premium
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Notre service de groupage vous permet d&apos;optimiser les coûts en
            partageant un conteneur avec d&apos;autres expéditeurs. Idéal pour
            les particuliers et les petits envois.
          </p>
          <a
            href={COMPANY.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6"
          >
            <Button variant="primary" size="lg">
              Demander un devis personnalisé
            </Button>
          </a>
        </div>
      </Section>
    </>
  );
}
