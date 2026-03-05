"use client";

import { useState } from "react";
import Image from "next/image";

interface ServiceCardImageProps {
  src: string;
  alt: string;
  title: string;
}

/** Image avec fallback en cas d'erreur 404 et hauteur fixe pour ratio 4:3 */
export function ServiceCardImage({ src, alt, title }: ServiceCardImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => setHasError(true);

  if (hasError) {
    return (
      <div
        className="w-full bg-primary/10 flex items-center justify-center"
        style={{ height: "240px", minHeight: "220px" }}
      >
        <span className="text-primary/60 text-sm font-medium text-center px-4">
          {title}
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "240px", minHeight: "220px", maxHeight: "260px" }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        sizes="(max-width: 768px) 100vw, 33vw"
        onError={handleError}
        unoptimized={src.startsWith("http")}
      />
    </div>
  );
}
