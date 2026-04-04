import type { GigWorker } from "./workerData";
import type { UnderwritingResult } from "./underwritingEngine";
import type { TriggerResult } from "./triggerEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PayoutStatus = "SUCCESS" | "FAILED";

export interface PayoutResult {
  payoutId: string;
  worker_id: string;
  payoutAmount: number;
  status: PayoutStatus;
  reason: string;
  triggerType: string | null;
  triggerValue: number | null;
  severity: string | null;
  paymentMethod: "UPI";
  timestamp: string;
}

// ─── Fraud Guard ──────────────────────────────────────────────────────────────
// In-memory set of worker IDs that have already received a payout this session.
// Prevents duplicate payouts for the same worker within a single run.

const processedWorkers = new Set<string>();

export function resetProcessedWorkers(): void {
  processedWorkers.clear();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TRIGGER_DAYS = 1;
const PAYOUT_RATE  = 0.3;

function buildPayoutId(worker_id: string, timestamp: string): string {
  return `PAY_${worker_id}_${timestamp}`;
}

function failedResult(
  worker_id: string,
  timestamp: string,
  reason: string
): PayoutResult {
  const payoutId = buildPayoutId(worker_id, timestamp);
  console.log(`❌ Payout failed | Worker: ${worker_id} | Reason: ${reason}`);
  return {
    payoutId,
    worker_id,
    payoutAmount: 0,
    status: "FAILED",
    reason,
    triggerType: null,
    triggerValue: null,
    severity: null,
    paymentMethod: "UPI",
    timestamp,
  };
}

// ─── Core Engine ──────────────────────────────────────────────────────────────

export function processPayout(
  worker: GigWorker,
  underwritingResult: UnderwritingResult,
  triggerResult: TriggerResult
): PayoutResult {
  const timestamp = new Date().toISOString();

  // Fraud check: city mismatch
  if (worker.city !== triggerResult.city) {
    return failedResult(
      worker.worker_id,
      timestamp,
      `Rejected: worker city (${worker.city}) does not match trigger city (${triggerResult.city})`
    );
  }

  // Fraud check: low-activity worker
  if (worker.days_active_last_30 < 7) {
    return failedResult(
      worker.worker_id,
      timestamp,
      "Rejected: insufficient activity (< 7 days active)"
    );
  }

  // Fraud check: duplicate payout
  if (processedWorkers.has(worker.worker_id)) {
    return failedResult(
      worker.worker_id,
      timestamp,
      "Rejected: duplicate payout attempt"
    );
  }

  // Eligibility check
  if (!underwritingResult.eligible) {
    return failedResult(
      worker.worker_id,
      timestamp,
      `Rejected: worker not eligible (${underwritingResult.eligibilityReason})`
    );
  }

  // Trigger check
  if (!triggerResult.trigger) {
    return failedResult(
      worker.worker_id,
      timestamp,
      `No active trigger for ${triggerResult.city}`
    );
  }

  // All checks passed — process payout
  const payoutAmount = Math.round(
    worker.avg_daily_income * TRIGGER_DAYS * PAYOUT_RATE
  );

  const { triggerType, value: triggerValue, severity } = triggerResult;

  let reason = `Trigger in ${triggerResult.city} | ${triggerType}: ${triggerValue} | Severity: ${severity}`;
  if (severity === "high") {
    reason += " — High severity event — full payout triggered";
  }

  processedWorkers.add(worker.worker_id);

  const payoutId = buildPayoutId(worker.worker_id, timestamp);

  console.log(
    `✅ Payout processed | Worker: ${worker.worker_id} | Amount: ${payoutAmount} | Trigger: ${triggerType} | Severity: ${severity}`
  );

  return {
    payoutId,
    worker_id: worker.worker_id,
    payoutAmount,
    status: "SUCCESS",
    reason,
    triggerType: triggerType ?? null,
    triggerValue,
    severity,
    paymentMethod: "UPI",
    timestamp,
  };
}

// ─── Batch Function ───────────────────────────────────────────────────────────

export function processAllPayouts(
  workers: GigWorker[],
  underwritingResults: UnderwritingResult[],
  triggers: TriggerResult[]
): PayoutResult[] {
  const underwritingMap = new Map(underwritingResults.map((r) => [r.worker_id, r]));

  // Map trigger results by city for quick lookup
  const triggerMap = new Map(triggers.map((t) => [t.city, t]));

  return workers
    .filter((w) => underwritingMap.has(w.worker_id))
    .map((w) => {
      const underwritingResult = underwritingMap.get(w.worker_id)!;
      const triggerResult = triggerMap.get(w.city);
      const timestamp = new Date().toISOString();

      // No trigger record for this worker's city
      if (!triggerResult) {
        return failedResult(
          w.worker_id,
          timestamp,
          `No trigger data available for ${w.city}`
        );
      }

      return processPayout(w, underwritingResult, triggerResult);
    });
}
