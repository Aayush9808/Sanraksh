# GigArmor Demo Operator Guide (Internal)

This file is for presenter/operator only (not for judges).

---

## 1) Pre-Demo Checklist (T-20 mins)

- Ensure internet is stable
- Open these tabs in advance:
  - https://gigarmor.vercel.app
  - https://gigarmor.vercel.app/login
  - https://gigarmor.vercel.app/dashboard/my-policy
  - https://gigarmor.vercel.app/dashboard/triggers
  - https://gigarmor.vercel.app/dashboard
  - README: https://github.com/Aayush9808/GigArmor
- Keep fallback: local run ready

### Local fallback start
```bash
cd /Users/aayus/Desktop/Guidewire/gigshield-dev
docker compose up -d
```

---

## 2) Exact Demo Credentials

- Worker demo phone: `+917000000001`
- Admin demo phone: `+917000000002`
- OTP: `123456`

---

## 3) 2-Minute Narration Script (Crisp)

### 0:00–0:20 — Problem + Persona
"India’s gig workers lose income from external disruptions like heavy rain, flood, pollution, curfews, and platform outages. GigArmor protects loss of income with a weekly parametric model."

### 0:20–0:45 — Worker Journey
- Login worker
- Open My Policy
"Here worker sees weekly premium, active coverage, and transparent risk logic."

### 0:45–1:10 — Claim Automation
- Select disruption and submit claim
"Instead of paperwork, AI validates disruption and fraud checks. Claim is auto-approved and payout gets simulated instantly."

### 1:10–1:35 — Parametric Engine
- Open Triggers page and run simulation
"When thresholds are crossed, claims are auto-fired at scale for affected workers in that zone."

### 1:35–2:00 — Admin + Business Readiness
- Open admin dashboard
"Insurer gets portfolio visibility, analytics, and operational governance. This is positioned as a production-style architecture with explainable pricing and automated claims."

---

## 4) If Something Fails (Recovery Lines)

- If network is slow:
  - "I’ll switch to prepared route view."
- If login call fails:
  - use demo mode OTP path (already implemented)
- If one page lags:
  - continue from `/dashboard/triggers` and `/dashboard/my-policy`

---

## 5) Common Judge Q&A (Ready Answers)

### Q: Is this compliant with constraints?
A: Yes. Coverage is strictly loss-of-income only. No health, life, accident, or vehicle repair cover.

### Q: Why weekly pricing?
A: Gig workers are paid in short cycles; weekly pricing aligns with their cash flow and challenge requirement.

### Q: How is fraud handled?
A: Multi-signal checks: location/activity consistency, duplicate detection, and anomaly scoring.

### Q: Is this real-time parametric?
A: Yes in architecture and simulation flow. Event threshold crossing triggers auto-claims and payout orchestration.

### Q: Is this production-ready?
A: Current build is production-style foundation: modular services, dashboards, role flows, trigger engine, and clear roadmap to harden integrations.

---

## 6) Final Submission Checklist

- [ ] README has final video link (replace ADD_LINK_HERE)
- [ ] Repo is public and latest commit pushed
- [ ] Live demo opens correctly
- [ ] 2-min video uploaded and accessible
- [ ] Demo tabs pre-opened before presentation
