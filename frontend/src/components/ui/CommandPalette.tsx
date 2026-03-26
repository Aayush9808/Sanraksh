"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, ReactNode } from "react";

interface CommandPaletteProps {
  items: { id: string; label: string; icon: string; href: string; section?: string }[];
  onNavigate: (href: string) => void;
}

export default function CommandPalette({ items, onNavigate }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const toggle = useCallback(() => {
    setOpen(o => !o);
    setQuery("");
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle]);

  const filtered = items.filter(
    i => i.label.toLowerCase().includes(query.toLowerCase())
  );

  const sections = [...new Set(filtered.map(i => i.section || "Navigation"))];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-lg glass-strong rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
              <span className="text-text-secondary text-lg">⌘</span>
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Where do you want to go?"
                className="flex-1 bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted"
                onKeyDown={e => {
                  if (e.key === "Enter" && filtered.length > 0) {
                    onNavigate(filtered[0].href);
                    setOpen(false);
                  }
                }}
              />
              <kbd className="text-[10px] text-text-muted bg-surface-3 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
            </div>

            {/* Results */}
            <div className="max-h-[300px] overflow-y-auto p-2">
              {sections.map(section => (
                <div key={section}>
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-text-muted font-medium">
                    {section}
                  </div>
                  {filtered
                    .filter(i => (i.section || "Navigation") === section)
                    .map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.href);
                          setOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                          text-text-secondary hover:text-text-primary hover:bg-white/[0.04]
                          transition-all text-sm text-left"
                      >
                        <span className="text-base w-6 text-center">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-text-muted text-sm">No results found</div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
