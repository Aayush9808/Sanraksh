"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "../../../components/AdminSidebar";
import { API_BASE } from "../../../lib/config";

type Severity = "high" | "extreme" | "medium";

type Playbook = {
  id: string;
  name: string;
  summary: string;
  payload: {
    city: string;
    zone: string;
    event_type: string;
    severity: Severity;
    strict_mode: boolean;
    affected_radius_km: number;
    limit_workers: number;
  };
};

type ControlTowerMetrics = {
  window: string;
  active_disruptions: number;
  disruptions_24h: number;
  claims_24h: number;
  paid_24h: number;
  review_24h: number;
  rejected_24h: number;
  auto_approval_rate: number;
  avg_fraud_score: number;
  total_paid_24h: number;
};

type ReviewClaim = {
  id: string;
  claim_number: string;
  worker_name: string;
  zone: string;
  amount: number;
  status: string;
  created_at: string;
  age_minutes: number;
  fraud_score: number;
  decision_reasons: string[];
};

type SimulationResult = {
  disruption_id: string;
  created_claims: number;
  auto_paid_count: number;
  review_count: number;
  rejected_count: number;
  total_payout: number;
};

type TrendPoint = {
  day: string;
  claims: number;
  payout: number;
};

type ReasonBreakdown = {
  reason: string;
  count: number;
};

type RunHistoryItem = {
  id: string;
  city: string;
  zone: string;
  event_type: string;
  severity: string;
  created_at: string;
  created_claims: number;
  auto_paid_count: number;
  review_count: number;
  rejected_count: number;
  total_payout: number;
  avg_fraud_score: number;
  signal_confidence: number;
  top_reasons: ReasonBreakdown[];
};

type QueueHealth = {
  queue_size: number;
  warning_count: number;
  breach_count: number;
  avg_age_minutes: number;
  breach_rate_pct: number;
  projected_clear_minutes: number;
};

type RunImpact = {
  summary: {
    created_claims: number;
    auto_paid_count: number;
    review_count: number;
    rejected_count: number;
    total_payout: number;
  };
  timeline: Array<{ stage: string; count: number }>;
  reason_breakdown: ReasonBreakdown[];
};

type PanelHealth = "live" | "fallback";

const PLAYBOOKS: Playbook[] = [
  {
    id: "monsoon-surge",
    name: "Monsoon Surge",
    summary: "Mumbai heavy rain with strict automation.",
    payload: {
      city: "Mumbai",
      zone: "Andheri West",
      event_type: "heavy_rain",
      severity: "high",
      strict_mode: true,
      affected_radius_km: 2,
      limit_workers: 400,
    },
  },
  {
    id: "pollution-shutdown",
    name: "AQI Shutdown",
    summary: "Delhi severe pollution wave.",
    payload: {
      city: "Delhi",
      zone: "Delhi NCR",
      event_type: "severe_pollution",
      severity: "extreme",
      strict_mode: true,
      affected_radius_km: 3,
      limit_workers: 300,
    },
  },
  {
    id: "platform-outage",
    name: "Platform Outage",
    summary: "Pune app outage affecting a broad zone.",
    payload: {
      city: "Pune",
      zone: "Pune Central",
      event_type: "market_closure",
      severity: "medium",
      strict_mode: true,
      affected_radius_km: 2.5,
      limit_workers: 250,
    },
  },
];

const FALLBACK_METRICS: ControlTowerMetrics = {
  window: "24h",
  active_disruptions: 3,
  disruptions_24h: 8,
  claims_24h: 146,
  paid_24h: 120,
  review_24h: 18,
  rejected_24h: 8,
  auto_approval_rate: 82.2,
  avg_fraud_score: 0.214,
  total_paid_24h: 96400,
};

const FALLBACK_TREND: TrendPoint[] = [
  { day: "Mon", claims: 18, payout: 14400 },
  { day: "Tue", claims: 22, payout: 17600 },
  { day: "Wed", claims: 31, payout: 24800 },
  { day: "Thu", claims: 26, payout: 20800 },
  { day: "Fri", claims: 19, payout: 15200 },
  { day: "Sat", claims: 35, payout: 28000 },
  { day: "Sun", claims: 24, payout: 19200 },
];

