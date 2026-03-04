"use client";

import { motion } from "framer-motion";
import { MICRO_COPY } from "@/data/microCopy";

interface NextLoadingBannerProps {
  enableAnimations?: boolean;
}

export function NextLoadingBanner({ enableAnimations = true }: NextLoadingBannerProps) {
  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0, y: -20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-gradient-to-r from-gold via-gold-light to-gold py-2.5 px-4 text-center font-bold text-primary text-base tracking-wide"
    >
      {MICRO_COPY.loadingBanner.text} <strong>{MICRO_COPY.loadingBanner.date}</strong> — {MICRO_COPY.loadingBanner.cta} !
    </motion.div>
  );
}
