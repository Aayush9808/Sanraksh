import type { GigWorker } from "./workerData";
import type { UnderwritingResult } from "./underwritingEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PremiumResult {
  worker_id: string;
  riskTier: "low" | "medium" | "high";
  basePremium: number;
  adjustedPremium: number;
  finalPremium: number;
  breakdown: string[];
}

export interface BatchPremiumResult {
  premiums: PremiumResult[];
  bcr: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TRIGGER_PROBABILITY: Record<"low" | "medium" | "high", number> = {
  low:    0.1,
  medium: 0.2,
  high:   0.3,
};

const PAYOUT_RATE = 0.3; // payout = avg_daily_income * exposure_days * 0.3
const MIN_PREMIUM = 20;
const MAX_PREMIUM = 50;

// ─── Core Engine ──────────────────────────────────────────────────────────────

export function calculatePremium(
  worker: GigWorker,
  underwritingResult: UnderwritingResult
): PremiumResult {
  const { riskTier } = underwritingResult;
  const breakdown: string[] = [];

  const triggerProbability = TRIGGER_PROBABILITY[riskTier];
  const exposureDays = Math.max(
    worker.weather_exposure_days,
    worker.aqi_exposure_days
  );

  breakdown.push(`Risk tier: ${riskTier}`);
  breakdown.push(`Trigger probability: ${triggerProbability}`);
  breakdown.push(`Exposure days considered: ${exposureDays}`);

  const basePremium = triggerProbability * worker.avg_daily_income * exposureDays;

  let adjustedPremium = basePremium;

  // +10% for Tier 1 city
  if (worker.city_tier === "Tier 1") {
    adjustedPremium *= 1.1;
    breakdown.push("Tier 1 city adjustment");
  }

  // +10% for high risk workers
  if (riskTier === "high") {
    adjustedPremium *= 1.1;
    breakdown.push("High risk multiplier applied");
  }

  // Safety cap before final constraints
  if (adjustedPremium > 1000) {
    adjustedPremium = 1000;
  }

  // Apply floor and ceiling, then round
  const finalPremium = Math.round(
    Math.min(MAX_PREMIUM, Math.max(MIN_PREMIUM, adjustedPremium))
  );

  return {
    worker_id: worker.worker_id,
    riskTier,
    basePremium:      Math.round(basePremium * 100) / 100,
    adjustedPremium:  Math.round(adjustedPremium),
    finalPremium,
    breakdown,
  };
}

// ─── Batch Function ───────────────────────────────────────────────────────────

export function calculateAllPremiums(
  workers: GigWorker[],
  underwritingResults: UnderwritingResult[]
): BatchPremiumResult {
  const resultMap = new Map(underwritingResults.map((r) => [r.worker_id, r]));

  const premiums = workers
    .filter((w) => resultMap.has(w.worker_id))
    .map((w) => calculatePremium(w, resultMap.get(w.worker_id)!));

  // BCR = total payout estimate / total premium collected (eligible workers only)
  const eligibleIds = new Set(underwritingResults.filter((r) => r.eligible).map((r) => r.worker_id));
  const eligibleWorkers = workers.filter((w) => eligibleIds.has(w.worker_id));

  const totalPremium = premiums
    .filter((p) => eligibleIds.has(p.worker_id))
    .reduce((sum, p) => sum + p.finalPremium, 0);

  const totalPayout = eligibleWorkers.reduce((sum, w) => {
    const exposureDays = Math.max(w.weather_exposure_days, w.aqi_exposure_days);
    return sum + w.avg_daily_income * exposureDays * PAYOUT_RATE;
  }, 0);

  const bcr = totalPremium > 0
    ? Math.round((totalPayout / totalPremium) * 100) / 100
    : 0;

  return { premiums, bcr };
}
