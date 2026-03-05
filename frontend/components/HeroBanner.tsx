"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Logo } from "./Logo";
import { TrackingSearch } from "./TrackingSearch";
import { HeroTabs, type TabId } from "./HeroTabs";
import { MICRO_COPY } from "@/data/microCopy";
import { COMPANY } from "@/data/company";
import { Button } from "./Button";
import { CTAButton } from "./CTAButton";

const HERO_BG_IMAGE =
  "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=1920&q=80";

const TAB_CONTENT: Record<TabId, string> = {
  europe: "Collecte dans toute l'Europe — Saarland, Alsace, Suisse, Allemagne.",
  groupage: "Suivi mis à jour en temps réel, du ramassage en Europe jusqu'à la livraison à votre porte au Cameroun.",
  cameroun: "Livraison à Douala et dans tout le Cameroun — votre colis jusqu'à destination.",
};

interface HeroBannerProps {
  enableAnimations?: boolean;
}

export function HeroBanner({ enableAnimations = true }: HeroBannerProps) {
  const [activeTab, setActiveTab] = useState<TabId>("groupage");

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Image de fond */}
      <div className="absolute inset-0">
        <Image
          src={HERO_BG_IMAGE}
          alt=""
          fill
          priority
          className="object-cover scale-105 md:scale-100"
          sizes="100vw"
        />
        {/* Overlay dégradé bleu nuit pour lisibilité */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,61,122,0.75) 0%, rgba(0,82,166,0.85) 40%, rgba(0,45,90,0.92) 100%)",
          }}
        />
        {/* Mobile : assombrir davantage */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,30,60,0.6) 0%, rgba(0,45,90,0.8) 100%)",
          }}
        />
        {/* Texture légère */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-16 md:py-24 relative z-10 text-center flex flex-col items-center">
        {/* Onglets Europe · Groupage Premium · Cameroun */}
        <motion.div
          initial={enableAnimations ? { opacity: 0, y: -20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-6"
        >
          <HeroTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            enableAnimations={enableAnimations}
          />
        </motion.div>

        <div className="flex justify-center mb-6">
          <Logo size="lg" showText={true} />
        </div>

        {/* Titre - fade-in + slide */}
        <motion.h1
          initial={enableAnimations ? { opacity: 0, y: 24 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4"
        >
          Votre colis entre de bonnes mains,{" "}
          <span className="text-gold">garanti</span>.
        </motion.h1>

        <AnimatePresence mode="wait">
          <motion.p
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="text-white/90 text-lg mb-8 max-w-xl mx-auto leading-relaxed min-h-[3rem]"
          >
            {TAB_CONTENT[activeTab]}
          </motion.p>
        </AnimatePresence>

        {/* Boutons Devis + WhatsApp */}
        <motion.div
          initial={enableAnimations ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.25,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          <a
            href={`${COMPANY.whatsappUrl}?text=Bonjour, je souhaite demander un devis`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="gold"
              size="lg"
              className="shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200"
            >
              Demander un devis
            </Button>
          </a>
          <CTAButton
            href={COMPANY.whatsappUrl}
            label="WhatsApp"
            phone={COMPANY.whatsapp}
          />
        </motion.div>

        {/* Champ de suivi */}
        <motion.div
          id="suivi"
          initial={enableAnimations ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="scroll-mt-24 w-full max-w-xl"
        >
          <TrackingSearch
            size="lg"
            placeholder={MICRO_COPY.hero.searchPlaceholder}
          />
        </motion.div>

        <motion.p
          initial={enableAnimations ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-white/50 text-sm mt-3"
        >
          {MICRO_COPY.hero.searchHint}
        </motion.p>
      </div>
    </section>
  );
}
