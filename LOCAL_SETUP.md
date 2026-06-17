# 🛡️ Sanraksh — Local Setup Guide for Judges

> **Sanraksh** is an AI-powered parametric income-protection platform for India's gig delivery workers.  
> This guide will get the full stack (backend + frontend) running on your machine in ~10 minutes.

---

## ⚡ Live Demo

| Service | Status | URL |
|---------|--------|-----|
| 🌐 Frontend | ✅ Live | [https://sanraksh.vercel.app](https://sanraksh.vercel.app) |
| 📡 Backend API | ⚠️ Offline | AWS EC2 server encountered an error and is currently down |

> **Note for Judges:** The AWS EC2 backend crashed after deployment. The frontend is live on Vercel but the backend API is unavailable on the cloud. **Please use the local setup below** to run the full application — the entire stack works perfectly on a local machine.

---

## 🖥️ Prerequisites

Make sure these are installed on your machine before starting:

| Tool | Required Version | Check Command | Download |
|------|-----------------|---------------|----------|
| Python | 3.11 or 3.12 | `python3 --version` | [python.org](https://www.python.org/downloads/) |
| Node.js | 18 or higher | `node --version` | [nodejs.org](https://nodejs.org/) |
| npm | comes with Node | `npm --version` | (bundled with Node) |
| Git | any | `git --version` | [git-scm.com](https://git-scm.com/) |

> **Note:** Redis and PostgreSQL are **NOT required** for local setup. The app uses SQLite (built-in) and works without Redis.

---

## 📥 Step 1 — Clone the Repository

```bash
git clone https://github.com/Aayush9808/GigArmor.git
cd GigArmor
```

You will see two main folders:
```
GigArmor/
├── backend/     ← FastAPI (Python)
└── frontend/    ← Next.js (TypeScript)
```

---

## 🐍 Step 2 — Backend Setup

### 2a. Create a Python virtual environment

```bash
cd backend
python3 -m venv .venv
```

### 2b. Activate the virtual environment

**macOS / Linux:**
```bash
source .venv/bin/activate
```

**Windows (Command Prompt):**
```cmd
.venv\Scripts\activate.bat
```

**Windows (PowerShell):**
```powershell
.venv\Scripts\Activate.ps1
```

> You should see `(.venv)` appear at the start of your terminal prompt.

### 2c. Install Python dependencies

```bash
pip install -r requirements.txt
```

This installs FastAPI, SQLAlchemy, scikit-learn, and ~30 other packages. Takes 1-3 minutes.

### 2d. Create the environment file

Create a file called `.env` inside the `backend/` folder:

**macOS / Linux:**
```bash
cat > .env << 'EOF'
ENVIRONMENT=development
DATABASE_URL=sqlite:///./sanraksh.db
SECRET_KEY=local-dev-secret-key-judges-2026
CORS_ORIGINS=http://localhost:3000
EOF
```

**Windows** — create `backend/.env` manually with this content:
```
ENVIRONMENT=development
DATABASE_URL=sqlite:///./sanraksh.db
SECRET_KEY=local-dev-secret-key-judges-2026
CORS_ORIGINS=http://localhost:3000
```

> All other API keys (Razorpay, Twilio, etc.) are optional. The core premium calculation, registration, onboarding, dashboard, and simulation all work without them.

### 2e. Start the backend server

```bash
uvicorn app.main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

✅ Backend is running at: **http://localhost:8000**  
📚 Interactive API docs: **http://localhost:8000/docs**

---

## ⚛️ Step 3 — Frontend Setup

Open a **new terminal window/tab** (keep backend running in the first one).

### 3a. Navigate to frontend and install dependencies

```bash
cd GigArmor/frontend
npm install
```

This installs Next.js, React, Tailwind CSS, and other packages. Takes 1-2 minutes.

### 3b. Create the environment file

Create a file called `.env.local` inside the `frontend/` folder:

**macOS / Linux:**
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

**Windows** — create `frontend/.env.local` manually with this content:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3c. Start the frontend dev server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.1s
```

✅ Frontend is running at: **http://localhost:3000**

---

## 🚀 Step 4 — Using the App

Open your browser and go to **http://localhost:3000**

### Full User Journey (5 minutes):

| Step | What to do |
|------|-----------|
| 1. Register | Click "Get Started" → fill name, email, phone, password |
| 2. Onboarding | Select your city, platform (Swiggy/Zomato/etc.), earnings range |
| 3. Premium | See your AI-calculated premium (₹10–₹60/week, coverage = premium × 15) |
| 4. Plan | Choose Basic / Standard / Premium plan |
| 5. Payment | Click "Pay" (simulated — no real payment needed) |
| 6. Dashboard | View your active policy, coverage, and risk zones |
| 7. Simulation | Go to "Simulate Disruption" → trigger a weather/outage event → watch auto-claim settle |

### Key Features to Evaluate:
- **Premium Engine:** AI calculates premium based on city risk, platforms count, and earnings
- **Parametric Claims:** Go to Simulation tab → trigger a disruption → claim auto-settles in <30s with no form
- **Fraud Detection:** Claims run through ML fraud scoring before approval
- **Risk Map:** Dashboard shows live risk zones for your city

---

## 🗂️ Project Structure

```
GigArmor/
├── backend/
│   ├── app/
│   │   ├── main.py              ← FastAPI app entry point
│   │   ├── config.py            ← All settings (env vars)
│   │   ├── database.py          ← SQLite connection
│   │   ├── models/              ← SQLAlchemy DB models
│   │   ├── routers/             ← API endpoints (auth, premium, claims...)
│   │   ├── schemas/             ← Pydantic request/response schemas
│   │   ├── services/            ← Business logic
│   │   └── ml_models/           ← Fraud detection ML models
│   ├── requirements.txt
│   └── .env                     ← You create this (Step 2d)
│
└── frontend/
    ├── src/
    │   ├── app/                 ← Next.js App Router pages
    │   │   ├── onboarding/      ← Registration + premium calculation flow
    │   │   ├── dashboard/       ← Policy dashboard + analytics
    │   │   └── simulation/      ← Disruption simulation & auto-claims
    │   └── lib/                 ← Shared utilities (auth, API calls)
    ├── package.json
    └── .env.local               ← You create this (Step 3b)
```

---

## 🔧 Troubleshooting

### `command not found: uvicorn`
Make sure your virtual environment is activated (you should see `(.venv)` in your terminal):
```bash
source backend/.venv/bin/activate   # macOS/Linux
```

### `npm: command not found`
Install Node.js from [https://nodejs.org](https://nodejs.org/) (LTS version recommended).

### `Module not found` or import errors
Ensure you installed dependencies inside the venv:
```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
```

### Frontend shows "Connection Error" or "Unable to calculate premium"
Make sure:
1. Backend is running on port 8000 (`uvicorn app.main:app --reload --port 8000`)
2. `frontend/.env.local` contains `NEXT_PUBLIC_API_URL=http://localhost:8000`
3. Restart the frontend dev server after creating `.env.local`

### Port already in use
```bash
# Kill whatever is on port 8000
lsof -ti:8000 | xargs kill -9

# Kill whatever is on port 3000
lsof -ti:3000 | xargs kill -9
```

### Windows: `ExecutionPolicy` error when activating venv
Run PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📡 API Endpoints (Quick Reference)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/docs` | GET | Interactive Swagger UI |
| `/api/v1/auth/register` | POST | Create account |
| `/api/v1/auth/login` | POST | Get JWT token |
| `/api/v1/premium/calculate` | POST | Calculate insurance premium |
| `/api/v1/policies/` | GET/POST | View/create policies |
| `/api/v1/claims/` | GET/POST | View/trigger claims |
| `/api/v1/disruptions/` | GET | Active disruptions in city |
| `/api/v1/risk-zones/` | GET | Risk zone data for map |

Full interactive docs at: `http://localhost:8000/docs`

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts, Leaflet |
| Backend | FastAPI, Python 3.12, SQLAlchemy, Pydantic |
| Database | SQLite (local) / PostgreSQL (production) |
| ML | scikit-learn, XGBoost, pandas, numpy |
| Auth | JWT (python-jose, passlib) |
| Deployment | Vercel (frontend), AWS EC2 t3.micro (backend) |

---

## 💡 Premium Calculation (How It Works)

The backend calculates premium from 4 parameters:

```
premium = 10 + (cityRisk × 6) + (min(platforms, 4) × 4) + (weeklyEarnings ÷ 2000)

Range: ₹10 – ₹60 per week  (hard capped)
Coverage = premium × 15    (e.g. ₹30 premium → ₹450 coverage/day)
```

- **cityRisk**: 0–5 scale based on city (Mumbai=4, Delhi=3, Bangalore=2, etc.)
- **platforms**: Number of platforms worker is registered on
- **weeklyEarnings**: Self-reported weekly income

---

*Built for Guidewire DEVTrails 2026 — Aayush Tiwari*
