"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  span?: "1" | "2" | "3" | "full";
  rowSpan?: "1" | "2";
  glow?: "amber" | "violet" | "none";
  delay?: number;
  hover?: boolean;
}

export default function BentoCard({
  children,
  className = "",
  span = "1",
  rowSpan = "1",
  glow = "none",
  delay = 0,
  hover = true,
}: BentoCardProps) {
  const colSpanMap = { "1": "col-span-1", "2": "col-span-2", "3": "col-span-3", "full": "col-span-full" };
  const rowSpanMap = { "1": "row-span-1", "2": "row-span-2" };
  const glowMap = {
    none: "",
    amber: "hover:shadow-[0_0_40px_-8px_rgba(245,158,11,0.2)]",
    violet: "hover:shadow-[0_0_40px_-8px_rgba(139,92,246,0.2)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
      whileHover={hover ? { y: -2, scale: 1.005, transition: { duration: 0.2 } } : undefined}
      className={`
        relative overflow-hidden rounded-2xl
        bg-surface-2/60 backdrop-blur-xl
        border border-white/[0.04]
        transition-shadow duration-300
        ${colSpanMap[span]} ${rowSpanMap[rowSpan]}
        ${glowMap[glow]}
        ${className}
      `}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
