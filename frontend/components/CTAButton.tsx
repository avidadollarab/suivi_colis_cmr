"use client";

import { motion } from "framer-motion";
import { IconChat } from "./icons";

interface CTAButtonProps {
  href: string;
  label: string;
  phone?: string;
  enableAnimations?: boolean;
  variant?: "default" | "heroGlass";
}

export function CTAButton({ href, label, phone, enableAnimations = true, variant = "default" }: CTAButtonProps) {
  const isHeroGlass = variant === "heroGlass";
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-8 py-4 font-semibold transition-all duration-200 ${
        isHeroGlass
          ? "btn-hero-glass"
          : "bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg"
      }`}
      style={isHeroGlass ? undefined : {}}
      whileHover={
        enableAnimations
          ? isHeroGlass
            ? undefined
            : { scale: 1.02, boxShadow: "0 12px 40px rgba(34,197,94,0.35)" }
          : undefined
      }
      whileTap={enableAnimations ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.2 }}
      aria-label={`Contacter par ${label} ${phone || ""}`}
    >
      <IconChat size={20} strokeWidth={2} className={isHeroGlass ? "text-green-400" : "text-white"} />
      <span className={isHeroGlass ? "text-white" : ""}>{label}</span>
      {phone && <span className={`font-mono ${isHeroGlass ? "text-white/90" : ""}`}>{phone}</span>}
    </motion.a>
  );
}
