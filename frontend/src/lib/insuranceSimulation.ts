import type { GigWorker } from "./workerData";
import { evaluateWorker } from "./underwritingEngine";
import type { UnderwritingResult } from "./underwritingEngine";
import { calculatePremium } from "./pricingEngine";
import type { PremiumResult } from "./pricingEngine";
import { checkTrigger } from "./triggerEngine";
import type { TriggerResult } from "./triggerEngine";
import { processPayout, resetProcessedWorkers } from "./claimsEngine";
import type { PayoutResult } from "./claimsEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SimulationResult {
  worker: GigWorker;
  underwritingResult: UnderwritingResult;
  premiumResult: PremiumResult;
  triggerResult: TriggerResult;
  payoutResult: PayoutResult;
}

// ─── Core Simulation Flow ──────────────────────────────────────────────────────

/**
 * Runs the full end-to-end insurance pipeline for a single worker:
 * Underwriting → Pricing → Trigger → Claims/Payout
 */
export function runInsuranceSimulation(worker: GigWorker): SimulationResult {
  const underwritingResult = evaluateWorker(worker);
  const premiumResult      = calculatePremium(worker, underwritingResult);
  const triggerResult      = checkTrigger(worker.city);
  const payoutResult       = processPayout(worker, underwritingResult, triggerResult);

  return { worker, underwritingResult, premiumResult, triggerResult, payoutResult };
}

/**
 * Same as runInsuranceSimulation but forces the trigger to true.
 * Used for demo / "Simulate Trigger" button.
 */
export function runSimulationWithForcedTrigger(worker: GigWorker): SimulationResult {
  const underwritingResult = evaluateWorker(worker);
  const premiumResult      = calculatePremium(worker, underwritingResult);

  // Build a forced trigger result
  const forcedTrigger: TriggerResult = {
    city:        worker.city,
    trigger:     true,
    triggerType: worker.city === "Delhi" ? "AQI" : "RAIN",
    value:       worker.city === "Delhi" ? 430 : 115,
    severity:    "medium",
    timestamp:   new Date().toISOString(),
    source:      worker.city === "Delhi" ? "SIMULATED_CPCB" : "SIMULATED_WEATHER",
  };

  // Reset so the batch fraud guard doesn't block the forced demo
  resetProcessedWorkers();
  const payoutResult = processPayout(worker, underwritingResult, forcedTrigger);

  return { worker, underwritingResult, premiumResult, triggerResult: forcedTrigger, payoutResult };
}

/**
 * Resets all session state and returns a fresh simulation with a clean fraud guard.
 */
export function resetAndRun(worker: GigWorker): SimulationResult {
  resetProcessedWorkers();
  return runInsuranceSimulation(worker);
}
