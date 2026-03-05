"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "./Button";

interface ServiceCardProps {
  title: string;
  description: string;
  price: string;
  cta: string;
  href: string;
  icon?: React.ReactNode;
  image?: string;
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
  image,
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
              y: -6,
              transition: { duration: 0.25 },
              boxShadow: "0 20px 50px rgba(0,82,166,0.15)",
            }
          : undefined
      }
      className={`
        group relative bg-white rounded-2xl border overflow-hidden
        transition-all duration-300 ease-out
        ${featured ? "border-gold/50 ring-2 ring-gold/20" : "border-gray-200"}
      `}
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}
    >
      {featured && (
        <span className="absolute top-3 right-3 z-10 bg-gold text-primary-dark text-[10px] font-extrabold px-2 py-1 rounded-full tracking-wider">
          POPULAIRE
        </span>
      )}

      {/* Image ou icône */}
      <div className="relative overflow-hidden bg-gray-50">
        {image ? (
          <div className="aspect-[4/3] relative overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center text-primary m-4 group-hover:scale-105 transition-transform duration-200">
            {icon}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-bold text-lg text-primary">{title}</h3>
        <p className="text-gray-600 text-sm mt-1 leading-relaxed">{description}</p>
        <p className="text-gold font-bold text-xl mt-3">{price}</p>
        <a href={href} target="_blank" rel="noopener noreferrer" className="block mt-4">
          <Button
            variant="gold"
            size="sm"
            className="w-full transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
          >
            {cta}
          </Button>
        </a>
      </div>
    </motion.div>
  );
}
