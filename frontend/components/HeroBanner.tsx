"use client";

import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { TrackingSearch } from "./TrackingSearch";
import { MICRO_COPY } from "@/data/microCopy";

interface HeroBannerProps {
  enableAnimations?: boolean;
}

export function HeroBanner({ enableAnimations = true }: HeroBannerProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #003d7a 0%, #0052A6 50%, #003d7a 100%)" }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: "radial-gradient(ellipse at 60% 0%, rgba(244,176,0,0.15) 0%, transparent 60%)" }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="container mx-auto px-4 max-w-4xl py-16 md:py-20 relative z-10 text-center">
        {/* Badge - slide depuis le haut */}
        <motion.div
          initial={enableAnimations ? { opacity: 0, y: -20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 text-sm font-semibold"
          style={{
            background: "rgba(244,176,0,0.15)",
            borderColor: "rgba(244,176,0,0.4)",
            color: "#FFF8E6",
          }}
        >
          {MICRO_COPY.hero.badge}
        </motion.div>

        <div className="flex justify-center mb-6">
          <Logo size="lg" showText={true} />
        </div>

        {/* Titre - fade-in + montée */}
        <motion.h1
          initial={enableAnimations ? { opacity: 0, y: 24 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4"
        >
          Votre colis entre de bonnes mains, <span className="text-gold">garanti</span>.
        </motion.h1>

        <motion.p
          initial={enableAnimations ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-white/90 text-lg mb-10 max-w-xl mx-auto"
        >
          {MICRO_COPY.hero.subtitle}
        </motion.p>

        {/* Champ de suivi - fade-in */}
        <motion.div
          id="suivi"
          initial={enableAnimations ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="scroll-mt-24"
        >
          <TrackingSearch size="lg" placeholder={MICRO_COPY.hero.searchPlaceholder} />
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
