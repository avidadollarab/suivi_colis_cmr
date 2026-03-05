"use client";

import { ReactNode } from "react";
import { ScrollReveal } from "./ScrollReveal";

interface SectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  id?: string;
}

export function Section({
  children,
  title,
  subtitle,
  className = "",
  id,
}: SectionProps) {
  return (
    <section id={id} className={`py-16 md:py-24 ${className}`}>
      <ScrollReveal className="container mx-auto px-4 max-w-6xl">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </ScrollReveal>
    </section>
  );
}
