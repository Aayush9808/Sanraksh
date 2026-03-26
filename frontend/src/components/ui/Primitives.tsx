"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MetricPillProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  accent?: "amber" | "violet" | "success" | "danger";
}

export function MetricPill({ icon, label, value, trend, trendValue, accent = "amber" }: MetricPillProps) {
  const accentColors = {
    amber: "text-accent-amber",
    violet: "text-accent-violet",
    success: "text-state-success",
    danger: "text-state-danger",
  };
  const trendColors = {
    up: "text-state-success",
    down: "text-state-danger",
    neutral: "text-text-muted",
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-text-muted uppercase tracking-wider">{label}</div>
        <div className={`text-xl font-semibold ${accentColors[accent]} tabular-nums`}>{value}</div>
      </div>
      {trend && trendValue && (
        <div className={`text-xs font-mono ${trendColors[trend]}`}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"} {trendValue}
        </div>
      )}
    </div>
  );
}

/* Status badge */
export function StatusBadge({ status, size = "sm" }: { status: string; size?: "xs" | "sm" }) {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    PAID: { bg: "bg-state-success/10", text: "text-state-success", dot: "bg-state-success" },
    ACTIVE: { bg: "bg-state-success/10", text: "text-state-success", dot: "bg-state-success" },
    PROCESSING: { bg: "bg-accent-amber/10", text: "text-accent-amber", dot: "bg-accent-amber" },
    PENDING: { bg: "bg-accent-amber/10", text: "text-accent-amber", dot: "bg-accent-amber" },
    REVIEW: { bg: "bg-accent-violet/10", text: "text-accent-violet", dot: "bg-accent-violet" },
    REJECTED: { bg: "bg-state-danger/10", text: "text-state-danger", dot: "bg-state-danger" },
    BLOCKED: { bg: "bg-state-danger/10", text: "text-state-danger", dot: "bg-state-danger" },
    EXPIRED: { bg: "bg-text-muted/10", text: "text-text-muted", dot: "bg-text-muted" },
  };
  const c = config[status.toUpperCase()] || config.PENDING;
  const sizeClass = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${c.bg} ${c.text} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

/* Section header */
export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* Page container with stagger animation */
export function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative z-10 min-h-screen pb-24 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* Page header */
export function PageHeader({ title, subtitle, badge, actions }: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex items-start justify-between pt-8 pb-6 px-8"
    >
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
