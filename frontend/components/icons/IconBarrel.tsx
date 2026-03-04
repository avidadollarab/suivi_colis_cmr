"use client";

interface IconBarrelProps {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export function IconBarrel({ className = "", size = 24, strokeWidth = 1.5 }: IconBarrelProps) {
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
      <path d="M12 2v20" />
      <path d="M12 2c3 0 6 2 6 6v8c0 4-3 6-6 6" />
      <path d="M12 2c-3 0-6 2-6 6v8c0 4 3 6 6 6" />
    </svg>
  );
}
