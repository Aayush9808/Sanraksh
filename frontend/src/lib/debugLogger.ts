/**
 * Sanraksh Debug Logger
 * Structured console logging for end-to-end flow verification.
 * All output is console-only — no UI side-effects.
 */

const PREFIX = {
  step:  "%c[STEP]",
  data:  "%c[DATA]",
  error: "%c[ERROR]",
  warn:  "%c[WARN]",
  info:  "%c[INFO]",
} as const;

const STYLE = {
  step:  "color:#0F2044;font-weight:bold;",
  data:  "color:#0369a1;font-weight:normal;",
  error: "color:#dc2626;font-weight:bold;",
  warn:  "color:#d97706;font-weight:bold;",
  info:  "color:#6b7280;font-weight:normal;",
} as const;

export function logStep(stepName: string, data?: unknown): void {
  console.groupCollapsed(`${PREFIX.step} ${stepName}`, STYLE.step);
  if (data !== undefined) {
    console.log(`${PREFIX.data}`, STYLE.data, data);
  }
  console.groupEnd();
}

export function logError(context: string, err?: unknown): void {
  console.group(`${PREFIX.error} ${context}`, STYLE.error);
  if (err !== undefined) {
    console.error(err);
  }
  console.groupEnd();
}

export function logInfo(message: string, data?: unknown): void {
  if (data !== undefined) {
    console.log(`${PREFIX.info} ${message}`, STYLE.info, data);
  } else {
    console.log(`${PREFIX.info} ${message}`, STYLE.info);
  }
}

export function logWarn(message: string, data?: unknown): void {
  if (data !== undefined) {
    console.warn(`${PREFIX.warn} ${message}`, STYLE.warn, data);
  } else {
    console.warn(`${PREFIX.warn} ${message}`, STYLE.warn);
  }
}

/**
 * Dumps all Sanraksh localStorage keys to the console.
 * Call on app load to verify persistence state.
 */
export function logStorageState(): void {
  if (typeof window === "undefined") return;

  const KEYS = ["sanraksh_users", "sanraksh_current_user", "sanraksh_session", "token", "role"];
  const state: Record<string, unknown> = {};

  for (const key of KEYS) {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      state[key] = "(not set)";
    } else {
      try {
        state[key] = JSON.parse(raw);
      } catch {
        state[key] = raw;
      }
    }
  }

  console.group("%c[STORAGE] localStorage snapshot", "color:#7c3aed;font-weight:bold;");
  for (const [k, v] of Object.entries(state)) {
    console.log(`  ${k}:`, v);
  }
  console.groupEnd();
}
