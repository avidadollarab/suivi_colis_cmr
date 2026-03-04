"use client";

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { w: 40, h: 40, text: "text-lg" },
    md: { w: 56, h: 56, text: "text-xl" },
    lg: { w: 120, h: 120, text: "text-3xl" },
  };

  const { w, h, text } = sizes[size];

  return (
    <Link
      href="/"
      className="flex items-center gap-3 no-underline text-primary hover:opacity-90 transition-opacity"
    >
      <div
        className="relative flex-shrink-0 rounded-xl overflow-hidden bg-white"
        style={{ width: w, height: h }}
      >
        <Image
          src="/logo.png"
          alt="ELISÉE XPRESS LOG"
          width={w}
          height={h}
          className="object-contain"
        />
      </div>
      {showText && (
        <span className={`font-bold ${text} tracking-tight`} style={{ color: "#8B6D20" }}>
          ELISÉE XPRESS LOG
        </span>
      )}
    </Link>
  );
}
