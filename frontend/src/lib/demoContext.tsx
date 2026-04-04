"use client";
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import type { GigWorker } from "./workerData";
import type { UnderwritingResult } from "./underwritingEngine";
import type { PremiumResult } from "./pricingEngine";
import type { TriggerResult } from "./triggerEngine";
import type { PayoutResult } from "./claimsEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DemoWorkerInput {
  name: string;
  city: string;
  platform: string;
  hoursPerDay: number;
  daysActive: number;
  avgDailyIncome: number;
}

export interface DemoPolicy {
  plan: "Standard";
  coveragePerDay: number;
  triggersCovered: string[];
  issuedAt: string;
}

export interface DemoState {
  currentStep: number;           // 1–7
  workerInput: DemoWorkerInput | null;
  worker: GigWorker | null;
  underwritingResult: UnderwritingResult | null;
  premiumResult: PremiumResult | null;
  policy: DemoPolicy | null;
  triggerResult: TriggerResult | null;
  payoutResult: PayoutResult | null;
  log: string[];                 // running console-style log
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_STEP"; step: number }
  | { type: "SET_WORKER_INPUT"; input: DemoWorkerInput }
  | { type: "SET_WORKER"; worker: GigWorker }
  | { type: "SET_UNDERWRITING"; result: UnderwritingResult }
  | { type: "SET_PREMIUM"; result: PremiumResult }
  | { type: "SET_POLICY"; policy: DemoPolicy }
  | { type: "SET_TRIGGER"; result: TriggerResult }
  | { type: "SET_PAYOUT"; result: PayoutResult }
  | { type: "APPEND_LOG"; msg: string }
  | { type: "RESET" };

const INITIAL: DemoState = {
  currentStep: 1,
  workerInput: null,
  worker: null,
  underwritingResult: null,
  premiumResult: null,
  policy: null,
  triggerResult: null,
  payoutResult: null,
  log: [],
};

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "SET_STEP":           return { ...state, currentStep: action.step };
    case "SET_WORKER_INPUT":   return { ...state, workerInput: action.input };
    case "SET_WORKER":         return { ...state, worker: action.worker };
    case "SET_UNDERWRITING":   return { ...state, underwritingResult: action.result };
    case "SET_PREMIUM":        return { ...state, premiumResult: action.result };
    case "SET_POLICY":         return { ...state, policy: action.policy };
    case "SET_TRIGGER":        return { ...state, triggerResult: action.result };
    case "SET_PAYOUT":         return { ...state, payoutResult: action.result };
    case "APPEND_LOG":         return { ...state, log: [...state.log, action.msg] };
    case "RESET":              return { ...INITIAL, log: [] };
    default:                   return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface DemoContextValue {
  state: DemoState;
  dispatch: React.Dispatch<Action>;
  nextStep: () => void;
  prevStep: () => void;
  appendLog: (msg: string) => void;
  reset: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const nextStep    = useCallback(() => dispatch({ type: "SET_STEP", step: Math.min(state.currentStep + 1, 7) }), [state.currentStep]);
  const prevStep    = useCallback(() => dispatch({ type: "SET_STEP", step: Math.max(state.currentStep - 1, 1) }), [state.currentStep]);
  const appendLog   = useCallback((msg: string) => dispatch({ type: "APPEND_LOG", msg: `[${new Date().toLocaleTimeString()}] ${msg}` }), []);
  const reset       = useCallback(() => dispatch({ type: "RESET" }), []);

  return (
    <DemoContext.Provider value={{ state, dispatch, nextStep, prevStep, appendLog, reset }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoContext(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemoContext must be used inside DemoProvider");
  return ctx;
}
