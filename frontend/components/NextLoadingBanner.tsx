"use client";

import { motion } from "framer-motion";
import { IconCheck } from "./icons";
import { MICRO_COPY } from "@/data/microCopy";

interface NextLoadingBannerProps {
  enableAnimations?: boolean;
}

export function NextLoadingBanner({ enableAnimations = true }: NextLoadingBannerProps) {
  return (
    <div className="flex justify-center px-4 py-3">
      <motion.div
        initial={enableAnimations ? { opacity: 0, y: 10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="badge-depart w-[90%] md:w-[65%] max-w-2xl"
      >
        <span className="badge-check w-6 h-6 rounded-full bg-white/90">
          <IconCheck size={14} strokeWidth={2.5} className="text-amber-600" />
        </span>
        <span className="badge-text">
          {MICRO_COPY.loadingBanner.text}{" "}
          <strong className="font-semibold">{MICRO_COPY.loadingBanner.date}</strong>
          {MICRO_COPY.loadingBanner.cta ? ` — ${MICRO_COPY.loadingBanner.cta} !` : ""}
        </span>
      </motion.div>
    </div>
  );
}
