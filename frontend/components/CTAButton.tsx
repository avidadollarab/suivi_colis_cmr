"use client";

import { motion } from "framer-motion";
import { IconChat } from "./icons";

interface CTAButtonProps {
  href: string;
  label: string;
  phone?: string;
  enableAnimations?: boolean;
}

export function CTAButton({ href, label, phone, enableAnimations = true }: CTAButtonProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl shadow-lg transition-colors"
      whileHover={enableAnimations ? { scale: 1.02, boxShadow: "0 12px 40px rgba(34,197,94,0.35)" } : undefined}
      whileTap={enableAnimations ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.2 }}
      aria-label={`Contacter par ${label} ${phone || ""}`}
    >
      <IconChat size={20} strokeWidth={2} className="text-white" />
      <span>{label}</span>
      {phone && <span className="font-mono">{phone}</span>}
    </motion.a>
  );
}
