"use client";

import { motion } from "framer-motion";

interface AnimationWrapperProps {
  children: React.ReactNode;
  enableAnimations?: boolean;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
}

export function AnimationWrapper({
  children,
  enableAnimations = true,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.4,
}: AnimationWrapperProps) {
  const y = direction === "up" ? 20 : direction === "down" ? -20 : 0;
  const x = direction === "left" ? 20 : direction === "right" ? -20 : 0;

  if (!enableAnimations) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
