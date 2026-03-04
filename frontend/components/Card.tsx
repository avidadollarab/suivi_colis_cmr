import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 transition-smooth ${
        hover ? "hover:shadow-lg hover:border-primary/20 hover:-translate-y-1" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
