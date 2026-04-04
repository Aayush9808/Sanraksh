// ─── Types ────────────────────────────────────────────────────────────────────

export type TriggerType = "AQI" | "RAIN" | null;
export type Severity = "low" | "medium" | "high";
export type TriggerSource = "SIMULATED_CPCB" | "SIMULATED_WEATHER";

export interface TriggerResult {
  city: string;
  trigger: boolean;
  triggerType: TriggerType;
  value: number;
  severity: Severity;
  timestamp: string;
  source: TriggerSource | null;
}

// ─── Simulated Sensor APIs ────────────────────────────────────────────────────
// Returns realistic random values mimicking live environmental data feeds.

export function getAQI(city: string): number {
  // Delhi skews higher (200–500), other cities are moderate (100–300)
  if (city === "Delhi") {
    return Math.floor(Math.random() * 301) + 200; // 200–500
  }
  return Math.floor(Math.random() * 201) + 100;   // 100–300
}

export function getRainfall(city: string): number {
  // Mumbai skews heavier (20–150mm), other cities are lighter (0–80mm)
  if (city === "Mumbai") {
    return Math.floor(Math.random() * 131) + 20;  // 20–150 mm
  }
  return Math.floor(Math.random() * 81);           // 0–80 mm
}

// ─── Trigger Thresholds ───────────────────────────────────────────────────────

const AQI_THRESHOLD = 400;       // Delhi AQI trigger
const RAINFALL_THRESHOLD = 100;  // Mumbai rainfall trigger (mm)

// ─── Severity Classifier ─────────────────────────────────────────────────────

export function getSeverity(type: TriggerType, value: number): Severity {
  if (type === "AQI") {
    if (value > 450) return "high";
    if (value > 420) return "medium";
    return "low";
  }
  if (type === "RAIN") {
    if (value > 140) return "high";
    if (value > 120) return "medium";
    return "low";
  }
  return "low";
}

// ─── Core Engine ──────────────────────────────────────────────────────────────

export function checkTrigger(city: string): TriggerResult {
  const timestamp = new Date().toISOString();

  if (city === "Delhi") {
    const aqi = getAQI(city);
    const triggered = aqi > AQI_THRESHOLD;
    const triggerType: TriggerType = triggered ? "AQI" : null;
    const severity = triggered ? getSeverity("AQI", aqi) : "low";

    if (triggered) {
      console.log(`Trigger fired in ${city} | Type: AQI | Value: ${aqi} | Severity: ${severity}`);
    }

    return { city, trigger: triggered, triggerType, value: aqi, severity, timestamp, source: triggered ? "SIMULATED_CPCB" : null };
  }

  if (city === "Mumbai") {
    const rainfall = getRainfall(city);
    const triggered = rainfall > RAINFALL_THRESHOLD;
    const triggerType: TriggerType = triggered ? "RAIN" : null;
    const severity = triggered ? getSeverity("RAIN", rainfall) : "low";

    if (triggered) {
      console.log(`Trigger fired in ${city} | Type: RAIN | Value: ${rainfall} | Severity: ${severity}`);
    }

    return { city, trigger: triggered, triggerType, value: rainfall, severity, timestamp, source: triggered ? "SIMULATED_WEATHER" : null };
  }

  // Other cities: no parametric trigger defined yet; value = -1 indicates no data
  return { city, trigger: false, triggerType: null, value: -1, severity: "low", timestamp, source: null };
}

// ─── Batch Check ──────────────────────────────────────────────────────────────

const ALL_CITIES = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Pune"];

/**
 * Runs trigger check for all cities and returns only those with active triggers.
 */
export function getActiveTriggers(): TriggerResult[] {
  return ALL_CITIES.map(checkTrigger).filter((r) => r.trigger);
}
