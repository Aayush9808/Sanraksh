"use client";
import { motion, AnimatePresence } from "framer-motion";
import { DemoProvider, useDemoContext } from "@/lib/demoContext";
import { Step1Onboarding }  from "@/app/demo/steps/Step1Onboarding";
import { Step2Underwriting } from "@/app/demo/steps/Step2Underwriting";
import { Step3Pricing }      from "@/app/demo/steps/Step3Pricing";
import { Step4Policy }       from "@/app/demo/steps/Step4Policy";
import { Step5Trigger }      from "@/app/demo/steps/Step5Trigger";
import { Step6Claims }       from "@/app/demo/steps/Step6Claims";
import { Step7Summary }      from "@/app/demo/steps/Step7Summary";

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: "Onboarding",   subtitle: "Enter worker profile"   },
  { num: 2, label: "Underwriting", subtitle: "Risk assessment"        },
  { num: 3, label: "Pricing",      subtitle: "Premium calculation"    },
  { num: 4, label: "Policy",       subtitle: "Coverage binding"       },
  { num: 5, label: "Trigger",      subtitle: "Parametric signal"      },
  { num: 6, label: "Claims",       subtitle: "Payout processing"      },
  { num: 7, label: "Summary",      subtitle: "Final output"           },
] as const;

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar() {
  const { state } = useDemoContext();
  const cur = state.currentStep;

  return (
    <div className="w-full mb-8">
      {/* Desktop */}
      <div className="hidden md:flex items-center">
        {STEPS.map((s, i) => {
          const done   = cur > s.num;
          const active = cur === s.num;
          return (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 flex-shrink-0 ${
                  done   ? "bg-emerald-500 text-white shadow-sm" :
                  active ? "bg-[#0F2044] text-white ring-4 ring-[#0F2044]/15 shadow-md scale-110" :
                            "bg-slate-100 text-slate-400"
                }`}>
                  {done ? "✓" : s.num}
                </div>
                <div className={`mt-1.5 text-center text-[11px] font-semibold transition-colors whitespace-nowrap ${
                  active ? "text-[#0F2044]" : done ? "text-emerald-600" : "text-slate-400"
                }`}>
                  {s.label}
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-500 ${cur > s.num ? "bg-emerald-400" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="font-bold text-[#0F2044]">
            Step {cur} of 7 — {STEPS[cur - 1].label}
          </span>
          <span>{Math.round(((cur - 1) / 6) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#0F2044] rounded-full"
            initial={false}
            animate={{ width: `${((cur - 1) / 6) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

function ActivityLog() {
  const { state } = useDemoContext();
  if (state.log.length === 0) return null;
  return (
    <div className="panel-inset rounded-xl p-3 mt-4 max-h-28 overflow-y-auto space-y-0.5">
      {state.log.map((entry, i) => (
        <p key={i} className="text-xs font-mono text-slate-500 leading-relaxed">{entry}</p>
      ))}
    </div>
  );
}

// ─── Back nav ─────────────────────────────────────────────────────────────────

function BackButton() {
  const { state, prevStep } = useDemoContext();
  const cur = state.currentStep;
  if (cur <= 1 || cur === 7) return null;
  return (
    <button
      onClick={prevStep}
      className="text-sm text-slate-400 hover:text-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
    >
      ← Back
    </button>
  );
}

// ─── Step content ─────────────────────────────────────────────────────────────

function StepContent() {
  const { state } = useDemoContext();
  const map: Record<number, React.ReactNode> = {
    1: <Step1Onboarding />,
    2: <Step2Underwriting />,
    3: <Step3Pricing />,
    4: <Step4Policy />,
    5: <Step5Trigger />,
    6: <Step6Claims />,
    7: <Step7Summary />,
  };
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
      >
        {map[state.currentStep]}
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Inner shell (no page wrapper — lives inside dashboard layout) ─────────────

function SimulationShell() {
  const { state } = useDemoContext();
  const stepMeta = STEPS[state.currentStep - 1];

  return (
    <div className="max-w-3xl">
      {/* Dashboard-style header banner */}
      <div className="rounded-2xl bg-[#0F2044] p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">End-to-end prototype</p>
          <h1 className="text-white font-extrabold text-xl tracking-tight">Insurance Simulation</h1>
          <p className="text-blue-200 text-sm mt-0.5">Onboarding → Underwriting → Pricing → Policy → Trigger → Payout</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Step {state.currentStep} of 7
        </div>
      </div>

      {/* Progress bar */}
      <ProgressBar />

      {/* Step card */}
      <div className="panel-raised p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="lbl mb-0.5">Step {state.currentStep} of 7</p>
            <h2 className="font-extrabold text-slate-900 text-xl">{stepMeta.label}</h2>
            <p className="text-slate-400 text-sm mt-0.5">{stepMeta.subtitle}</p>
          </div>
          <BackButton />
        </div>
        <StepContent />
      </div>

      {/* Activity log */}
      <ActivityLog />
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────

export default function SimulationFlow() {
  return (
    <DemoProvider>
      <SimulationShell />
    </DemoProvider>
  );
}
