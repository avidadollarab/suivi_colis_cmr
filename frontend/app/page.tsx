import Link from "next/link";
import { HeroBanner } from "@/components/HeroBanner";
import { NextLoadingBanner } from "@/components/NextLoadingBanner";
import { Section } from "@/components/Section";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/Button";
import { CTAButton } from "@/components/CTAButton";
import { COMPANY, MAIN_SERVICES, CITIES } from "@/data/company";
import { MICRO_COPY } from "@/data/microCopy";
import {
  IconBox,
  IconLocation,
  IconPhone,
  IconCalendar,
  IconLock,
  IconHome,
  IconChat,
  IconWarehouse,
  IconBoat,
  IconAnchor,
  IconCheck,
} from "@/components/icons";

const PARCOURS = [
  { icon: <IconHome size={24} strokeWidth={1.5} />, label: MICRO_COPY.parcours.ramassage.label, sub: MICRO_COPY.parcours.ramassage.sub },
  { icon: <IconWarehouse size={24} strokeWidth={1.5} />, label: MICRO_COPY.parcours.groupage.label, sub: MICRO_COPY.parcours.groupage.sub },
  { icon: <IconBoat size={24} strokeWidth={1.5} />, label: MICRO_COPY.parcours.transit.label, sub: MICRO_COPY.parcours.transit.sub },
  { icon: <IconAnchor size={24} strokeWidth={1.5} />, label: MICRO_COPY.parcours.port.label, sub: MICRO_COPY.parcours.port.sub },
  { icon: <IconCheck size={24} strokeWidth={2} />, label: MICRO_COPY.parcours.livre.label, sub: MICRO_COPY.parcours.livre.sub },
];

const FEATURES = [
  { icon: <IconLocation size={24} strokeWidth={1.5} />, title: MICRO_COPY.features.suivi.title, desc: MICRO_COPY.features.suivi.desc },
  { icon: <IconPhone size={24} strokeWidth={1.5} />, title: MICRO_COPY.features.alertes.title, desc: MICRO_COPY.features.alertes.desc },
  { icon: <IconCalendar size={24} strokeWidth={1.5} />, title: MICRO_COPY.features.departs.title, desc: MICRO_COPY.features.departs.desc },
  { icon: <IconLock size={24} strokeWidth={1.5} />, title: MICRO_COPY.features.securise.title, desc: MICRO_COPY.features.securise.desc },
  { icon: <IconHome size={24} strokeWidth={1.5} />, title: MICRO_COPY.features.collecte.title, desc: MICRO_COPY.features.collecte.desc },
  { icon: <IconChat size={24} strokeWidth={1.5} />, title: MICRO_COPY.features.support.title, desc: MICRO_COPY.features.support.desc },
];

export default function HomePage() {
  return (
    <>
      <NextLoadingBanner />
      <HeroBanner />

      {/* Parcours - 5 étapes avec icônes vectorielles */}
      <section className="bg-white border-b border-gray-200 py-8">
        <ScrollReveal className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-2 md:gap-0">
          {PARCOURS.map((etape, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center min-w-[100px] group">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-primary group-hover:bg-primary/5 group-hover:border-primary/30 transition-all duration-200 group-hover:-translate-y-0.5">
                  {etape.icon}
                </div>
                <span className="text-xs font-semibold text-gray-600 mt-2 text-center">{etape.label}</span>
                <span className="text-[10px] text-gray-400 -mt-0.5">{etape.sub}</span>
              </div>
              {i < PARCOURS.length - 1 && (
                <span className="text-gold font-bold text-lg mx-1 md:mx-2 hidden sm:inline">›</span>
              )}
            </div>
          ))}
        </ScrollReveal>
      </section>

      {/* Tarifs - 3 cartes principales avec images */}
      <Section title={MICRO_COPY.services.title} subtitle={MICRO_COPY.services.subtitle}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MAIN_SERVICES.map((service, i) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              price={service.price}
              cta={service.cta}
              href={`${COMPANY.whatsappUrl}?text=Bonjour, je souhaite un devis pour ${service.title}`}
              image={service.image}
              imageAlt={(service as { imageAlt?: string }).imageAlt}
              featured={i === 0}
              index={i}
            />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/services">
            <Button variant="primary" size="lg">
              {MICRO_COPY.services.viewAll}
            </Button>
          </Link>
        </div>
      </Section>

      {/* Pourquoi ELISÉE XPRESS LOG */}
      <section className="bg-white py-16">
        <ScrollReveal className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-dark mb-2">{MICRO_COPY.features.title}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-primary">{MICRO_COPY.features.subtitle}</h2>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">{MICRO_COPY.features.desc}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:border-primary/30 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-primary">{f.title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Réseau de collecte */}
      <section className="py-16" style={{ background: "linear-gradient(160deg, #003d7a 0%, #0052A6 100%)" }}>
        <ScrollReveal className="container mx-auto px-4 max-w-4xl text-center text-white">
          <p className="text-gold font-bold text-xs uppercase tracking-widest mb-2">{MICRO_COPY.network.label}</p>
          <h2 className="text-2xl font-bold mb-2">{MICRO_COPY.network.title}</h2>
          <p className="text-white/80 text-sm mb-8">{MICRO_COPY.network.subtitle}</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {CITIES.map((ville) => (
              <span
                key={ville}
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: "rgba(244,176,0,0.15)", border: "1px solid rgba(244,176,0,0.3)", color: "#FFF8E6" }}
              >
                {ville}
              </span>
            ))}
            <span className="px-3 py-1.5 rounded-full text-sm" style={{ background: "rgba(244,176,0,0.15)", border: "1px solid rgba(244,176,0,0.3)", color: "#FFF8E6" }}>
              Ettenheim
            </span>
          </div>
          <p className="text-white/60 text-sm">{MICRO_COPY.network.hint}</p>
        </ScrollReveal>
      </section>

      {/* CTA Contact */}
      <section className="bg-primary py-16 text-white">
        <ScrollReveal className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-2xl font-bold mb-4">{MICRO_COPY.contact.title}</h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">{MICRO_COPY.contact.subtitle}</p>
          <CTAButton href={COMPANY.whatsappUrl} label={MICRO_COPY.contact.whatsapp} phone={COMPANY.whatsapp} />
        </ScrollReveal>
      </section>
    </>
  );
}
