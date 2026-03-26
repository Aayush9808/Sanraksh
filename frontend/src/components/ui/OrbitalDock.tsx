"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface DockItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

interface OrbitalDockProps {
  items: DockItem[];
  onCommandPalette?: () => void;
}

export default function OrbitalDock({ items, onCommandPalette }: OrbitalDockProps) {
  const pathname = usePathname();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.3 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-1 px-2 py-2 glass-strong rounded-2xl">
        {items.map((item, i) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const isHovered = hoveredId === item.id;

          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                onHoverStart={() => setHoveredId(item.id)}
                onHoverEnd={() => setHoveredId(null)}
                animate={{
                  scale: isHovered ? 1.25 : isActive ? 1.1 : 1,
                  y: isHovered ? -8 : isActive ? -3 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="relative flex flex-col items-center"
              >
                <div
                  className={`
                    relative w-11 h-11 rounded-xl flex items-center justify-center text-lg
                    transition-colors duration-200 cursor-pointer
                    ${isActive
                      ? "bg-accent-amber/15 text-accent-amber"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/[0.06]"
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  {isActive && (
                    <motion.div
                      layoutId="dock-indicator"
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent-amber"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </div>

                {/* Tooltip */}
                <AnimTooltip visible={isHovered} label={item.label} />
              </motion.div>
            </Link>
          );
        })}

        {/* Separator */}
        <div className="w-px h-6 bg-white/[0.08] mx-1" />

        {/* Command palette trigger */}
        <motion.button
          whileHover={{ scale: 1.15, y: -4 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onClick={onCommandPalette}
          className="w-11 h-11 rounded-xl flex items-center justify-center
            text-text-muted hover:text-text-primary hover:bg-white/[0.06]
            transition-colors text-xs font-mono"
        >
          ⌘K
        </motion.button>
      </div>
    </motion.nav>
  );
}

function AnimTooltip({ visible, label }: { visible: boolean; label: string }) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      className="absolute -top-9 whitespace-nowrap px-2.5 py-1 rounded-lg
        bg-surface-3 text-[11px] text-text-primary font-medium
        pointer-events-none border border-white/[0.06]"
    >
      {label}
    </motion.div>
  );
}
