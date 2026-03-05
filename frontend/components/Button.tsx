import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "secondary" | "outline" | "glass";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
  as?: "button" | "a";
  href?: string;
}

const variants = {
  primary:
    "bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97] active:translate-y-0",
  gold:
    "bg-gold hover:bg-gold-dark text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97] active:translate-y-0",
  secondary:
    "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 hover:scale-[1.02] active:scale-[0.97]",
  outline:
    "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white hover:scale-[1.02] active:scale-[0.97]",
  glass:
    "btn-glass rounded-full",
};

const sizes = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 text-base rounded-xl",
  lg: "px-8 py-4 text-lg rounded-xl",
};

const sizesGlass = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  as = "button",
  href,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold transition-smooth cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const sizeClasses = variant === "glass" ? sizesGlass[size] : sizes[size];
  const combinedClasses = `${baseClasses} ${variants[variant]} ${sizeClasses} ${className}`;

  if (as === "a" && href) {
    return (
      <a href={href} className={combinedClasses} {...(props as any)}>
        {children}
      </a>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
