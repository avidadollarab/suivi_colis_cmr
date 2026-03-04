"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";

interface TrackingSearchProps {
  size?: "sm" | "lg";
  placeholder?: string;
}

export function TrackingSearch({
  size = "lg",
  placeholder = "Ex : EXL2026001",
}: TrackingSearchProps) {
  const [numero, setNumero] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = numero.trim().toUpperCase();
    if (trimmed) {
      router.push(`/tracking?numero=${encodeURIComponent(trimmed)}`);
    }
  };

  const isLarge = size === "lg";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div
        className={`flex flex-col sm:flex-row gap-3 ${
          isLarge ? "p-6 md:p-8 bg-white rounded-2xl shadow-xl border border-gray-200" : ""
        }`}
      >
        <input
          type="text"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 px-4 py-3 md:py-4 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-smooth font-mono ${
            isLarge ? "text-lg" : "text-base"
          }`}
          aria-label="Numéro de suivi"
        />
        <Button
          type="submit"
          variant="gold"
          size={isLarge ? "lg" : "md"}
          className="w-full sm:w-auto whitespace-nowrap"
        >
          Suivre mon colis
        </Button>
      </div>
    </form>
  );
}