function statusTone(status: string): string {
  const s = status.toUpperCase();
  if (s === "PENDING" || s === "PROCESSING" || s === "REVIEW") {
    return "bg-amber-500/10 text-amber-300 border-amber-500/30";
  }
  if (s === "REJECTED") {
    return "bg-red-500/10 text-red-300 border-red-500/30";
  }
  return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
}

function slaTone(ageMinutes: number): string {
  if (ageMinutes >= 30) return "text-red-300";
  if (ageMinutes >= 15) return "text-amber-300";
  return "text-emerald-300";
}

function fmtCurrency(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function formatReason(reason: string): string {
  return reason
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - Date.parse(iso);
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ControlTowerPage() {
  const [metrics, setMetrics] = useState<ControlTowerMetrics>(FALLBACK_METRICS);
  const [claimsTrend, setClaimsTrend] = useState<TrendPoint[]>(FALLBACK_TREND);
  const [reviewQueue, setReviewQueue] = useState<ReviewClaim[]>([]);
  const [runHistory, setRunHistory] = useState<RunHistoryItem[]>([]);
  const [queueHealth, setQueueHealth] = useState<QueueHealth | null>(null);
  const [runImpact, setRunImpact] = useState<RunImpact | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [retryingPanel, setRetryingPanel] = useState<"metrics" | "queue" | "trend" | "runs" | null>(null);
  const [hoveredReasonClaimId, setHoveredReasonClaimId] = useState<string | null>(null);
  const [panelHealth, setPanelHealth] = useState<{ metrics: PanelHealth; queue: PanelHealth; trend: PanelHealth; runs: PanelHealth }>({
    metrics: "live",
    queue: "live",
    trend: "live",
    runs: "live",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rowActionId, setRowActionId] = useState<string | null>(null);
  const [runningPlaybookId, setRunningPlaybookId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SimulationResult | null>(null);
  const [statusLine, setStatusLine] = useState("Control Tower is live.");

  async function loadMetrics() {
    const res = await fetch(`${API_BASE}/api/v1/phase2/control-tower`);
    if (!res.ok) throw new Error("control-tower-metrics");
    const data = (await res.json()) as ControlTowerMetrics;
    setMetrics(data);
  }

  async function loadReviewQueue() {
    const res = await fetch(`${API_BASE}/api/v1/phase2/review-queue?limit=100`);
    if (!res.ok) throw new Error("review-queue-load");

    const data = (await res.json()) as {
      claims?: Array<{
        id: string;
        claim_number?: string;
        worker_name?: string;
        zone?: string;
        amount?: number;
        status?: string;
        created_at?: string;
        age_minutes?: number;
        fraud_score?: number;
        decision_reasons?: string[];
      }>;
    };

    const queue = (data.claims || [])
      .map((c) => ({
        id: c.id,
        claim_number: c.claim_number || c.id,
        worker_name: c.worker_name || "Worker",
        zone: c.zone || "-",
        amount: Number(c.amount || 0),
        status: (c.status || "PENDING").toUpperCase(),
        created_at: c.created_at || new Date().toISOString(),
        age_minutes: Number(c.age_minutes || 0),
        fraud_score: Number(c.fraud_score || 0),
        decision_reasons: c.decision_reasons || [],
      }))
      .sort((a, b) => b.age_minutes - a.age_minutes);

    setReviewQueue(queue);
  }

  async function loadTrend() {
    const res = await fetch(`${API_BASE}/api/v1/analytics/claims-summary?days=7`);
    if (!res.ok) throw new Error("claims-trend-load");

    const data = (await res.json()) as Array<{ day?: string; claims?: number; payout?: number }>;
    if (!Array.isArray(data) || data.length === 0) {
      setClaimsTrend(FALLBACK_TREND);
      return;
    }

    setClaimsTrend(
      data.map((p, i) => ({
        day: p.day || `D${i + 1}`,
        claims: Number(p.claims || 0),
        payout: Number(p.payout || 0),
      })),
    );
  }

  async function loadQueueHealth() {
    const res = await fetch(`${API_BASE}/api/v1/phase2/queue-health`);
    if (!res.ok) throw new Error("queue-health-load");
    const data = (await res.json()) as QueueHealth;
    setQueueHealth(data);
  }

  async function loadRunHistory() {
    const res = await fetch(`${API_BASE}/api/v1/phase2/run-history?limit=8`);
    if (!res.ok) throw new Error("run-history-load");
    const data = (await res.json()) as { runs?: RunHistoryItem[] };
    setRunHistory(data.runs || []);
  }

  async function loadRunImpact(runId: string) {
    const res = await fetch(`${API_BASE}/api/v1/phase2/run-impact/${runId}`);
    if (!res.ok) throw new Error("run-impact-load");
    const data = (await res.json()) as RunImpact;
    setRunImpact(data);
  }

  async function refreshAll() {
    setRefreshing(true);
    const [metricsResult, queueResult, trendResult, runsResult] = await Promise.allSettled([
      loadMetrics(),
      Promise.all([loadReviewQueue(), loadQueueHealth()]),
      loadTrend(),
      loadRunHistory(),
    ]);

    const health: { metrics: PanelHealth; queue: PanelHealth; trend: PanelHealth; runs: PanelHealth } = {
      metrics: metricsResult.status === "fulfilled" ? "live" : "fallback",
      queue: queueResult.status === "fulfilled" ? "live" : "fallback",
      trend: trendResult.status === "fulfilled" ? "live" : "fallback",
      runs: runsResult.status === "fulfilled" ? "live" : "fallback",
    };
    setPanelHealth(health);

    const okCount = [metricsResult, queueResult, trendResult, runsResult].filter((r) => r.status === "fulfilled").length;
    if (okCount === 4) setStatusLine("All Control Tower panels refreshed from backend.");
    else if (okCount === 0) setStatusLine("Backend unavailable. Showing fallback data.");
    else setStatusLine("Partial backend response. Some panels are in fallback mode.");

    setRefreshing(false);
    setLoading(false);
  }

  async function retryPanel(panel: "metrics" | "queue" | "trend" | "runs") {
    setRetryingPanel(panel);
    try {
      if (panel === "metrics") await loadMetrics();
      if (panel === "queue") await Promise.all([loadReviewQueue(), loadQueueHealth()]);
      if (panel === "trend") await loadTrend();
      if (panel === "runs") await loadRunHistory();

      setPanelHealth((prev) => ({ ...prev, [panel]: "live" }));
      setStatusLine(`${panel.charAt(0).toUpperCase() + panel.slice(1)} panel refreshed successfully.`);
    } catch {
      setPanelHealth((prev) => ({ ...prev, [panel]: "fallback" }));
      setStatusLine(`${panel.charAt(0).toUpperCase() + panel.slice(1)} panel retry failed.`);
    } finally {
      setRetryingPanel(null);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (!selectedRunId && runHistory.length > 0) {
      setSelectedRunId(runHistory[0].id);
      return;
    }
    if (selectedRunId && runHistory.every((run) => run.id !== selectedRunId)) {
      setSelectedRunId(runHistory[0]?.id || null);
    }
  }, [runHistory, selectedRunId]);

  useEffect(() => {
    if (!selectedRunId) {
      setRunImpact(null);
      return;
    }

    loadRunImpact(selectedRunId).catch(() => setRunImpact(null));
  }, [selectedRunId]);

  async function handleApprove(limit: number) {
    setApproving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/phase2/review-queue/approve?limit=${limit}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("approve-review-queue");
      const data = (await res.json()) as { approved_count: number; total_paid: number };
      setStatusLine(`Approved ${data.approved_count} claims from review queue (${fmtCurrency(data.total_paid)}).`);
      await refreshAll();
    } catch {
      setStatusLine("Review queue approval failed. Please retry.");
    } finally {
      setApproving(false);
    }
  }

  async function handleQueueClaimAction(claimId: string, action: "approve" | "reject") {
    setRowActionId(claimId);
    try {
      const res = await fetch(`${API_BASE}/api/v1/claims/${claimId}/${action}`, { method: "PUT" });
      if (!res.ok) throw new Error("queue-claim-action");

      setReviewQueue((prev) => prev.filter((claim) => claim.id !== claimId));
      setStatusLine(`Claim ${action === "approve" ? "approved" : "rejected"} from queue.`);
      await loadMetrics();
    } catch {
      setStatusLine(`Failed to ${action} claim. Please retry.`);
    } finally {
      setRowActionId(null);
    }
  }

  async function runPlaybook(playbook: Playbook) {
    setRunningPlaybookId(playbook.id);
    try {
      const res = await fetch(`${API_BASE}/api/v1/phase2/simulate-disruption`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(playbook.payload),
      });
      if (!res.ok) throw new Error("playbook-run-failed");

      const data = (await res.json()) as {
        disruption_id: string;
        created_claims: number;
        auto_paid_count: number;
        review_count: number;
        rejected_count: number;
        total_payout: number;
      };

      setLastResult({
        disruption_id: data.disruption_id,
        created_claims: Number(data.created_claims || 0),
        auto_paid_count: Number(data.auto_paid_count || 0),
        review_count: Number(data.review_count || 0),
        rejected_count: Number(data.rejected_count || 0),
        total_payout: Number(data.total_payout || 0),
      });

      const newHistory: RunHistoryItem = {
        id: String(data.disruption_id),
        city: playbook.payload.city,
        zone: playbook.payload.zone,
        event_type: playbook.payload.event_type,
        severity: playbook.payload.severity,
        created_at: new Date().toISOString(),
        created_claims: Number(data.created_claims || 0),
        auto_paid_count: Number(data.auto_paid_count || 0),
        review_count: Number(data.review_count || 0),
        rejected_count: Number(data.rejected_count || 0),
        total_payout: Number(data.total_payout || 0),
        avg_fraud_score: 0,
        signal_confidence: 0,
        top_reasons: [],
      };
      setRunHistory((prev) => [newHistory, ...prev].slice(0, 8));
      setSelectedRunId(newHistory.id);

      setStatusLine(`${playbook.name} executed. ${data.created_claims} claims generated.`);
      await refreshAll();
    } catch {
      setStatusLine(`${playbook.name} failed to execute. Backend may be unavailable.`);
    } finally {
      setRunningPlaybookId(null);
    }
  }

  const reviewBacklogPct = useMemo(() => {
    const base = Math.max(metrics.claims_24h, 1);
    return Math.round((metrics.review_24h / base) * 100);
  }, [metrics.claims_24h, metrics.review_24h]);

  const queueSla = useMemo(() => {
    let warning = 0;
    let breach = 0;
    let totalAge = 0;

    for (const claim of reviewQueue) {
      const age = Math.max(0, claim.age_minutes || 0);
      totalAge += age;
      if (age >= 30) breach += 1;
      else if (age >= 15) warning += 1;
    }

    return {
      warning,
      breach,
      avgAge: reviewQueue.length ? Math.round(totalAge / reviewQueue.length) : 0,
    };
  }, [reviewQueue]);

  const breachClaims = useMemo(() => {
    return reviewQueue
      .filter((claim) => claim.age_minutes >= 30)
      .sort((a, b) => b.age_minutes - a.age_minutes)
      .slice(0, 8);
  }, [reviewQueue]);

  const trendMaxClaims = useMemo(() => Math.max(...claimsTrend.map((p) => p.claims), 1), [claimsTrend]);

  const selectedRun = useMemo(() => {
    return runHistory.find((run) => run.id === selectedRunId) || null;
  }, [runHistory, selectedRunId]);

  const runRates = useMemo(() => {
    if (!selectedRun || selectedRun.created_claims <= 0) {
      return { autoRate: 0, reviewRate: 0, rejectRate: 0 };
    }
    const base = selectedRun.created_claims;
    return {
      autoRate: Math.round((selectedRun.auto_paid_count / base) * 100),
      reviewRate: Math.round((selectedRun.review_count / base) * 100),
      rejectRate: Math.round((selectedRun.rejected_count / base) * 100),
    };
  }, [selectedRun]);

  const projectedClearMins = useMemo(() => {
    if (queueHealth) return queueHealth.projected_clear_minutes;
    if (reviewQueue.length === 0) return 0;
    return Math.max(5, Math.ceil(reviewQueue.length / 25) * 5);
  }, [queueHealth, reviewQueue.length]);

  const breachRatePct = useMemo(() => {
    if (queueHealth) return Math.round(queueHealth.breach_rate_pct);
    if (reviewQueue.length === 0) return 0;
    return Math.round((queueSla.breach / reviewQueue.length) * 100);
  }, [queueHealth, queueSla.breach, reviewQueue.length]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <AdminSidebar />

      <main className="ml-60 flex-1 px-8 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">GigArmor / Control Tower</p>
            <h1 className="text-3xl font-black text-white">Phase 2 Command Center</h1>
            <p className="mt-1 text-sm text-slate-400">Portfolio view, queue controls, and simulation playbooks.</p>
          </div>
          <button
            onClick={refreshAll}
            disabled={refreshing}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5 disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </motion.div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(["metrics", "queue", "trend", "runs"] as const).map((panel) => (
            <button
              key={panel}
              onClick={() => retryPanel(panel)}
              disabled={retryingPanel !== null}
              className={`rounded-full border px-3 py-1 transition disabled:opacity-60 ${panelHealth[panel] === "live" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`}
            >
              {panel.charAt(0).toUpperCase() + panel.slice(1)}: {panelHealth[panel]}
              {retryingPanel === panel ? " (retrying...)" : ""}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          {[
            { label: "Active Disruptions", value: metrics.active_disruptions.toString(), sub: `${metrics.disruptions_24h} in ${metrics.window}`, tone: "border-red-500/30 bg-red-500/10 text-red-300" },
            { label: "Claims (24h)", value: metrics.claims_24h.toString(), sub: `${metrics.paid_24h} paid`, tone: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300" },
            { label: "In Review", value: metrics.review_24h.toString(), sub: `${reviewBacklogPct}% backlog`, tone: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
            { label: "Auto Approval", value: `${metrics.auto_approval_rate}%`, sub: `Avg fraud ${metrics.avg_fraud_score}`, tone: "border-violet-500/30 bg-violet-500/10 text-violet-300" },
            { label: "Paid (24h)", value: fmtCurrency(metrics.total_paid_24h), sub: `${metrics.rejected_24h} rejected`, tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
          ].map((card) => (
            <div key={card.label} className={`rounded-2xl border p-4 ${card.tone}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300/90">{card.label}</p>
              <p className="mt-2 text-2xl font-black text-white">{card.value}</p>
              <p className="mt-1 text-xs text-slate-300/80">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Breach Rate</p>
            <p className="mt-2 text-2xl font-black text-white">{breachRatePct}%</p>
            <p className="mt-1 text-xs text-slate-400">Share of queue currently in SLA breach.</p>
          </div>
          <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Projected Queue Clear</p>
            <p className="mt-2 text-2xl font-black text-white">{projectedClearMins} min</p>
            <p className="mt-1 text-xs text-slate-400">Estimate assuming 25 claims per approval sweep.</p>
          </div>
          <div className="rounded-xl border border-slate-700/70 bg-slate-900/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Latest Auto Rate</p>
            <p className="mt-2 text-2xl font-black text-white">{runRates.autoRate}%</p>
            <p className="mt-1 text-xs text-slate-400">From selected playbook run drilldown.</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Review Queue SLA</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprove(10)}
                  disabled={approving}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-60"
                >
                  {approving ? "Approving..." : "Approve 10"}
                </button>
                <button
                  onClick={() => handleApprove(25)}
                  disabled={approving}
                  className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-60"
                >
                  {approving ? "Approving..." : "Approve 25"}
                </button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-2">
                <p className="text-slate-400">Queue Size</p>
                <p className="mt-1 text-lg font-bold text-white">{queueHealth?.queue_size ?? reviewQueue.length}</p>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                <p className="text-amber-300">Warning (15m+)</p>
                <p className="mt-1 text-lg font-bold text-amber-200">{queueHealth?.warning_count ?? queueSla.warning}</p>
              </div>
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                <p className="text-red-300">Breach (30m+)</p>
                <p className="mt-1 text-lg font-bold text-red-200">{queueHealth?.breach_count ?? queueSla.breach}</p>
              </div>
            </div>

            <p className="mb-3 text-xs text-slate-500">Average queue age: {queueHealth?.avg_age_minutes ?? queueSla.avgAge} min</p>

            <div className="max-h-[380px] overflow-auto rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-900/95 text-xs text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Claim</th>
                    <th className="px-3 py-2 text-left">Worker</th>
                    <th className="px-3 py-2 text-left">Fraud</th>
                    <th className="px-3 py-2 text-left">SLA Age</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Reasons</th>
                    <th className="px-3 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewQueue.slice(0, 40).map((claim) => {
                    const ageMinutes = claim.age_minutes;
                    return (
                      <tr key={claim.id} className="border-t border-white/5 text-slate-200">
                        <td className="px-3 py-2 font-mono text-xs text-cyan-300">{claim.claim_number}</td>
                        <td className="px-3 py-2">
                          <p className="font-medium text-white">{claim.worker_name}</p>
                          <p className="text-xs text-slate-500">{claim.zone}</p>
                        </td>
                        <td className="px-3 py-2 text-xs">{(claim.fraud_score * 100).toFixed(1)}%</td>
                        <td className={`px-3 py-2 text-xs font-semibold ${slaTone(ageMinutes)}`}>{ageMinutes} min</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone(claim.status)}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="relative px-3 py-2">
                          {claim.decision_reasons.length > 0 ? (
                            <>
                              <button
                                onMouseEnter={() => setHoveredReasonClaimId(claim.id)}
                                onMouseLeave={() => setHoveredReasonClaimId((prev) => (prev === claim.id ? null : prev))}
                                className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300"
                              >
                                {claim.decision_reasons.length} reason{claim.decision_reasons.length > 1 ? "s" : ""}
                              </button>
                              {hoveredReasonClaimId === claim.id && (
                                <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-white/10 bg-slate-950/95 p-2 shadow-xl">
                                  <p className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">Decision reasons</p>
                                  <div className="space-y-1">
                                    {claim.decision_reasons.map((reason) => (
                                      <p key={reason} className="rounded bg-white/5 px-2 py-1 text-[11px] text-slate-300">
                                        {formatReason(reason)}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-600">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQueueClaimAction(claim.id, "approve")}
                              disabled={rowActionId === claim.id}
                              className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleQueueClaimAction(claim.id, "reject")}
                              disabled={rowActionId === claim.id}
                              className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && reviewQueue.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                        Review queue is empty.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-bold text-white">Playbook Runs</h2>
            <p className="text-sm text-slate-400">Run pre-configured disruption scenarios to stress-test the automation engine.</p>

            <div className="space-y-3">
              {PLAYBOOKS.map((playbook) => (
                <div key={playbook.id} className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{playbook.name}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{playbook.summary}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {playbook.payload.city} - {playbook.payload.zone} - {playbook.payload.event_type}
                      </p>
                    </div>
                    <button
                      onClick={() => runPlaybook(playbook)}
                      disabled={runningPlaybookId !== null}
                      className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-60"
                    >
                      {runningPlaybookId === playbook.id ? "Running..." : "Run"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {lastResult && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
                <p className="font-semibold text-emerald-300">Latest run completed</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-200">
                  <p>Disruption: {lastResult.disruption_id.slice(0, 8)}...</p>
                  <p>Claims created: {lastResult.created_claims}</p>
                  <p>Auto paid: {lastResult.auto_paid_count}</p>
                  <p>Review: {lastResult.review_count}</p>
                  <p>Rejected: {lastResult.rejected_count}</p>
                  <p>Total payout: {fmtCurrency(lastResult.total_payout)}</p>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <h3 className="text-sm font-semibold text-white">Run History</h3>
              <div className="mt-3 space-y-2">
                {runHistory.slice(0, 5).map((run) => (
                  <button
                    key={run.id}
                    onClick={() => setSelectedRunId(run.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${selectedRunId === run.id ? "border-cyan-400/40 bg-cyan-500/10 text-slate-100" : "border-white/10 text-slate-300 hover:border-white/20"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-white">{formatReason(run.event_type)} - {run.city}</p>
                      <p className="text-slate-500">{timeAgo(run.created_at)}</p>
                    </div>
                    <p className="mt-1 text-slate-400">Claims {run.created_claims} | Auto {run.auto_paid_count} | Review {run.review_count} | Rejected {run.rejected_count}</p>
                    <p className="mt-0.5 text-emerald-300">Payout {fmtCurrency(run.total_payout)}</p>
                  </button>
                ))}
                {runHistory.length === 0 && <p className="text-xs text-slate-500">No runs yet. Execute a playbook to build run history.</p>}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <h3 className="text-sm font-semibold text-white">Run Drilldown</h3>
              {selectedRun ? (
                <div className="mt-3 space-y-2 text-xs">
                  <p className="text-slate-300">Scenario: <span className="font-semibold text-white">{formatReason(selectedRun.event_type)} in {selectedRun.zone}, {selectedRun.city}</span></p>
                  <p className="text-slate-400">Executed {timeAgo(selectedRun.created_at)} with {selectedRun.created_claims} generated claims.</p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-2">
                      <p className="text-[10px] text-emerald-300">Auto</p>
                      <p className="text-sm font-semibold text-white">{runRates.autoRate}%</p>
                    </div>
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-2">
                      <p className="text-[10px] text-amber-300">Review</p>
                      <p className="text-sm font-semibold text-white">{runRates.reviewRate}%</p>
                    </div>
                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-2">
                      <p className="text-[10px] text-red-300">Reject</p>
                      <p className="text-sm font-semibold text-white">{runRates.rejectRate}%</p>
                    </div>
                  </div>
                  <p className="text-slate-400">Run payout impact: <span className="font-semibold text-emerald-300">{fmtCurrency(selectedRun.total_payout)}</span></p>
                  <p className="text-slate-500">Signal confidence: {(selectedRun.signal_confidence * 100).toFixed(0)}% | Avg fraud: {(selectedRun.avg_fraud_score * 100).toFixed(1)}%</p>

                  <div className="mt-2 rounded-lg border border-white/10 bg-slate-900/60 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Impact timeline</p>
                    <div className="mt-2 space-y-2">
                      {(runImpact?.timeline || []).map((item, idx) => (
                        <div key={`${item.stage}-${idx}`} className="flex items-center gap-2 text-[11px] text-slate-300">
                          <span className={`h-2 w-2 rounded-full ${item.stage === "auto_paid" ? "bg-emerald-400" : item.stage === "manual_review" ? "bg-amber-400" : item.stage === "rejected" ? "bg-red-400" : "bg-cyan-400"}`} />
                          {idx + 1}. {formatReason(item.stage)}: {item.count}
                        </div>
                      ))}
                    </div>

                    <p className="mt-3 text-[10px] uppercase tracking-wide text-slate-500">Top reason codes</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(runImpact?.reason_breakdown || selectedRun.top_reasons || []).slice(0, 6).map((reason) => (
                        <span key={reason.reason} className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                          {formatReason(reason.reason)} ({reason.count})
                        </span>
                      ))}
                      {(runImpact?.reason_breakdown || selectedRun.top_reasons || []).length === 0 && (
                        <span className="text-[10px] text-slate-500">No reason breakdown available.</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500">Run a playbook to unlock drilldown analytics.</p>
              )}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-bold text-white">7-Day Throughput Trend</h2>
            <p className="mt-1 text-sm text-slate-400">Claims load and payout velocity for ops planning.</p>
            <div className="mt-4 space-y-2">
              {claimsTrend.map((point) => (
                <div key={point.day} className="grid grid-cols-[48px_1fr_140px] items-center gap-3 text-xs">
                  <span className="text-slate-400">{point.day}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-400/80"
                      style={{ width: `${Math.max(6, Math.round((point.claims / trendMaxClaims) * 100))}%` }}
                    />
                  </div>
                  <span className="text-right text-slate-300">{point.claims} claims | {fmtCurrency(point.payout)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-bold text-white">Escalation Lane (SLA Breach)</h2>
            <p className="mt-1 text-sm text-slate-400">Claims older than 30 minutes are highlighted for immediate action.</p>

            <div className="mt-4 space-y-2">
              {breachClaims.map((claim) => (
                <div key={claim.id} className="rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-3 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-cyan-300">{claim.claim_number}</p>
                      <p className="mt-0.5 font-semibold text-white">{claim.worker_name}</p>
                      <p className="text-slate-400">{claim.zone} | {(claim.fraud_score * 100).toFixed(1)}% fraud score</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-300">{claim.age_minutes} min</p>
                      <p className="text-slate-500">SLA breached</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleQueueClaimAction(claim.id, "approve")}
                      disabled={rowActionId === claim.id}
                      className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleQueueClaimAction(claim.id, "reject")}
                      disabled={rowActionId === claim.id}
                      className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {breachClaims.length === 0 && (
                <div className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-8 text-center text-xs text-slate-500">
                  No SLA breaches right now.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
