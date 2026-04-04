import type { GigWorker } from "./workerData";
import type { UnderwritingResult } from "./underwritingEngine";
import type { PremiumResult } from "./pricingEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionPolicy {
  plan: string;
  weeklyPremium: number;
  coveragePerDay: number;
  triggersCovered: string[];
  issuedAt: string;
}

export interface WorkerSession {
  userId: string;
  worker: GigWorker;
  underwritingResult: UnderwritingResult;
  premiumResult: PremiumResult;
  policy: SessionPolicy;
  rawEarningsBand: string;
}

// ─── Storage key ─────────────────────────────────────────────────────────────

const SESSION_KEY = "giginsur_session";

// ─── Backward-compat migration (gigarmor → giginsur) ─────────────────────────

if (typeof window !== "undefined") {
  try {
    const old = localStorage.getItem("gigarmor_session");
    if (old && !localStorage.getItem(SESSION_KEY)) {
      localStorage.setItem(SESSION_KEY, old);
      localStorage.removeItem("gigarmor_session");
    }
  } catch {}
}

// ─── API ─────────────────────────────────────────────────────────────────────

export function saveSession(session: WorkerSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // storage may be unavailable (private browsing quota, etc.)
  }
}

export function loadSession(): WorkerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkerSession;
  } catch {
    return null;
  }
}

/**
 * Returns the session only when it belongs to the given userId.
 * If the session belongs to a different user it is cleared and null is returned,
 * preventing cross-user data leakage.
 */
export function loadSessionForUser(userId: string): WorkerSession | null {
  const session = loadSession();
  if (!session) return null;
  if (session.userId !== userId) {
    clearSession();
    return null;
  }
  return session;
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}
