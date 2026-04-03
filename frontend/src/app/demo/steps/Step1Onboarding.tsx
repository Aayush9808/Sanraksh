"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDemoContext } from "@/lib/demoContext";
import type { DemoWorkerInput } from "@/lib/demoContext";

const CITIES = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune"] as const;
const PLATFORMS = ["Swiggy", "Zomato", "Blinkit", "Uber", "Ola", "Porter"] as const;

export function Step1Onboarding() {
  const { state, dispatch, nextStep, appendLog } = useDemoContext();
  const saved = state.workerInput;

  const [name, setName]               = useState(saved?.name ?? "Rahul Sharma");
  const [city, setCity]               = useState<string>(saved?.city ?? "Delhi");
  const [platform, setPlatform]       = useState(saved?.platform ?? "Swiggy");
  const [hoursPerDay, setHoursPerDay] = useState(saved?.hoursPerDay ?? 8);
  const [daysActive, setDaysActive]   = useState(saved?.daysActive ?? 22);
  const [income, setIncome]           = useState(saved?.avgDailyIncome ?? 850);

  const isValid = name.trim().length >= 2 && city && platform && hoursPerDay > 0 && daysActive > 0 && income > 0;

  function handleNext() {
    const input: DemoWorkerInput = {
      name: name.trim(),
      city,
      platform,
      hoursPerDay,
      daysActive,
      avgDailyIncome: income,
    };
    dispatch({ type: "SET_WORKER_INPUT", input });
    appendLog(`Worker profile captured: ${name.trim()} | ${city} | ${platform}`);
    nextStep();
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label">Full Name</label>
          <input className="field" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" />
        </div>
        <div>
          <label className="field-label">City</label>
          <select className="field" value={city} onChange={e => setCity(e.target.value)}>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Platform</label>
          <select className="field" value={platform} onChange={e => setPlatform(e.target.value)}>
            {PLATFORMS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Hours per Day</label>
          <input className="field" type="number" min={1} max={16} value={hoursPerDay} onChange={e => setHoursPerDay(+e.target.value)} />
        </div>
        <div>
          <label className="field-label">Active Days (last 30)</label>
          <input className="field" type="number" min={0} max={30} value={daysActive} onChange={e => setDaysActive(+e.target.value)} />
        </div>
        <div>
          <label className="field-label">Avg Daily Income (₹)</label>
          <input className="field" type="number" min={100} value={income} onChange={e => setIncome(+e.target.value)} />
        </div>
      </div>

      <button
        disabled={!isValid}
        onClick={handleNext}
        className="btn-navy w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        Confirm Profile & Continue →
      </button>
    </div>
  );
}
