"use client";

interface IconWarehouseProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export function IconWarehouse({ className = "", size = 24, strokeWidth = 1.5 }: IconWarehouseProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 20h20" />
      <path d="M4 20V8l8-4 8 4v12" />
      <path d="M4 12h16" />
      <path d="M9 20v-4h6v4" />
    </svg>
  );
}
