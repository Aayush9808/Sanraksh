import type { GigWorker } from "./workerData";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UnderwritingResult {
  worker_id: string;
  eligible: boolean;
  eligibilityReason: string;
  riskScore: number;
  riskTier: "low" | "medium" | "high";
  explanation: string[];
}

// ─── Risk Factors ─────────────────────────────────────────────────────────────

interface RiskFactor {
  condition: (w: GigWorker) => boolean;
  points: number;
  label: string;
}

const RISK_FACTORS: RiskFactor[] = [
  {
    condition: (w) => w.aqi_exposure_days > 12,
    points: 2,
    label: "High AQI exposure",
  },
  {
    condition: (w) => w.weather_exposure_days > 7,
    points: 2,
    label: "High weather exposure",
  },
  {
    condition: (w) => w.hours_per_day > 8,
    points: 1,
    label: "Long working hours",
  },
  {
    condition: (w) => w.city_tier === "Tier 1",
    points: 1,
    label: "Tier 1 city risk",
  },
  {
    condition: (w) => w.days_active_last_30 > 25,
    points: 1,
    label: "Heavy usage (25+ active days)",
  },
];

// ─── Core Engine ──────────────────────────────────────────────────────────────

export function evaluateWorker(worker: GigWorker): UnderwritingResult {
  const eligible = worker.days_active_last_30 >= 7;
  const eligibilityReason = eligible ? "Active worker" : "Low activity";

  let riskScore = 0;
  const explanation: string[] = [];

  for (const factor of RISK_FACTORS) {
    if (factor.condition(worker)) {
      riskScore += factor.points;
      explanation.push(factor.label);
    }
  }

  const riskTier: "low" | "medium" | "high" =
    riskScore <= 2 ? "low" :
    riskScore <= 4 ? "medium" :
    "high";

  return {
    worker_id: worker.worker_id,
    eligible,
    eligibilityReason,
    riskScore,
    riskTier,
    explanation,
  };
}

export function evaluateAllWorkers(dataset: GigWorker[]): UnderwritingResult[] {
  return dataset.map(evaluateWorker);
}
