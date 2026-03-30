<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=200&color=0:0f172a,50:0ea5e9,100:2563eb&text=GigArmor&fontSize=60&fontColor=ffffff&animation=twinkling&fontAlignY=38&desc=AI-Powered%20Parametric%20Income%20Protection%20for%20India%27s%20Gig%20Workers&descAlignY=60&descSize=18" />

<img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=700&size=20&pause=1000&color=22D3EE&center=true&vCenter=true&width=900&lines=Built+for+Guidewire+DEVTrails+2026;Loss+of+Income+%E2%80%94+Weekly+Parametric+Model;Real+APIs+%7C+AI+Risk+Scoring+%7C+Auto-Claim+Engine+%7C+Live+Data" alt="typing" />

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![SQLite](https://img.shields.io/badge/SQLite-embedded-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Vercel](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://gigarmor.vercel.app)
[![CI](https://github.com/Aayush9808/GigArmor/actions/workflows/ci.yml/badge.svg)](https://github.com/Aayush9808/GigArmor/actions)

<br/>

**[🌐 Live Demo](https://gigarmor.vercel.app)** &nbsp;·&nbsp; **[📋 Phase 1 Submission](submissions/PHASE1.md)** &nbsp;·&nbsp; **[⚙️ Phase 2 Submission](submissions/PHASE2.md)**

</div>

---

## What is GigArmor?

GigArmor is a **parametric income-protection platform** for India's 7.7 million gig delivery workers — built for Guidewire DEVTrails 2026.

Traditional insurance doesn't work for gig workers: no fixed salary, no employer, claim processes that take weeks. GigArmor flips the model:

- **Parametric triggers** — weather events, platform outages, protests, and civil disruptions automatically trigger payouts. No claim forms.
- **Weekly premium model** — ₹40–90/week, calibrated by city, platform, earnings band, and tenure. Workers pay only for what they use.
- **AI fraud scoring** — real-time ML risk assessment on every claim. High-confidence payouts settle in under 30 seconds automatically.
- **Full admin intelligence** — insurers see live analytics, disruption signals, worker risk zones, and can simulate the entire automation engine.

---

## 📁 Phase Submissions

| Phase | Status | Description | Link |
|-------|--------|-------------|------|
| **Phase 1** — Seed | ✅ Submitted | Idea document, product design, UI prototype, tech stack, 6-week plan, AI/ML strategy, video walkthrough | [📄 View Submission](submissions/PHASE1.md) |
| **Phase 2** — Build & Automate | ✅ Submitted | Working FastAPI backend, real database, live API integration across all dashboard pages, AI premium calculator, CI/CD pipeline, zero mock data | [⚙️ View Submission](submissions/PHASE2.md) |

---

## 🏗️ Architecture

```
┌──────────────────────┐    REST API     ┌───────────────────────────┐
│  Next.js 14 (TSX)    │ ←────────────→  │  FastAPI + SQLAlchemy 2.0 │
│  Vercel Edge CDN     │                 │  SQLite (dev) / Postgres   │
│  Framer Motion + UI  │                 │  JWT Auth + bcrypt OTP     │
└──────────────────────┘                 └──────────────┬────────────┘
                                                        │
                         ┌──────────────────────────────┴──────────┐
                         │              Core Services               │
                         │  ┌─────────────┐  ┌──────────────────┐  │
                         │  │ Automation  │  │ AI Premium Calc  │  │
                         │  │ Engine      │  │ 6-factor model   │  │
                         │  │ (Phase 2)   │  │ city/platform/   │  │
                         │  └─────────────┘  │ season/tenure    │  │
                         │  ┌─────────────┐  └──────────────────┘  │
                         │  │ Risk Scoring│  ┌──────────────────┐  │
                         │  │ Fraud Detect│  │ Analytics &      │  │
                         │  │ ML signals  │  │ Signal Monitor   │  │
                         │  └─────────────┘  └──────────────────┘  │
                         └─────────────────────────────────────────┘
```

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/Aayush9808/GigArmor.git
cd GigArmor

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --port 8000
# Auto-seeds: 11 users, 8 policies, 11 claims, 5 disruptions, 7 risk zones

# Frontend
cd ../frontend
npm install && npm run dev
# → http://localhost:3000
```

**Demo credentials**

| Role | Phone | OTP |
|------|-------|-----|
| Admin | `9999000000` | `000000` |
| Worker | `9999000001` | `123456` |

---

## 📦 Repository Structure

```
GigArmor/
├── frontend/                # Next.js 14, TypeScript, Framer Motion, Recharts
│   └── src/app/dashboard/   # All dashboard pages (admin + worker)
├── backend/                 # FastAPI, SQLAlchemy 2.0, Pydantic
│   ├── app/routers/         # auth, claims, analytics, premium, phase2...
│   ├── app/models/          # User, Policy, Claim, Disruption, RiskZone
│   └── tests/               # pytest suite (auth, phase2, policies)
├── submissions/
│   ├── PHASE1.md            # Phase 1 — Seed submission
│   └── PHASE2.md            # Phase 2 — Build & Automate submission
└── .github/workflows/
    └── ci.yml               # lint + test-backend + test-frontend on every push
```

---

## 🔗 Links

| Resource | URL |
|----------|-----|
| Live Demo | https://gigarmor.vercel.app |
| GitHub Repo | https://github.com/Aayush9808/GigArmor |
| Phase 1 Video | https://drive.google.com/file/d/1CvnhmhemT_G60ETTXPxhS2chgMhp3N_m/view |
| API Docs (local) | http://localhost:8000/docs |

---

<div align="center">

Built with purpose for **Guidewire DEVTrails 2026** &nbsp;·&nbsp; Team GigArmor

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=80&color=0:2563eb,100:0f172a&section=footer" />

