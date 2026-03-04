"use client";

import { motion } from "framer-motion";

interface TimelineStepProps {
  label: string;
  date?: string;
  message?: string;
  lieu?: string;
  status: "completed" | "current" | "pending";
  icon: React.ReactNode;
  index?: number;
  enableAnimations?: boolean;
  tooltip?: string;
}

export function TimelineStep({
  label,
  date,
  message,
  lieu,
  status,
  icon,
  index = 0,
  enableAnimations = true,
  tooltip,
}: TimelineStepProps) {
  const isCompleted = status === "completed";
  const isCurrent = status === "current";

  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0, x: -12 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="relative flex gap-6 pb-8 last:pb-0"
    >
      <motion.div
        className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isCompleted ? "bg-primary text-white" : isCurrent ? "bg-primary/20 text-primary border-2 border-primary" : "bg-gray-200 text-gray-500"
        }`}
        animate={isCurrent && enableAnimations ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        title={tooltip}
        aria-label={tooltip || label}
      >
        {icon}
      </motion.div>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className={isCompleted ? "text-gray-900" : isCurrent ? "text-primary" : "text-gray-500"}>
          <p className="font-semibold text-base">{label}</p>
          {message && <p className="text-sm mt-0.5">{message}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
            {date && (
              <span>
                {date}
              </span>
            )}
            {lieu && (
              <span className="text-primary font-medium flex items-center gap-1">
                {lieu}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
