"use client";

import { motion } from "framer-motion";
import { Button } from "./Button";

interface ServiceCardProps {
  title: string;
  description: string;
  price: string;
  cta: string;
  href: string;
  icon: React.ReactNode;
  featured?: boolean;
  enableAnimations?: boolean;
  index?: number;
}

export function ServiceCard({
  title,
  description,
  price,
  cta,
  href,
  icon,
  featured = false,
  enableAnimations = true,
  index = 0,
}: ServiceCardProps) {
  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={
        enableAnimations
          ? {
              y: -4,
              transition: { duration: 0.2 },
              boxShadow: "0 12px 40px rgba(0,82,166,0.12)",
            }
          : undefined
      }
      className={`relative bg-white rounded-2xl border p-6 transition-shadow ${
        featured ? "border-gold ring-2 ring-gold/30" : "border-gray-200"
      }`}
    >
      {featured && (
        <span className="absolute top-3 right-3 bg-gold text-primary-dark text-[10px] font-extrabold px-2 py-1 rounded-full tracking-wider">
          POPULAIRE
        </span>
      )}
      <motion.div
        className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-4"
        whileHover={enableAnimations ? { scale: 1.05 } : undefined}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>
      <h3 className="font-bold text-lg text-primary">{title}</h3>
      <p className="text-gray-600 text-sm mt-1">{description}</p>
      <p className="text-gold font-bold text-xl mt-3">{price}</p>
      <a href={href} target="_blank" rel="noopener noreferrer" className="block mt-4">
        <Button variant="gold" size="sm" className="w-full">
          {cta}
        </Button>
      </a>
    </motion.div>
  );
}
