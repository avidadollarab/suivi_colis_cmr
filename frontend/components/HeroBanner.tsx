"use client";

import { useState, useEffect } from "react";
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

const HERO_VIDEO =
  "https://assets.mixkit.co/videos/4011/4011-720.mp4";

const TAB_CONTENT: Record<TabId, string> = {
  europe: "Collecte dans toute l'Europe — Saarland, Alsace, Suisse, Allemagne.",
  groupage: "Des départs réguliers, suivis en temps réel. Vos colis voyagent en toute sécurité, de l'Europe au Cameroun.",
  cameroun: "Livraison à Douala et dans tout le Cameroun — votre colis jusqu'à destination.",
};

const CASCADE_DELAY = 80;
const CASCADE_DURATION = 0.35;

interface HeroBannerProps {
  enableAnimations?: boolean;
}

export function HeroBanner({ enableAnimations = true }: HeroBannerProps) {
  const [activeTab, setActiveTab] = useState<TabId>("groupage");
  const [useVideo, setUseVideo] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;
    if (prefersReducedMotion || isMobile) {
      setUseVideo(false);
    }
  }, []);

  const showVideo = useVideo && !videoError;

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Vidéo ou image de fond */}
      <div className="absolute inset-0">
        {showVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={HERO_BG_IMAGE}
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover scale-105 md:scale-100"
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={HERO_BG_IMAGE}
            alt=""
            fill
            priority
            className="object-cover scale-105 md:scale-100"
            sizes="100vw"
          />
        )}
        {/* Overlay dégradé bleu nuit pour lisibilité */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,50,0.7) 0%, rgba(0,0,80,0.9) 100%)",
          }}
        />
        {/* Mobile : assombrir davantage */}
        <div
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,30,60,0.6) 0%, rgba(0,45,90,0.85) 100%)",
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
        {/* Onglets - cascade */}
        <motion.div
          initial={enableAnimations ? { opacity: 0, y: -16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: CASCADE_DURATION, delay: 0, ease: [0.25, 0.46, 0.45, 0.94] }}
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

        {/* Titre - cascade */}
        <motion.h1
          initial={enableAnimations ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: CASCADE_DURATION,
            delay: CASCADE_DELAY / 1000,
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="text-white/90 text-lg mb-8 max-w-xl mx-auto leading-relaxed min-h-[3rem]"
          >
            {TAB_CONTENT[activeTab]}
          </motion.p>
        </AnimatePresence>

        {/* Boutons - cascade */}
        <motion.div
          initial={enableAnimations ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: CASCADE_DURATION,
            delay: (CASCADE_DELAY * 2) / 1000,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          <a
            href={`${COMPANY.whatsappUrl}?text=Bonjour, je souhaite demander un devis`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="heroGlass" size="lg">
              Demander un devis
            </Button>
          </a>
          <CTAButton
            href={COMPANY.whatsappUrl}
            label="WhatsApp"
            phone={COMPANY.whatsapp}
            variant="heroGlass"
          />
        </motion.div>

        {/* Champ de suivi - cascade */}
        <motion.div
          id="suivi"
          initial={enableAnimations ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: CASCADE_DURATION,
            delay: (CASCADE_DELAY * 3) / 1000,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="scroll-mt-24 w-full max-w-xl"
        >
          <TrackingSearch
            size="lg"
            placeholder={MICRO_COPY.hero.searchPlaceholder}
            variant="heroGlass"
          />
        </motion.div>

        <motion.p
          initial={enableAnimations ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: (CASCADE_DELAY * 4) / 1000 }}
          className="text-white/50 text-sm mt-3"
        >
          {MICRO_COPY.hero.searchHint}
        </motion.p>
      </div>
    </section>
  );
}
