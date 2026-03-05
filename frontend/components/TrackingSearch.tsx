"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { MICRO_COPY } from "@/data/microCopy";

interface TrackingSearchProps {
  size?: "sm" | "lg";
  placeholder?: string;
  enableAnimations?: boolean;
  variant?: "default" | "heroGlass";
}

export function TrackingSearch({
  size = "lg",
  placeholder,
  enableAnimations = true,
  variant = "default",
}: TrackingSearchProps) {
  const [numero, setNumero] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = numero.trim().toUpperCase();
    if (trimmed) {
      setIsLoading(true);
      router.push(`/tracking?numero=${encodeURIComponent(trimmed)}`);
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  const isLarge = size === "lg";
  const isHeroGlass = variant === "heroGlass";
  const displayPlaceholder = placeholder ?? MICRO_COPY.hero.searchPlaceholder;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div
        className={`flex flex-col sm:flex-row gap-3 ${
          isHeroGlass
            ? "input-hero-glass p-4 md:p-5"
            : isLarge
            ? "p-6 md:p-8 bg-white rounded-2xl shadow-xl border-2"
            : ""
        }`}
        style={
          isHeroGlass
            ? undefined
            : {
                borderColor: isFocused ? "rgba(244,176,0,0.6)" : "rgb(229,231,235)",
                boxShadow: isFocused && isLarge ? "0 0 0 3px rgba(244,176,0,0.15)" : undefined,
              }
        }
      >
        <div className="flex-1 relative">
          <input
            type="text"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={displayPlaceholder}
            disabled={isLoading}
            className={`w-full px-4 py-3 md:py-4 outline-none font-mono transition-all duration-200 ${
              isLarge ? "text-lg" : "text-base"
            } ${
              isHeroGlass
                ? "bg-transparent border-0 text-white placeholder-white/70"
                : `border-2 rounded-xl ${
                    isFocused
                      ? "border-gold ring-2 ring-gold/20 focus:ring-gold/30"
                      : "border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20"
                  }`
            }`}
            aria-label={MICRO_COPY.hero.searchLabel}
          />
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </div>
        <motion.div
          whileHover={enableAnimations ? { scale: 1.02 } : undefined}
          whileTap={enableAnimations ? { scale: 0.98 } : undefined}
        >
          <Button
            type="submit"
            variant={isHeroGlass ? "heroGlass" : "gold"}
            size={isLarge ? "lg" : "md"}
            className="w-full sm:w-auto whitespace-nowrap"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Recherche...
              </span>
            ) : (
              MICRO_COPY.hero.searchButton
            )}
          </Button>
        </motion.div>
      </div>
    </form>
  );
}
