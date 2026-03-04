import Link from "next/link";
import { Logo } from "@/components/Logo";
import { TrackingSearch } from "@/components/TrackingSearch";
import { NextLoadingBanner } from "@/components/NextLoadingBanner";
import { Section } from "@/components/Section";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { COMPANY, SERVICES, CITIES } from "@/data/company";

const PARCOURS = [
  { icon: "🏠", label: "Ramassage", sub: "Chez vous" },
  { icon: "🏭", label: "Groupage", sub: "Ettenheim, DE" },
  { icon: "🚢", label: "En transit", sub: "Océan Atlantique" },
  { icon: "⚓", label: "Port d'arrivée", sub: "Douala & autres" },
  { icon: "✅", label: "Livré", sub: "À destination" },
];

const FEATURES = [
  { icon: "📍", title: "Suivi en temps réel", desc: "Consultez le statut de votre envoi à chaque étape clé, 24h/24 depuis notre site." },
  { icon: "📱", title: "Alertes SMS & WhatsApp", desc: "Notification automatique à chaque changement de statut pour vous et votre destinataire." },
  { icon: "🗓️", title: "Départs réguliers", desc: "Des chargements planifiés régulièrement pour que vos envois n'attendent jamais trop longtemps." },
  { icon: "🔒", title: "Marchandises sécurisées", desc: "Vos biens sont conditionnés et protégés dans nos entrepôts avant chaque départ." },
  { icon: "🏠", title: "Collecte à domicile", desc: "Nous venons chercher vos colis chez vous dans toute la région couverte par notre réseau." },
  { icon: "📞", title: "Support WhatsApp", desc: "Une question ? Contactez-nous sur WhatsApp au +41 77 442 85 49 — réponse rapide garantie." },
];

export default function HomePage() {
  return (
    <>
      <NextLoadingBanner />

      {/* Hero - style des fichiers HTML */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #0D1B3E 0%, #1a3a6b 50%, #0a2550 100%)" }}>
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at 60% 0%, rgba(212,175,55,0.2) 0%, transparent 60%)" }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="container mx-auto px-4 max-w-4xl py-16 md:py-20 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 text-sm font-semibold" style={{ background: "rgba(212,175,55,0.15)", borderColor: "rgba(212,175,55,0.4)", color: "#F0D060" }}>
            🇪🇺 Europe · 🚢 Groupage Premium · 🌍 Afrique
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Votre colis entre<br />de bonnes mains, <span className="text-gold">garanti.</span>
          </h1>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Suivez votre envoi en temps réel, du ramassage en Europe jusqu&apos;à la livraison à votre porte en Afrique.
          </p>
          <div id="suivi" className="scroll-mt-24">
            <TrackingSearch size="lg" placeholder="Ex: EXL-2026-00147" />
          </div>
          <p className="text-white/40 text-sm mt-3">Entrez le numéro reçu par SMS lors du ramassage</p>
        </div>
      </section>

      {/* Parcours - 5 étapes */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-2 md:gap-0">
          {PARCOURS.map((etape, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center min-w-[100px] group hover:-translate-y-0.5 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-xl group-hover:bg-gold-light group-hover:border-gold/50">
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
        </div>
      </section>

      {/* Tarifs - avec carte "POPULAIRE" */}
      <Section
        title="Nos tarifs Groupage Premium"
        subtitle="Colis, fûts, véhicules, électroménager — nous nous occupons de tout."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((service, i) => (
            <Card key={service.id} hover className={i === 0 ? "relative border-gold ring-2 ring-gold/30" : ""}>
              {i === 0 && (
                <span className="absolute top-3 right-3 bg-gold text-primary-dark text-[10px] font-extrabold px-2 py-1 rounded-full tracking-wider">
                  POPULAIRE
                </span>
              )}
              <div className="text-3xl mb-3">{service.icon}</div>
              <h3 className="font-bold text-lg text-primary">{service.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{service.description}</p>
              <p className="text-gold-dark font-extrabold text-xl mt-3">{service.price}</p>
              <a
                href={`${COMPANY.whatsappUrl}?text=Bonjour, je souhaite un devis pour ${service.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4"
              >
                <Button variant="gold" size="sm">
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

      {/* Pourquoi ELISÉE XPRESS LOG */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-dark mb-2">Pourquoi ELISÉE XPRESS LOG</p>
            <h2 className="text-2xl md:text-3xl font-bold text-primary">Le Groupage Premium, c&apos;est quoi ?</h2>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              Un service fiable, transparent et régulier — depuis l&apos;Allemagne vers l&apos;Afrique.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:border-gold/40 hover:-translate-y-1 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-gold-light flex items-center justify-center text-xl mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-primary">{f.title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Réseau de collecte - fond navy */}
      <section className="py-16" style={{ background: "linear-gradient(160deg, #0D1B3E 0%, #1a3a6b 100%)" }}>
        <div className="container mx-auto px-4 max-w-4xl text-center text-white">
          <p className="text-gold font-bold text-xs uppercase tracking-widest mb-2">Notre réseau</p>
          <h2 className="text-2xl font-bold mb-2">Nous collectons près de chez vous</h2>
          <p className="text-white/65 text-sm mb-8">Présents dans plus de 20 villes en Europe — et nous grandissons !</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {CITIES.map((ville) => (
              <span
                key={ville}
                className="px-3 py-1.5 rounded-full text-sm font-medium"
                style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)", color: "#F0D060" }}
              >
                {ville}
              </span>
            ))}
            <span className="px-3 py-1.5 rounded-full text-sm" style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)", color: "#F0D060" }}>
              Ettenheim
            </span>
          </div>
          <p className="text-white/50 text-sm">Vous ne voyez pas votre ville ? Contactez-nous — nous étudions chaque demande.</p>
        </div>
      </section>

      {/* CTA Contact */}
      <section className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-2xl font-bold mb-4">Une question ? Contactez-nous</h2>
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
