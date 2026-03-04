import Link from "next/link";
import { Logo } from "@/components/Logo";
import { TrackingSearch } from "@/components/TrackingSearch";
import { NextLoadingBanner } from "@/components/NextLoadingBanner";
import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { COMPANY, SERVICES } from "@/data/company";

export default function HomePage() {
  return (
    <>
      <NextLoadingBanner />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary/10 to-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%20fill%3D%22%230052A6%22%20fill-opacity%3D%220.03%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="container mx-auto px-4 max-w-6xl relative">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo size="lg" showText={true} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary mt-4">
              Groupage Premium
            </h1>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              Acheminement international fiable. Suivez vos colis en temps réel.
            </p>

            {/* Champ de suivi - ancre #suivi */}
            <div id="suivi" className="mt-12 scroll-mt-24">
              <TrackingSearch size="lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Services rapides */}
      <Section
        title="Nos services"
        subtitle="Des solutions adaptées à tous vos envois"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.slice(0, 6).map((service) => (
            <Card key={service.id} hover>
              <div className="text-4xl mb-3">{service.icon}</div>
              <h3 className="font-bold text-lg text-primary">{service.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{service.description}</p>
              <p className="text-gold font-bold mt-2">{service.price}</p>
              <a
                href={`https://wa.me/41774428549?text=Bonjour, je souhaite un devis pour ${service.title}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="mt-4">
                  {service.cta}
                </Button>
              </a>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/services">
            <Button variant="primary" size="lg">
              Voir tous les services
            </Button>
          </Link>
        </div>
      </Section>

      {/* CTA Contact */}
      <section className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-2xl font-bold mb-4">
            Une question ? Contactez-nous
          </h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Notre équipe est disponible sur WhatsApp pour vous accompagner.
          </p>
          <a
            href={COMPANY.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-smooth shadow-lg"
          >
            <span>💬</span> WhatsApp {COMPANY.whatsapp}
          </a>
        </div>
      </section>
    </>
  );
}
