<div align="center">

<!-- HERO BANNER -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=220&color=0:0f172a,30:0c1f3f,60:0d3a6e,100:1a56a0&text=Sanraksh&fontSize=72&fontColor=ffffff&animation=twinkling&fontAlignY=40&desc=AI-Powered%20Parametric%20Income%20Protection%20for%20India%E2%80%99s%20Gig%20Workers&descAlignY=62&descSize=19&descColor=94c3f5" />

<!-- ANIMATED HEADLINE -->
<img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=800&size=22&pause=1200&color=38BDF8&center=true&vCenter=true&width=960&lines=Guidewire+DEVTrails+2026+%E2%80%94+Loss+of+Income+Insurance+Reimagined;Zero+Mock+Data+%E2%80%94+Every+Number+From+a+Live+API;Parametric+Auto-Claims+%7C+AI+Fraud+Scoring+%7C+Instant+Payout;6-Factor+AI+Premium+Engine+%7C+Full+CI%2FCD+Pipeline" alt="Typing SVG" />

<br/><br/>

<!-- STACK BADGES -->
<a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white" /></a>
<a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white" /></a>
<a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white" /></a>
<a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" /></a>
<a href="https://sqlite.org/"><img src="https://img.shields.io/badge/SQLite-Embedded-003B57?style=for-the-badge&logo=sqlite&logoColor=white" /></a>

<br/>

<!-- DEPLOY + CI BADGES -->
<a href="https://sanraksh.vercel.app"><img src="https://img.shields.io/badge/%F0%9F%8C%90%20Live%20Demo-sanraksh.vercel.app-000000?style=for-the-badge&logo=vercel" /></a>
<a href="https://github.com/Aayush9808/Sanraksh/actions"><img src="https://github.com/Aayush9808/Sanraksh/actions/workflows/ci.yml/badge.svg" /></a>
<img src="https://img.shields.io/badge/Tests-Passing-22c55e?style=for-the-badge&logo=pytest&logoColor=white" />
<img src="https://img.shields.io/badge/Zero%20Mock%20Data-100%25%20Real%20APIs-f59e0b?style=for-the-badge" />

<br/><br/>

<!-- QUICK NAV -->
<table>
<tr>
<td align="center"><a href="https://sanraksh.vercel.app"><b>🌐 Live Demo</b></a></td>
<td align="center"><a href="submissions/PHASE1.md"><b>📋 Phase 1 Submission</b></a></td>
<td align="center"><a href="submissions/PHASE2.md"><b>⚙️ Phase 2 Submission</b></a></td>
<td align="center"><a href="LOCAL_SETUP.md"><b>🛠️ Local Setup</b></a></td>
<td align="center"><a href="https://drive.google.com/file/d/1CvnhmhemT_G60ETTXPxhS2chgMhp3N_m/view"><b>🎬 Demo Video</b></a></td>
<td align="center"><a href="#api-reference"><b>📡 API Docs</b></a></td>
</tr>
</table>

</div>

---

## 🧭 Table of Contents

<table>
<tr>
<td>

