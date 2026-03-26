"use client";

import { motion } from "framer-motion";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-surface-0 grid place-items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm text-center"
      >
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-state-danger/10 border border-state-danger/20 flex items-center justify-center text-2xl">
          ⚠
        </div>
        <h2 className="text-lg font-semibold text-text-primary">Something went wrong</h2>
        <p className="mt-2 text-sm text-text-muted leading-relaxed">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={reset}
          className="mt-6 px-5 py-2.5 rounded-xl bg-accent-amber/10 border border-accent-amber/20
            text-sm font-medium text-accent-amber hover:bg-accent-amber/20 transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );
}