**Product**
- [What is Sanraksh?](#what-is-sanraksh)
- [The Problem We Solve](#the-problem-we-solve)
- [Key Features](#key-features)
- [Live Demo & Credentials](#live-demo--credentials)

</td>
<td>

**Technical**
- [System Architecture](#system-architecture)
- [Data Flow — Claim Lifecycle](#data-flow--claim-lifecycle)
- [API Reference](#api-reference)
- [AI & ML Layer](#ai--ml-layer)

</td>
<td>

**Submissions**
- [Phase Submissions](#phase-submissions)
- [CI/CD Pipeline](#cicd-pipeline)
- [Quick Start](#quick-start)
- [Repository Structure](#repository-structure)

</td>
</tr>
</table>

---

## 🛡️ What is Sanraksh?

<table>
<tr>
<td width="60%">

Sanraksh is a **parametric income-protection platform** for India's **7.7 million gig delivery workers**. Built for Guidewire DEVTrails 2026.

Traditional insurance breaks for gig workers:
- ❌ No fixed salary → actuarial models fail
- ❌ No employer → no group coverage
- ❌ Claim forms → weeks of delay
- ❌ Opaque pricing → workers distrust it

**Sanraksh flips every one of these.**

</td>
<td width="40%" align="center">

```
₹61 / week
────────────────────
Coverage:  ₹800/day
Platform:  Swiggy
City:      Mumbai
Risk:      Medium
────────────────────
Auto-settle: < 30s
Fraud check: Real-time
Claim form:  None
```

</td>
</tr>
</table>

---

## 🎯 The Problem We Solve

```
  DISRUPTION                   TRADITIONAL               SANRAKSH
  HAPPENS                      INSURANCE                 RESPONSE
     │                             │                         │
     ▼                             ▼                         ▼
 Heavy Rain              Fill claim form (3 days)    Trigger detected
 App Outage              Submit documents              in < 60 seconds
 Civil Curfew            Wait for adjuster            ─────────────────
 AQI Shutdown            Wait 14–30 days              Fraud check runs
                         Receive partial payout       Auto-approved
                                                      ₹800 settled
                                                      Notification sent
                                                      
       Worker loses income for weeks    ←→    Worker paid same day ✓
```

**Persona:** Food delivery partner on Swiggy/Zomato, Tier-1 city, earning ₹4,000–7,000/week.
**Coverage scope:** Loss of income **only** — strictly compliant with DEVTrails constraints.

---

## ✨ Key Features

<table>
<tr>
<td align="center" width="25%">

### 🌩️ Parametric Triggers
Weather · Outages · Floods · Curfews · AQI

Auto-detects threshold breach and fires claims — **no form needed**

</td>
<td align="center" width="25%">

### 🤖 AI Premium Calc
6-factor pricing engine

City risk · Platform stability · Season · Earnings band · Loyalty · No-claim bonus

</td>
<td align="center" width="25%">

### 🔍 Fraud Intelligence
Real-time ML scoring

Route plausibility · GPS continuity · Peer corroboration · Duplicate detection

</td>
<td align="center" width="25%">

### 📊 Admin Command Center
Live analytics dashboard

KPI cards · Claims feed · Disruption monitor · Risk zones · Simulation engine

</td>
</tr>
</table>

---

## 🌐 Live Demo & Credentials

> **Live at:** [https://sanraksh.vercel.app](https://sanraksh.vercel.app)

<table>
<tr>
<th>Role</th>
<th>Phone</th>
<th>OTP</th>
<th>Access</th>
</tr>
<tr>
<td>🔴 Admin / Insurer</td>
<td><code>9999000000</code></td>
<td><code>000000</code></td>
<td>Full dashboard · claims · analytics · control tower · premium calc</td>
</tr>
<tr>
<td>🟢 Worker</td>
<td><code>9999000001</code></td>
<td><code>123456</code></td>
<td>My policy · live triggers · payout history · profile</td>
</tr>
</table>

---

## 🏗️ System Architecture

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                           SANRAKSH PLATFORM                                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║   ┌─────────────────────────────────────────────────────────────────────┐   ║
║   │                      PRESENTATION LAYER                             │   ║
║   │  ┌──────────────────────────┐   ┌───────────────────────────────┐  │   ║
║   │  │   Worker Portal          │   │   Admin / Insurer Dashboard   │  │   ║
║   │  │  • My Policy             │   │  • Command Center (KPIs)      │  │   ║
║   │  │  • Live Triggers         │   │  • Claims Feed (real-time)    │  │   ║
║   │  │  • Payout History        │   │  • Analytics + Charts         │  │   ║
║   │  │  • Profile / KYC         │   │  • Control Tower (simulate)   │  │   ║
║   │  │                          │   │  • Premium Calculator         │  │   ║
║   │  └──────────────────────────┘   │  • Risk Map + Triggers        │  │   ║
║   │     Next.js 14 · TypeScript     └───────────────────────────────┘  │   ║
║   │     Framer Motion · Recharts · Tailwind CSS                         │   ║
║   └─────────────────────────────────────────────────────────────────────┘   ║
║                              │ REST API (JSON)                               ║
║                              ▼                                               ║
║   ┌─────────────────────────────────────────────────────────────────────┐   ║
║   │                       API GATEWAY LAYER                             │   ║
║   │                        FastAPI 0.104                                │   ║
║   │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │   ║
║   │   │  /auth   │ │/workers  │ │ /claims  │ │/analytics│ │/phase2 │  │   ║
║   │   │  JWT OTP │ │ KYC Risk │ │ Fraud AI │ │ KPIs     │ │ Engine │  │   ║
║   │   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘  │   ║
║   │   ┌──────────┐ ┌──────────────────────┐ ┌────────────────────────┐ │   ║
║   │   │/premium  │ │    /disruptions       │ │      /policies         │ │   ║
║   │   │6-Factor  │ │  Active Signal Feed   │ │  Coverage + Premiums   │ │   ║
║   │   │Pricing   │ └──────────────────────┘ └────────────────────────┘ │   ║
║   │   └──────────┘                                                      │   ║
║   └─────────────────────────────────────────────────────────────────────┘   ║
║                              │                                               ║
║         ┌────────────────────┼────────────────────┐                         ║
║         ▼                    ▼                    ▼                         ║
║   ┌────────────┐    ┌─────────────────┐   ┌─────────────────────────────┐  ║
║   │  DATABASE  │    │  AUTOMATION     │   │  AI / ML LAYER              │  ║
║   │            │    │  ENGINE         │   │                             │  ║
║   │ SQLAlchemy │    │                 │   │  Premium Calculator         │  ║
║   │ SQLite/PG  │    │ Signal ingestion│   │  ├─ City risk (IMD data)    │  ║
║   │            │    │ Fraud scoring   │   │  ├─ Platform stability      │  ║
║   │  Users     │    │ Claim routing   │   │  ├─ Seasonal adjustment     │  ║
║   │  Policies  │    │ Auto-pay        │   │  ├─ Earnings coverage scale │  ║
║   │  Claims    │    │ Review queue    │   │  ├─ Loyalty discount        │  ║
║   │  Disruption│    │ Audit trail     │   │  └─ No-claim bonus          │  ║
║   │  RiskZones │    │                 │   │                             │  ║
║   └────────────┘    └─────────────────┘   │  Fraud Detection            │  ║
║                                           │  ├─ Route plausibility      │  ║
║   ┌────────────────────────────────────┐  │  ├─ GPS continuity          │  ║
║   │          AUTH LAYER                │  │  ├─ Peer corroboration      │  ║
║   │  JWT (python-jose) + bcrypt        │  │  └─ Duplicate signatures    │  ║
║   │  In-memory OTP · Role-based access │  └─────────────────────────────┘  ║
║   └────────────────────────────────────┘                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🔄 Data Flow — Claim Lifecycle

```
  DISRUPTION EVENT DETECTED
          │
          ▼
  ┌───────────────────┐
  │  Signal Ingestion  │  ← Weather API · AQI · Platform health · Civic alert
  │  Confidence: 0–1   │
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────┐
  │  Zone Matching    │  ← Worker work_zone == disruption.zone ?
  │  Policy Check     │  ← Policy status == ACTIVE ?
  └────────┬──────────┘
           │
           ▼
  ┌───────────────────────────────────────────────────┐
  │              FRAUD SCORING ENGINE                  │
  │                                                    │
  │  fraud_score = weighted_sum(                       │
  │    route_plausibility   × 0.30,                   │
  │    gps_continuity       × 0.25,                   │
  │    event_correlation    × 0.20,                   │
  │    peer_corroboration   × 0.15,                   │
  │    duplicate_signature  × 0.10                    │
  │  )                                                 │
  └────────────────────┬──────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
     score ≤ 0.35            score > 0.35
           │                       │
           ▼                       ▼
  ┌─────────────────┐    ┌──────────────────┐
  │  AUTO-APPROVED  │    │  MANUAL REVIEW   │
  │  Status: PAID   │    │  Status: PENDING │
  │  < 30 seconds   │    │  SLA: 2–4 hours  │
  └────────┬────────┘    └────────┬─────────┘
           │                      │
           └──────────┬───────────┘
                      ▼
           ┌─────────────────────┐
           │   AUDIT TRAIL       │
           │  reason_codes[]     │
           │  decision_notes     │
           │  payout_tx_id       │
           └─────────────────────┘
```

---

## 📡 API Reference

<details>
<summary><b>🔐 Authentication</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/send-otp` | Send OTP to phone (demo returns OTP in response) |
| `POST` | `/api/v1/auth/verify-otp` | Verify OTP → returns JWT + role |
| `GET`  | `/api/v1/auth/me` | Get current authenticated user |

</details>

<details>
<summary><b>👷 Workers</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/workers/all` | All workers with KYC, risk, and claims count |
| `GET` | `/api/v1/workers/me` | Current worker profile |
| `GET` | `/api/v1/workers/me/policy` | Worker's active policy |
| `GET` | `/api/v1/workers/me/claims` | Worker's claim history |

</details>

<details>
<summary><b>📋 Claims</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/claims/all` | All claims with fraud score + decision trace |
| `GET` | `/api/v1/claims/{id}` | Single claim detail |
| `POST` | `/api/v1/claims/{id}/approve` | Manually approve a claim |
| `POST` | `/api/v1/claims/{id}/reject` | Manually reject a claim |

</details>

<details>
<summary><b>📊 Analytics</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/analytics/dashboard` | KPIs: users, claims, payout, automation rate |
| `GET` | `/api/v1/analytics/claims-summary` | 7-day claims + payout trend |
| `GET` | `/api/v1/analytics/policy-mix` | Coverage type breakdown |

</details>

<details>
<summary><b>⚡ Disruptions & Automation</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/disruptions/active` | All active disruptions |
| `POST` | `/api/v1/phase2/simulate-disruption` | Run automation engine on a city/event |
| `GET` | `/api/v1/phase2/control-tower` | Live 24h automation metrics |
| `GET` | `/api/v1/phase2/run-history` | Past simulation runs |

</details>

<details>
<summary><b>💰 Premium Calculator</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/premium/calculate` | AI premium with full 6-factor breakdown |

**Request body:**
```json
{
  "city": "Mumbai",
  "platform": "swiggy",
  "weekly_earnings_band": "4000_7000",
  "tenure_months": 6,
  "claims_last_30_days": 0
}
```

**Response includes:** `base_premium`, `factors[]` (each with explanation + confidence), `final_premium`, `coverage_per_day`, `weekly_roi_breakeven_days`, `recommended_plan`

</details>

---

## 🤖 AI & ML Layer

### Premium Pricing Engine — 6 Factors

| Factor | Signal Source | Max Impact | Confidence |
|--------|--------------|-----------|------------|
| City Risk | 24-month IMD/CPCB disruption history | +₹13.5 | 88% |
| Platform Stability | Monthly uptime-degradation probability | +₹2.25 | 76% |
| Seasonal Adjustment | Current monsoon/summer/winter season | ±₹7.0 | 92% |
| Earnings Coverage Scale | Weekly earnings band → coverage amount | ±₹4.5 | 95% |
| Loyalty Discount | Tenure with Sanraksh (months) | −₹6.0 | 100% |
| No-Claim Bonus | Claims in last 30 days | −₹2.5 | 100% |

### Fraud Detection Architecture

```
INPUT SIGNALS                    WEIGHTS        OUTPUT
─────────────                    ───────        ──────
Route plausibility  ──────────►  ×0.30  ─┐
GPS continuity      ──────────►  ×0.25  ─┤
Event correlation   ──────────►  ×0.20  ─┼──► fraud_score (0–1)
Peer corroboration  ──────────►  ×0.15  ─┤
Duplicate signature ──────────►  ×0.10  ─┘

score ≤ 0.35 → AUTO PAY      (72.7% of claims)
score 0.35–0.70 → REVIEW     (18.2% of claims)
score > 0.70 → REJECT        ( 9.1% of claims)
```

---

## 📁 Phase Submissions

<table>
<tr>
<th width="50%">📋 Phase 1 — Seed Submission</th>
<th width="50%">⚙️ Phase 2 — Build & Automate</th>
</tr>
<tr>
<td>

**Submitted:** March 2026

**Deliverables:**
- ✅ Persona-focused problem definition
- ✅ Weekly premium model (transparent)
- ✅ Parametric trigger matrix
- ✅ AI/ML integration plan
- ✅ Adversarial anti-spoofing strategy
- ✅ Tech stack + 6-week execution roadmap
- ✅ Working UI prototype (Next.js)
- ✅ 2-minute strategy video

[**→ Full Phase 1 Document**](submissions/PHASE1.md)

</td>
<td>

**Submitted:** March 30, 2026

**Deliverables:**
- ✅ FastAPI backend — live, seeded, tested
- ✅ SQLite database (zero setup required)
- ✅ All 6 admin pages — zero mock data
- ✅ AI premium calculator (6-factor)
- ✅ Real automation engine (simulate-disruption)
- ✅ CI/CD: lint + test-backend + test-frontend
- ✅ Vercel deploy — live on every push
- ✅ Full pytest suite (16 tests passing)

[**→ Full Phase 2 Document**](submissions/PHASE2.md)

</td>
</tr>
</table>

---

## ⚙️ CI/CD Pipeline

```
  git push origin main
         │
         ▼
  ┌──────────────────────────────────────────────────┐
  │              GitHub Actions CI                    │
  │                                                  │
  │  ┌─────────┐   ┌──────────────┐   ┌──────────┐  │
  │  │  lint   │   │ test-backend │   │test-front│  │
  │  │         │   │              │   │   end    │  │
  │  │ flake8  │   │ pytest · 16  │   │ jest·15  │  │
  │  │ Python  │   │ tests        │   │ tests    │  │
  │  │ /src    │   │ + coverage   │   │ + build  │  │
  │  └────┬────┘   └──────┬───────┘   └────┬─────┘  │
  │       │               │                │         │
  │       └───────────────┴────────────────┘         │
  │                       │ all pass                 │
  └───────────────────────┼──────────────────────────┘
                          ▼
               ┌─────────────────┐
               │ Vercel Deploy   │
               │ sanraksh.vercel │
               │    .app  ✓      │
               └─────────────────┘
```

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/Aayush9808/Sanraksh.git && cd Sanraksh

# 2. Backend (Python 3.11+, no Docker needed)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
# ✅ Auto-seeded: 11 users · 8 policies · 11 claims · 5 disruptions · 7 risk zones
# ✅ API explorer: http://localhost:8000/docs

# 3. Frontend (new terminal)
cd frontend
npm install && npm run dev
# ✅ Running: http://localhost:3000
```

---

## 📦 Repository Structure

```
Sanraksh/
│
├── frontend/                        # Next.js 14 · TypeScript · Tailwind
│   └── src/app/
│       ├── dashboard/
│       │   ├── page.tsx             # Admin + Worker home (real API)
│       │   ├── analytics/           # Live charts (bar, line, pie)
│       │   ├── claims/              # Claims feed + fraud score
│       │   ├── control-tower/       # Automation engine simulator
│       │   ├── workers/             # Worker roster
│       │   ├── triggers/            # Active disruptions
│       │   ├── premium-calculator/  # AI pricing UI
│       │   └── layout.tsx           # Nav + auth guard
│       ├── login/                   # OTP login flow
│       └── register/                # Worker onboarding
│
├── backend/                         # FastAPI · SQLAlchemy 2.0 · Pydantic
│   └── app/
│       ├── main.py                  # App entrypoint + seed data
│       ├── config.py                # Pydantic settings (zero-config demo)
│       ├── database.py              # SQLite + StaticPool
│       ├── models/                  # User · Policy · Claim · Disruption · RiskZone
│       └── routers/
│           ├── auth.py              # JWT + in-memory OTP
│           ├── workers.py           # Worker CRUD
│           ├── claims.py            # Claims + fraud routing
│           ├── analytics.py         # KPIs + trend data
│           ├── disruptions.py       # Signal feed
│           ├── phase2.py            # Automation engine
│           └── premium.py           # AI 6-factor pricing
│
├── submissions/
│   ├── PHASE1.md                    # Phase 1 — Seed submission
│   └── PHASE2.md                    # Phase 2 — Build & Automate
│
├── .github/workflows/ci.yml         # lint + test-backend + test-frontend
└── backend/tests/
    ├── test_auth.py                 # JWT · bcrypt · OTP tests
    ├── test_phase2.py               # Automation engine tests
    └── test_policies.py             # Premium + policy tests
```

---

## 🔗 Links

| Resource | URL |
|----------|-----|
| 🌐 Live Demo | https://sanraksh.vercel.app |
| 📦 GitHub | https://github.com/Aayush9808/Sanraksh |
| 🎬 Phase 1 Video | https://drive.google.com/file/d/1CvnhmhemT_G60ETTXPxhS2chgMhp3N_m/view |
| 📡 API Docs (local) | http://localhost:8000/docs |
| 📋 Phase 1 Submission | [submissions/PHASE1.md](submissions/PHASE1.md) |
| ⚙️ Phase 2 Submission | [submissions/PHASE2.md](submissions/PHASE2.md) |

---

<div align="center">

<img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=700&size=16&pause=2000&color=64748B&center=true&vCenter=true&width=700&lines=Built+for+Guidewire+DEVTrails+2026+%C2%B7+Every+line+of+code+serves+a+gig+worker" alt="footer" />

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=100&color=0:0f172a,50:0d3a6e,100:1a56a0&section=footer" />

</div>
