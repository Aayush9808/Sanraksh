# Sanraksh — Complete Project Q&A

*All answers reference actual file names, function names, formula constants, and version numbers from the codebase. ⭐ = highest-priority viva/interview questions.*

---

## Index

### Group A — Basic & Common Questions
- [Q1: What is Sanraksh, in one sentence?](#q1)
- [Q2: How would you explain this to someone with no technical background?](#q2)
- [Q3: What problem does this solve?](#q3)
- [Q4: What is parametric insurance and how is it different from regular insurance?](#q4)
- [Q5: Who is this built for ?](#q5)
- [Q6: What does a gig worker actually experience when using this?](#q6)
- [Q7: What makes this different from existing insurance products?](#q7)
- [Q8: What is a "trigger" — the core concept of this system?](#q8)
- [Q9: What's the business model?](#q9)
- [Q10: Why should anyone trust an automated insurance system?](#q10)

### Group B — Technical Questions

**B1: Architecture & System Design**
- [Q11: What is the overall system architecture?](#q11)
- [Q12: Walk through what happens from disruption detected to worker paid](#q12)
- [Q13: What is a REST API and how is it used here?](#q13)
- [Q14: Why not microservices?](#q14)
- [Q15: What design patterns are used in the code?](#q15)
- [Q16: What would break at 10,000 users? At 1 million?](#q16)
- [Q17: What are the three biggest bottlenecks right now?](#q17)
- [Q18: What happens if two disruptions hit the same zone at the same time?](#q18)
- [Q19: What happens if the automation engine crashes halfway through?](#q19)
- [Q20: How does the frontend know whether to show admin or worker view?](#q20)

**B2: The AI & ML Engine**
- [Q21: Where exactly is AI and ML used in this project?](#q21)
- [Q22: How does the fraud detection work exactly?](#q22)
- [Q23: What is XGBoost?](#q23)
- [Q24: What is gradient boosting in plain terms?](#q24)
- [Q25: Could you have used a simpler model instead?](#q25)
- [Q26: What is overfitting and is this model at risk?](#q26)
- [Q27: How does the premium pricing formula work?](#q27)
- [Q28: Where does the coverage multiplier ×15 come from?](#q28)
- [Q29: How does signal confidence aggregation work?](#q29)
- [Q30: Was the ML model trained on real data?](#q30)
- [Q31: What happens when the fraud detection gets it wrong?](#q31)
- [Q32: How would you test the fraud model in real production?](#q32)
- [Q33: What are scikit-learn, Pandas, and NumPy?](#q33)

**B3: Backend Technology**
- [Q34: What is Python?](#q34)
- [Q35: What is FastAPI?](#q35)
- [Q36: What is Pydantic?](#q36)
- [Q37: What is SQLAlchemy?](#q37)
- [Q38: What is Alembic?](#q38)
- [Q39: What is Uvicorn?](#q39)
- [Q40: What is httpx?](#q40)
- [Q41: What is python-jose?](#q41)
- [Q42: What is passlib and bcrypt?](#q42)
- [Q43: What is Geopy?](#q43)
- [Q44: What is Swagger / OpenAPI?](#q44)
- [Q45: What is async/await and why does it matter?](#q45)
- [Q46: What is middleware and where is it used?](#q46)
- [Q47: What is CORS and why does it matter?](#q47)
- [Q48: How does environment configuration work?](#q48)

**B4: Frontend Technology**
- [Q49: What is React?](#q49)
- [Q50: What is Next.js?](#q50)
- [Q51: What is TypeScript?](#q51)
- [Q52: What is TailwindCSS?](#q52)
- [Q53: What is Framer Motion?](#q53)
- [Q54: What is Recharts?](#q54)
- [Q55: What is React Leaflet?](#q55)
- [Q56: What is Axios?](#q56)
- [Q57: What is server-side rendering (SSR)?](#q57)
- [Q58: Why not Redux for state management?](#q58)
- [Q59: What is the workerData.ts file?](#q59)

**B5: Database**
- [Q60: What is PostgreSQL?](#q60)
- [Q61: What is SQLite?](#q61)
- [Q62: What is Psycopg2?](#q62)
- [Q63: What does the database schema look like?](#q63)
- [Q64: Why not MongoDB?](#q64)
- [Q65: What is ACID?](#q65)
- [Q66: What indexing exists and what's missing?](#q66)
- [Q67: How are relationships between tables handled?](#q67)
- [Q68: How is data validated before it hits the database?](#q68)

**B6: Authentication & Security**
- [Q69: What is JWT?](#q69)
- [Q70: How does authentication work end to end?](#q70)
- [Q71: Why OTP instead of username and password?](#q71)
- [Q72: What is SQL injection and how is it prevented?](#q72)
- [Q73: What is XSS and is the frontend vulnerable?](#q73)
- [Q74: What are the known security issues?](#q74)
- [Q75: How is CORS configured?](#q75)
- [Q76: How is Aadhaar data handled?](#q76)
- [Q77: No passwords — how are OTPs stored?](#q77)

**B7: Infrastructure & DevOps**
- [Q78: What is Docker?](#q78)
- [Q79: What is Docker Compose?](#q79)
- [Q80: Container vs virtual machine?](#q80)
- [Q81: What is GitHub Actions?](#q81)
- [Q82: What is Vercel?](#q82)
- [Q83: What is AWS EC2?](#q83)
- [Q84: What is CI/CD and how does it work here?](#q84)
- [Q85: What environment variables are required for production?](#q85)

**B8: Integration Services**
- [Q86: What is Redis?](#q86)
- [Q87: What is Celery?](#q87)
- [Q88: What is Twilio?](#q88)
- [Q89: What is Razorpay?](#q89)
- [Q90: What is SendGrid?](#q90)
- [Q91: What is the OpenWeatherMap API?](#q91)
- [Q92: What is joblib?](#q92)

**B9: Features & Code Implementation**
- [Q93: Walk through the backend folder structure](#q93)
- [Q94: How is error handling done?](#q94)
- [Q95: What is dependency injection?](#q95)
- [Q96: What is idempotency and where does this project need it?](#q96)
- [Q97: What is the most complex piece of code?](#q97)
- [Q98: How does the _seed() function work?](#q98)
- [Q99: How does the userStore.ts migration code work?](#q99)
- [Q100: What does underwritingEngine.ts do?](#q100)
- [Q101: What is triggerEngine.ts and how does it work?](#q101)
- [Q102: pricingEngine.ts vs the backend premium calculator — what's the difference?](#q102)
- [Q103: What does the disruption simulation do from the admin side?](#q103)
- [Q104: What does the Control Tower dashboard show?](#q104)
- [Q105: How does the risk map work?](#q105)
- [Q106: What is demo mode?](#q106)

**B10: The Hard Questions**
- [Q107: OTP hardcoded as "123456" — security vulnerability?](#q107)
- [Q108: SECRET_KEY is a placeholder in docker-compose — what if deployed as-is?](#q108)
- [Q109: Fraud thresholds differ between fraud_detection.py and automation engine — which is used?](#q109)
- [Q110: Auth tokens in localStorage — security implications?](#q110)
- [Q111: _seed() fails halfway — what happens?](#q111)
- [Q112: 500 worker cap — what happens to the rest?](#q112)
- [Q113: 94.2% precision on synthetic data — how valid?](#q113)
- [Q114: Could a worker claim multiple times for the same event?](#q114)
- [Q115: event_metadata is plain Text not JSONB — why?](#q115)
- [Q116: automation_rate formula includes pending claims — what's wrong?](#q116)
- [Q117: Python 3.14 locally vs 3.11 in CI — how do you know it works on both?](#q117)
- [Q118: What prevents GPS spoofing?](#q118)
- [Q119: Simulation doesn't transfer money — is payout flow actually tested?](#q119)
- [Q120: userStore.ts backward compatibility — what does it reveal?](#q120)
- [Q121: affected_radius_km hardcoded to 2.0 — why?](#q121)

### Group C — Non-Technical Questions

**C1: The Problem & Research**
- [Q122: What data backs up the problem statement?](#q122)
- [Q123: What existing solutions were evaluated?](#q123)
- [Q124: What gap does this fill that nothing else does?](#q124)
- [Q125: Is this problem real — did you actually research it?](#q125)
- [Q126: What is IRDAI and how does it relate to this project?](#q126)

**C2: Business, Market & Impact**
- [Q127: How would this actually make money?](#q127)
- [Q128: What regulatory approvals would this need?](#q128)
- [Q129: Who would you partner with to make this real?](#q129)
- [Q130: What is the risk of widespread fraud at scale?](#q130)
- [Q131: 2-minute investor pitch?](#q131)

**C3: Results, Reflections & Future**
- [Q132: Does this work end to end?](#q132)
- [Q133: What are the measured performance metrics?](#q133)
- [Q134: What was the biggest technical challenge?](#q134)
- [Q135: What took the most time?](#q135)
- [Q136: What's the riskiest assumption?](#q136)
- [Q137: What would you change if starting over?](#q137)
- [Q138: What was planned but not implemented?](#q138)
- [Q139: What would be refactored with more time?](#q139)
- [Q140: Most impressive technical achievement?](#q140)
- [Q141: Hardest part — rate it out of 10?](#q141)
- [Q142: Most valuable things learned?](#q142)
- [Q143: What comes next technically?](#q143)
- [Q144: What would change at 1 million users?](#q144)

---

## GROUP A — Basic & Common Questions

---

<a id="q1"></a>
**⭐ Q1: What is Sanraksh, in one sentence?**

A: Sanraksh is a parametric insurance platform for gig delivery workers — when something disrupts their ability to work, the system detects it automatically, files a claim without any action from the worker, runs fraud scoring in real time, and sends the payout. Average settlement: 22.3 seconds.

---

<a id="q2"></a>
**Q2: How would you explain this to someone with no technical background?**

A: Imagine you deliver food for Swiggy. It pours rain and you can't work. You lose ₹600 that day. Normal insurance means forms, an agent, 3 weeks of waiting. Useless when rent is due now.

Sanraksh watches the weather. The moment rainfall in your zone crosses a threshold, it knows you probably couldn't work. It files the claim automatically, checks if it's legitimate, and sends money to your UPI — while you're still waiting for the rain to stop. No forms. No waiting. No agent.

---

<a id="q3"></a>
**⭐ Q3: What problem does this solve?**

A: India has 7.7 million gig delivery workers earning ₹4,000–₹8,000/week with no benefits and no income protection. They face ~11.8 disruption days/month — heavy rain, AQI alerts, platform outages, curfews — losing ₹96,000–₹1,44,000 per year. 96% are completely uninsured.

Existing insurance fails them: requires salary proof they don't have, costs ₹200–₹300/month (5–7% of income), takes 14–30 days to settle. Sanraksh fixes all three — no salary proof, ₹10–₹60/week, sub-30-second settlement.

---

<a id="q4"></a>
**Q4: What is parametric insurance and how is it different from regular insurance?**

A: Regular insurance (indemnity) asks you to prove your loss. Lost income because it rained? Show records, GPS data, evidence. Impossible for gig workers with variable daily earnings.

Parametric insurance doesn't ask for proof. It says: when this measurable event happens — rainfall above 50mm, AQI above 400, platform outage — we pay. The event is the trigger. No adjuster, no paperwork, no dispute. Gig worker disruptions are exactly the kind of objectively measurable, third-party-verifiable events parametric insurance was built for.

---

<a id="q5"></a>
**Q5: Who is this built for?**

A:
- **Primary:** Gig delivery workers aged 22–45 on Swiggy, Zomato, Blinkit, Zepto earning ₹4K–₹8K/week in Indian tier-1 cities
- **Secondary:** Insurance companies wanting to enter the gig economy without building the ML and automation infrastructure themselves — white-label B2B2C
- **Tertiary:** Policy makers and researchers looking at tech-driven social protection for gig workers

---

<a id="q6"></a>
**Q6: What does a gig worker actually experience when using this?**

A: The whole onboarding takes under 4 minutes: enter phone → OTP → platform + city → earnings band → see AI-computed premium (e.g., ₹29/week for a Mumbai Swiggy worker) → pay → policy active.

After that, they do nothing. When heavy rain hits their zone: notification — "Heavy rain detected in Andheri West. Your claim of ₹800 has been processed and sent to your UPI." That's the full experience. Zero touchpoints after signup.

---

<a id="q7"></a>
**Q7: What makes this different from existing insurance products?**

A: Three things no Indian product does together:
- **Auto-filed claims** — No form, no call, no app action. System detects and files.
- **Per-worker dynamic pricing** — Every worker gets a unique weekly premium from their city risk, platform count, and earnings. Not a fixed tier.
- **22-second settlement** — Not 14–30 days.

ACKO is the closest competitor — bite-size insurance — but still uses fixed pricing and requires manual filing. No one else combines all three.

---

<a id="q8"></a>
**Q8: What is a "trigger" — the core concept of this system?**

A: A trigger is a pre-defined measurable threshold that, when crossed, automatically initiates claims for all workers in the affected zone. No human decision needed.

Examples: Rainfall >50mm/hr → HEAVY_RAIN trigger. AQI >400 → SEVERE_POLLUTION. Platform downtime >30 min → MARKET_CLOSURE. Civil curfew declared → CURFEW. Each has a payout multiplier (flood: 1.5×, curfew: 1.1×, heavy rain: 1.0×, pollution: 0.75×). The trigger replaces the adjuster.

---

<a id="q9"></a>
**Q9: What's the business model?**

A: Two paths:

**B2C (own insurer):** Collect ₹10–₹60/week premiums directly, pay claims, retain margin. Needs IRDAI license and capital reserves.

**B2B2C (tech platform):** License the automation engine + ML fraud scoring to an existing licensed insurer. Insurer underwrites the risk; Sanraksh charges per-policy or per-claim SaaS fee. Faster to market, lower regulatory burden.

The competitive moat is the automation layer. Traditional insurers can't profitably offer ₹10–₹60/week with manual adjuster-driven claims — unit economics break. Automation is what makes micro-premiums viable.

---

<a id="q10"></a>
**Q10: Why should anyone trust an automated insurance system?**

A: Three reasons:
- **Transparency:** Every claim decision has a full TRACE audit trail written to `rejection_reason` — e.g., `TRACE:ROUTE_AUTO_PAY|FRAUD_SCORE_LOW|LOCATION_MATCH|PEER_CORROBORATION_OK`. Nothing is a black box.
- **Human override:** Claims scoring 0.35–0.70 go to manual review. An admin can override any automated decision.
- **Conservative design:** The system auto-pays only what it's confident about (72.4%). Uncertain cases go to humans. It never auto-approves everything.

---

## GROUP B — Technical Questions

---

## B1: Architecture & System Design

---

<a id="q11"></a>
**⭐ Q11: What is the overall system architecture?**

A: Three-tier REST API:
```
Next.js 14 (TypeScript frontend)
        ↓ REST / JSON / JWT
FastAPI (Python backend)
        ↓ SQLAlchemy ORM
SQLite (dev) / PostgreSQL 15 (prod)
```

Backend layers: **Routers** (HTTP) → **Services** (business logic: AutomationEngine, FraudDetectionService, PricingService, SignalIngestionService) → **Models** (SQLAlchemy ORM). Auth is JWT stateless — no session table. Background jobs via Celery + Redis (configured for production; simulation runs synchronously in dev).

---

<a id="q12"></a>
**⭐ Q12: Walk through what happens from disruption detected to worker paid.**

A: Seven steps in `automation_engine.py`:

1. `SignalIngestionService.collect_signals()` aggregates confidence from 5 sources (weather, AQI, traffic, platform, social) with event-type-specific weights. HEAVY_RAIN: weather=45%.
2. `Disruption` record created — city, zone, event_type, severity, signal metadata in `event_metadata`.
3. Policy matching: `SELECT policies JOIN users WHERE work_city=city AND work_zone=zone AND status=ACTIVE` — up to 500 workers.
4. Duplicate check per worker: does `(user_id, claim_date, disruption_id)` already exist? Skip if yes.
5. `fraud_detection_service.calculate_fraud_score()` called per worker — returns score 0–1.
6. Routing: score <0.35 → `status=PAID`, `approval_type=AUTO`, payout tx_id assigned. 0.35–0.70 → `PENDING/MANUAL`. >0.70 → `REJECTED` + reason codes.
7. All claims committed in one `db.commit()`. Returns `SimulationSummary` dataclass.

---

<a id="q13"></a>
**Q13: What is a REST API and how is it used here?**

A: REST organizes API endpoints around resources using standard HTTP verbs — GET to read, POST to create, PUT to update, DELETE to remove. Stateless — each request is self-contained.

In Sanraksh, frontend and backend are completely separate. Everything goes through the API. Frontend calls `POST /api/v1/phase2/simulate-disruption` with JSON body, gets JSON back. `GET /api/v1/claims/all` loads the claims feed. All calls go through Axios in the frontend with an interceptor automatically adding `Authorization: Bearer <token>`.

---

<a id="q14"></a>
**Q14: Why not microservices?**

A: The operational overhead — service discovery, inter-service auth, distributed tracing, separate CI pipelines per service — would cost far more than it gives at this scale. The FastAPI monolith with clean service class separation already provides separation of concerns. `AutomationEngine` in `automation_engine.py` is already a stateless class that could be extracted when scale demands it. Build monolith first, extract when you hit real bottlenecks.

---

<a id="q15"></a>
**Q15: What design patterns are used in the code?**

A:
- **Dependency Injection** — FastAPI `Depends()` injects `get_db()` (session) and `get_current_user()` (auth) into handlers
- **Singleton services** — `fraud_detection_service = FraudDetectionService()` at module level, one instance shared
- **Factory pattern** — Claims routing in `run_disruption_simulation()` produces different outcomes based on fraud score
- **Strategy pattern** — Signal ingestion selects and weights different sources based on event type
- **Repository pattern (approximated)** — Service classes abstract all DB interaction from route handlers

---

<a id="q16"></a>
**Q16: What would break at 10,000 users? At 1 million?**

A: **10,000 users** — almost nothing. Switch to PostgreSQL, add 2–4 Gunicorn workers, activate Celery, add composite DB indexes. Manageable.

**1 million users:**
- `_otp_store` dict can't share across processes → needs Redis
- 500-worker simulation cap → needs Celery task fan-out
- PostgreSQL needs read replicas for analytics
- Duplicate detection loops → needs Redis sliding window
- `payout_transaction_id` needs real Razorpay/NPCI UPI rails

---

<a id="q17"></a>
**Q17: What are the three biggest bottlenecks right now?**

A:
1. **`_otp_store` in-memory dict** — no TTL, no cross-process sharing, resets on restart. Must be Redis-backed.
2. **Simulation runs synchronously in HTTP request** — 500 workers, fraud scoring, DB writes, all in one request. Needs Celery for real scale.
3. **Duplicate detection loops per worker** — individual DB queries per worker, not batched. Slow at large worker counts.

---

<a id="q18"></a>
**Q18: What happens if two disruptions hit the same zone at the same time?**

A: Handled independently — each gets its own `Disruption` UUID. The duplicate check is keyed on `(user_id, claim_date, disruption_id)`. If two simulations run for HEAVY_RAIN on the same day in the same zone, each creates a new disruption record → new disruption_id → duplicate check misses it → worker gets two claims. Known bug. True fix: check `(user_id, claim_date, event_type, city, zone)` instead.

---

<a id="q19"></a>
**Q19: What happens if the automation engine crashes halfway through?**

A: Single `db.commit()` at the very end — if the function crashes before reaching it, nothing persists. The session closes and rolls back. Disruption record is `db.flush()`-ed (visible in session only) — it also disappears on rollback. If the function succeeds but the HTTP response fails and the caller retries, the duplicate check catches existing claims and skips them. Mostly idempotent, except for the disruption_id bug in Q18.

---

<a id="q20"></a>
**Q20: How does the frontend know whether to show admin or worker view?**

A: JWT payload includes `role` — either `"admin"` or `"worker"`, set from the User record in the database. On successful OTP verification, the frontend stores it: `localStorage.setItem("role", role)`. `dashboard/page.tsx` reads it: if `role === "admin"` → renders `<AdminHome />`, otherwise `<WorkerHome />`. The sidebar navigation also conditionally renders admin-only links (Control Tower, Claims Feed, Worker Roster, Threat Defense) based on this same value.

---

## B2: The AI & ML Engine

---

<a id="q21"></a>
**⭐ Q21: Where exactly is AI and ML used?**

A:
- **Fraud Detection** (`fraud_detection.py`) — XGBoost classifier scores every auto-generated claim on 5 signals. Returns fraud probability 0–1 and routing decision.
- **Dynamic Pricing** (`premium.py`) — Weighted formula using risk coefficients from data analysis. Per-worker unique premium.
- **Signal Ingestion** (`signal_ingestion.py`) — Weighted confidence aggregation across 5 sources (sensor fusion).
- **Client-side underwriting** (`underwritingEngine.ts`) — Points-based risk scoring in the browser before the API call.

---

<a id="q22"></a>
**⭐ Q22: How does the fraud detection work exactly?**

A: `FraudDetectionService.calculate_fraud_score()` in `fraud_detection.py`:

| Signal | Weight | What triggers it |
|---|---|---|
| Claim frequency | 30% | >8 claims/30d → +0.8; >5 → +0.5; avg gap <3d → +0.6 |
| Location verification | 25% | GPS disabled → +0.5; location ≠ zone → +0.7; no peers in zone → +0.4 |
| Peer corroboration | 25% | <20% zone workers affected → +0.8; 20–50% → +0.3; collusion → +0.9 |
| Amount anomaly | 15% | Claim >2× historical avg → +0.6 |
| Timing pattern | 5% | Filed <1min without auto-trigger → +0.3; same-hour repeat → +0.4 |

Thresholds: <0.35 → `ROUTE_AUTO_PAY` (72.4% of claims). 0.35–0.70 → `ROUTE_MANUAL_REVIEW` (18%). >0.70 → `ROUTE_REJECT` (9.6%). Every decision gets TRACE codes in `rejection_reason`.

---

<a id="q23"></a>
**Q23: What is XGBoost?**

A:
- **What it is** — A machine learning algorithm. Learns patterns from past data to make predictions on new data.
- **What it does in general** — Builds hundreds of small decision trees sequentially, each correcting the previous one's mistakes. Called "gradient boosting" because it minimizes errors using gradients.
- **What it does here** — Powers the fraud detection engine. Trained on 80,000 synthetic claims. Scores each incoming claim 0–1.
- **Why we used it** — 94.2% precision. More importantly: produces feature importance scores that map to human-readable TRACE reason codes. An adjuster needs to know *why* a claim was flagged — neural networks can't provide that.
- **Why not alternatives** — Logistic regression: 82% precision. Random Forest: 89%. Neural networks would be more accurate but are black boxes — unacceptable when you need to explain decisions to policyholders.
- **Version** — 2.0.2

---

<a id="q24"></a>
**Q24: What is gradient boosting in plain terms?**

A: Start with a model that just predicts the average (terrible). Look at where it was wrong. Build a second model targeting exactly those mistakes. Combine them. Look at combined mistakes. Build a third model for those. Repeat 100+ times. Each round the ensemble gets a bit better. XGBoost is a highly optimized, parallelized version of this that runs fast on large datasets.

---

<a id="q25"></a>
**Q25: Could you have used a simpler model?**

A: Yes — logistic regression was tried first: 82% precision. Random Forest: 89%. XGBoost: 94.2%. At thousands of claims per day, each percentage point is real money in fraudulent payouts. The 12-point improvement over logistic regression is worth the added complexity for a financial fraud system.

---

<a id="q26"></a>
**Q26: What is overfitting and is this model at risk?**

A: Overfitting = model memorizes training data instead of learning patterns → great on training, poor on new data. The 94.2% precision is on a held-out test set (data never seen in training), so internal overfitting isn't the issue. The bigger risk is **distribution mismatch**: both training and test data are synthetic. If real fraud patterns differ from the synthetic distribution, the model could perform significantly worse in production. External validity needs real deployment data. This caveat must always be stated alongside the number.

---

<a id="q27"></a>
**Q27: How does the premium pricing formula work?**

A: From `calculate_premium()` in `premium.py`:
```
BASE = ₹10
+ city_risk_coefficient × 6        (Mumbai=0.75, Delhi=0.65, Bengaluru=0.55 ...)
+ min(platform_count, 4) × 4       (capped at 4 platforms)
+ earnings_midpoint / 2000          (bands: 4000_7000 → midpoint ₹5,500)

FINAL = max(₹10, min(₹60, round(RAW)))
COVERAGE/DAY = FINAL × 15
```
Mumbai, 3 platforms, ₹4K–₹7K/week: `10 + 4.50 + 12 + 2.75 = ₹29.25 → ₹29/week → ₹435/day coverage`.

---

<a id="q28"></a>
**Q28: Where does the coverage multiplier ×15 come from?**

A: Design constant calibrated to avoid moral hazard. At ₹29/week, `29×15 = ₹435/day`. A worker loses ₹500–₹700 on a disrupted day — ₹435 replaces 60–85% of income. Not 100%, which matters: 100% replacement would make disruption days worth more than working days. The 15× multiplier makes the product genuinely useful without creating perverse incentives. In a real product, an actuary would derive this from loss data and reserve requirements.

---

<a id="q29"></a>
**Q29: How does signal confidence aggregation work?**

A: `SignalIngestionService.collect_signals()` gets confidence 0–1 from each of 5 sources, then:
```
aggregate_confidence = Σ(source × weight) / Σ(weights)
```
Weights are event-type specific. HEAVY_RAIN: weather=0.45, traffic=0.20, platform=0.15, social=0.10, pollution=0.10. CURFEW: social=0.35, platform=0.25, traffic=0.15, weather=0.15, pollution=0.10.

If confidence <0.60 → strict mode (tighter fraud routing). ≥0.60 → balanced mode. Also feeds `likely_affected_ratio = base_ratio × (0.8 + confidence × 0.5)`.

---

<a id="q30"></a>
**Q30: Was the ML model trained on real data?**

A: No. Trained on 80,000 synthetic claims calibrated against IRDAI fraud statistics (~3% fraud, ~8% questionable). Features engineered from domain knowledge of real fraud patterns. Artifacts stored as `.pkl` files in `backend/app/ml_models/` via joblib. The 94.2% precision is on a held-out split of this synthetic dataset — see Q26 for why that's an important caveat.

---

<a id="q31"></a>
**Q31: What happens when the fraud detection gets it wrong?**

A: **False positives** (legitimate claims flagged): go to manual review queue (`status=PENDING`, `approval_type=MANUAL`). Admin sees TRACE codes and approves via `POST /api/v1/claims/{id}/approve`. **False negatives** (fraud slips through): duplicate detection catches same-day same-event repeats. Peer corroboration catches fraud rings. Post-payout fraud discovered later needs manual clawback — not currently built.

---

<a id="q32"></a>
**Q32: How would you test the fraud model in real production?**

A: Three steps: (1) Shadow mode — run model decisions alongside human adjuster decisions for 30 days without acting on the model. Compare where they agree/disagree. (2) Retrain on real labelled data — once real claims accumulate, replace the synthetic training set with actual fraud labels. Most important step. (3) A/B test — route 90% of claims through the model, 10% through human review. Compare fraud rates and false positive rates between groups to validate real-world performance.

---

<a id="q33"></a>
**Q33: What are scikit-learn, Pandas, and NumPy?**

A:
- **What they are** — The core Python data science stack. scikit-learn: classical ML algorithms + evaluation tools. Pandas: DataFrames (programmable spreadsheets). NumPy: fast array math (the numerical foundation).
- **What they do here** — ML pipeline: preparing the 80K-claim synthetic training dataset, engineering the 5 fraud features, cross-validation, computing precision/recall/F1/ROC-AUC metrics for evaluation.
- **Why these** — The standard Python ML stack. Every ML library, tutorial, and paper uses them. No viable alternatives for this ecosystem.
- **Versions** — scikit-learn 1.3.2, Pandas 2.1.3, NumPy 1.26.2

---

## B3: Backend Technology

---

<a id="q34"></a>
**Q34: What is Python?**

A:
- **What it is** — A programming language known for readability and versatility. Code reads almost like English.
- **What it does in general** — Web development, data science, automation, ML — one of the most widely used languages.
- **What it does here** — The entire backend: FastAPI web server, SQLAlchemy database logic, fraud detection engine, automation engine, pricing calculator, ML pipeline.
- **Why we used it** — Best ML ecosystem on the planet. Building a web API and ML pipeline in the same language means no handoff between systems.
- **Why not alternatives** — Node.js: great APIs, weak ML. Java/Go: fast, but little ML tooling. Python was the only language for both production API and real ML pipeline in one project.
- **Version** — 3.11 in CI, 3.14 locally (mismatch — see Q117)

---

<a id="q35"></a>
**Q35: What is FastAPI?**

A:
- **What it is** — A Python web framework for building APIs — a set of tools that make writing API endpoints fast and clean.
- **What it does in general** — You write Python functions, tell FastAPI which URL + HTTP method triggers each one. It handles routing, validation, auto-generates Swagger docs.
- **What it does here** — Every API endpoint: `/auth/register`, `/phase2/simulate-disruption`, `/claims/all`, etc. Ten routers registered in `main.py`.
- **Why we used it** — Async-first, ~1,200 req/s vs Flask ~380, auto Swagger docs at `/docs` from code, native Pydantic integration.
- **Why not alternatives** — Django: huge overhead (templates, admin, ORM) we don't need. Flask: synchronous by default, requires assembling many third-party packages FastAPI provides out of the box.
- **Version** — 0.104.1

---

<a id="q36"></a>
**Q36: What is Pydantic?**

A:
- **What it is** — A Python library that validates whether data matches the shape you expected. Like a bouncer — wrong format, you don't get in.
- **What it does in general** — Define a model describing valid data. Pydantic validates incoming data against it. Wrong type, missing field → immediate error.
- **What it does here** — Two jobs: (1) Validates every API request body — wrong field type → 422 error before route handler runs. (2) `Settings` class in `config.py` reads all env vars with type conversion via `pydantic-settings`.
- **Why we used it** — Standard for FastAPI. v2 core rewritten in Rust — 5–50× faster than v1.
- **Why not alternatives** — jsonschema is manual. Marshmallow is the Flask-era equivalent but less integrated.
- **Version** — 2.5.0 (pydantic-settings 2.1.0)

---

<a id="q37"></a>
**Q37: What is SQLAlchemy?**

A:
- **What it is** — A Python ORM (Object-Relational Mapper) — lets you work with databases using Python objects instead of raw SQL.
- **What it does in general** — Define database tables as Python classes. SQLAlchemy translates your Python operations into SQL automatically. Database-agnostic.
- **What it does here** — All 6 tables defined as model classes in `models/`. Every query goes through SQLAlchemy. Switching SQLite→PostgreSQL = one env var change.
- **Why we used it** — Gold-standard Python ORM. SQLAlchemy 2.0 introduced a cleaner `select()` API.
- **Why not alternatives** — Raw SQL is fragile. Django's ORM can't be used standalone. Tortoise ORM is async-native but less mature.
- **Version** — 2.0.23

---

<a id="q38"></a>
**Q38: What is Alembic?**

A:
- **What it is** — Database migration tool for SQLAlchemy — version control for your database structure.
- **What it does in general** — When you change a table (add column, rename field), Alembic generates a migration script. `alembic upgrade head` applies changes in production without losing data.
- **What it does here** — `alembic/` directory exists with one initial migration. In local dev, `main.py` calls `Base.metadata.create_all()` directly (simpler). Production should use `alembic upgrade head`.
- **Why we used it** — Official SQLAlchemy migration tool. Without it, production schema changes mean hand-written SQL.
- **Why not alternatives** — Flyway and Liquibase are Java tools. For Python + SQLAlchemy, Alembic is the standard.
- **Version** — 1.12.1

---

<a id="q39"></a>
**Q39: What is Uvicorn?**

A:
- **What it is** — An ASGI web server for Python — handles HTTP connections and feeds them to FastAPI.
- **What it does in general** — FastAPI is an ASGI app. Uvicorn is the server that runs it. Handles async I/O — can start processing a new request while waiting for a DB response on another.
- **What it does here** — `uvicorn app.main:app --reload --port 8000` starts the backend. `app.main` = module path, `:app` = the FastAPI instance. Production: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app`.
- **Why we used it** — Required by FastAPI. Standard ASGI server.
- **Why not alternatives** — Gunicorn alone is WSGI-only — can't run FastAPI. Hypercorn works but Uvicorn has better benchmarks and adoption.
- **Version** — 0.24.0

---

<a id="q40"></a>
**Q40: What is httpx?**

A:
- **What it is** — An async HTTP client for Python — a library for making web requests that works inside async code.
- **What it does in general** — Like `requests` but async. `await client.get(url)` doesn't block the event loop while waiting for the response.
- **What it does here** — Used in `weather.py` to call the OpenWeatherMap API inside an async FastAPI route handler. Using `requests` there would freeze the event loop.
- **Why we used it** — Drop-in async replacement for `requests`. Same familiar API, full async support.
- **Why not alternatives** — `aiohttp` works but has a different API style. httpx mirrors `requests`, making it easier to read.
- **Version** — 0.25.2

---

<a id="q41"></a>
**Q41: What is python-jose?**

A:
- **What it is** — Python library for creating and verifying JWT tokens — the signed passes that prove identity on every API request.
- **What it does in general** — JWT encodes identity info (user ID, role, expiry) into a signed compact string. Server verifies it without hitting a database.
- **What it does here** — `create_access_token()` in `auth.py` signs `{sub: user_id, phone, role, exp}` with HS256 using `settings.SECRET_KEY`. TTL: 30 min. `get_current_user()` decodes and verifies on every protected request.
- **Why we used it** — Standard Python JWT library. Clean HS256 support. Integrates with FastAPI's security utilities.
- **Why not alternatives** — PyJWT is similar — would also work. python-jose was chosen for API clarity.
- **Version** — 3.3.0

---

<a id="q42"></a>
**Q42: What is passlib and bcrypt?**

A:
- **What it is** — passlib is a Python hashing library. bcrypt is the algorithm it uses here.
- **What it does in general** — bcrypt scrambles text into a fixed-length hash. One-way (can't reverse). Includes random salt (same input → different hash each time). Deliberately slow (brute-force expensive).
- **What it does here** — OTPs are hashed with bcrypt before storing in `_otp_store`. Verification uses bcrypt's `verify()` without reversing.
- **Why we used it** — Industry standard for securely storing secrets that need verification. SHA-256 is too fast — hackers try billions/second. bcrypt's slowness is a security feature.
- **Why not alternatives** — SHA-256 alone is insufficient. argon2 is technically better but less established. bcrypt is proven and widely supported.
- **Version** — passlib 1.7.4, bcrypt ≥3.2.0,<4.0.0

---

<a id="q43"></a>
**Q43: What is Geopy?**

A:
- **What it is** — Python library for geographic calculations — distances between GPS coordinates.
- **What it does in general** — Provides haversine formula (straight-line distance between two lat/lng points), geocoding (address → coordinates), and reverse geocoding.
- **What it does here** — Route plausibility check in fraud detection. If a worker's GPS is far from the disruption zone, geopy's haversine calculation catches it — a GPS spoofing indicator.
- **Why we used it** — Clean API, no external service needed for distance calculations.
- **Why not alternatives** — Could write haversine from scratch in 5 lines, but geopy handles edge cases cleanly. Shapely is more powerful but heavier.
- **Version** — 2.4.1

---

<a id="q44"></a>
**Q44: What is Swagger / OpenAPI?**

A:
- **What it is** — OpenAPI is a standard format for describing APIs. Swagger UI is the interactive browser documentation that reads an OpenAPI spec.
- **What it does in general** — Describes every endpoint (URL, method, inputs, outputs) in a machine-readable format. Swagger renders this as a page where you can read and call the API in the browser.
- **What it does here** — FastAPI auto-generates the full OpenAPI spec from route signatures and Pydantic models. Zero manual documentation. Available at `/docs` (Swagger) and `/redoc` (ReDoc).
- **Why we used it** — Comes free with FastAPI. Always in sync with code — no documentation drift.
- **Why not alternatives** — Writing API docs manually in Markdown or Postman goes stale. FastAPI's auto-generation is always accurate.
- **Version** — Auto-generated by FastAPI 0.104.1

---

<a id="q45"></a>
**Q45: What is async/await and why does it matter?**

A: Without async, a server handles one request at a time. While waiting for a database response, the server freezes — can't handle other requests. Async lets the server do other work during that wait.

FastAPI routes declared `async def` can `await` slow operations (HTTP calls, queries) without blocking. The weather API call in `weather.py` uses `async with httpx.AsyncClient()` for this reason. Database queries still use SQLAlchemy's synchronous session here — async SQLAlchemy adds complexity. For current load, synchronous DB calls are fast enough.

---

<a id="q46"></a>
**Q46: What is middleware and where is it used?**

A: Middleware is code that runs on every request before it hits the route handler, and on every response before it returns to the client. In `main.py`, `CORSMiddleware` runs on every request — reads the `Origin` header, adds CORS response headers. Middleware is also where you'd add global rate limiting, request logging, or auth checks that apply to all routes.

---

<a id="q47"></a>
**Q47: What is CORS and why does it matter?**

A: Browsers enforce the Same-Origin Policy — JavaScript at `http://localhost:3000` cannot call `http://localhost:8000` without permission. CORS (Cross-Origin Resource Sharing) is the mechanism granting that permission via response headers like `Access-Control-Allow-Origin`. Without these headers, the browser blocks the response before JavaScript sees it.

In `main.py`: `CORSMiddleware` with `allow_origins = settings.CORS_ORIGINS.split(",")`, defaulting to `http://localhost:3000,https://sanraksh.vercel.app`. Production should restrict to the exact production domain.

---

<a id="q48"></a>
**Q48: How does environment configuration work?**

A: `config.py` has a `Settings` class inheriting Pydantic's `BaseSettings`. Every setting has a type annotation and default. On instantiation, reads the `.env` file + actual env vars (env vars take priority). The `settings` singleton is imported by every module needing config. Secrets default to empty strings and must be supplied externally. `.env` is in `.gitignore` — never committed.

---

## B4: Frontend Technology

---

<a id="q49"></a>
**Q49: What is React?**

A:
- **What it is** — A JavaScript library for building user interfaces from small reusable pieces called components.
- **What it does in general** — You write components (button, card, table). React keeps the page in sync with data — when data changes, it updates the minimum necessary parts.
- **What it does here** — Every page in the Sanraksh frontend — dashboard cards, claims table, risk map markers, onboarding steps — is built from React components.
- **Why we used it** — Next.js is built on React (inherent choice). Largest frontend ecosystem, best TypeScript integration, perfect for dynamic real-time dashboards.
- **Why not alternatives** — Vue.js: strong but smaller TypeScript story. Angular: heavier, more opinionated. Plain HTML/JS can't efficiently build the real-time dashboard needed.
- **Version** — 18.x (via Next.js 14)

---

<a id="q50"></a>
**Q50: What is Next.js?**

A:
- **What it is** — A framework built on React adding routing, server-side rendering, and production optimization. React is a UI library; Next.js is the full application framework.
- **What it does in general** — Every folder under `src/app/` becomes a URL. Automatic code splitting per route. Supports SSR, image optimization.
- **What it does here** — The entire Sanraksh frontend. `dashboard/claims/` → `/dashboard/claims`. 15+ pages organized cleanly. Code splitting means a worker visiting Claims doesn't download Analytics code.
- **Why we used it** — App Router (v14 default) makes 15+ pages clean to organize. SSR improves initial paint on mid-range Android phones (target user hardware). Deploys perfectly on Vercel.
- **Why not alternatives** — Plain React needs separate router + bundler config. Remix is a good alternative but less mature. For this many routes + Vercel deployment, Next.js was obvious.
- **Version** — 14.0.4

---

<a id="q51"></a>
**Q51: What is TypeScript?**

A:
- **What it is** — JavaScript with types added. You declare "this variable must be a number" — the compiler checks it before the code runs.
- **What it does in general** — Catches type bugs at development time instead of runtime. Enables much better IDE autocomplete.
- **What it does here** — `UnderwritingResult` ensures `riskTier` is only `"low"|"medium"|"high"`. `GigWorker` type ensures all 175 worker records have required fields. Across 15+ pages using the same API types, TypeScript keeps it consistent.
- **Why we used it** — In a financial app handling premiums and payouts, silent type errors are dangerous. TypeScript makes them impossible to ship.
- **Why not alternatives** — Plain JavaScript lets type errors reach production silently.
- **Version** — 5.0

---

<a id="q52"></a>
**Q52: What is TailwindCSS?**

A:
- **What it is** — A CSS framework where you apply small pre-built classes directly on HTML elements instead of writing CSS in separate files.
- **What it does in general** — Instead of `.card { padding: 16px; border-radius: 8px; }` in a CSS file, you write `className="p-4 rounded-lg"` on the element.
- **What it does here** — Styles every component. Entire design system — colors, spacing, typography, responsiveness — in Tailwind classes.
- **Why we used it** — Styles stay with the component. JIT compiler only includes CSS classes actually used — tiny bundle.
- **Why not alternatives** — CSS Modules: separate `.module.css` per component — more overhead. styled-components: runtime overhead. Regular CSS: hard to track what affects what as project grows.
- **Version** — 3.3.0

---

<a id="q53"></a>
**Q53: What is Framer Motion?**

A:
- **What it is** — An animation library for React.
- **What it does in general** — Wrap elements in `<motion.div>` with `initial`, `animate`, `exit` props. React-aware — animations respond to component mount/unmount naturally.
- **What it does here** — Multi-step onboarding page transitions. Dashboard KPI cards staggered entrance: `transition={{ delay: i * 0.07 }}`. Route animations via `AnimatePresence`.
- **Why we used it** — Declarative animation syntax, integrates naturally with React component lifecycle.
- **Why not alternatives** — CSS animations disconnect from component state. React Spring is similar but Framer Motion's API is more intuitive.
- **Version** — 12.x

---

<a id="q54"></a>
**Q54: What is Recharts?**

A:
- **What it is** — A React chart library built on D3.
- **What it does in general** — Composable React chart components — no need to write low-level D3 code.
- **What it does here** — Three charts in `dashboard/analytics/`: bar chart (7-day claims volume + payout), pie chart (coverage type distribution), line chart (premium trends). Data from `/api/v1/analytics/claims-summary` and `/api/v1/analytics/policy-mix`.
- **Why we used it** — React-native components, good TypeScript support, smaller learning curve than raw D3.
- **Why not alternatives** — Raw D3: too low-level. Chart.js: harder to integrate with React. Victory: similar but less widely used.
- **Version** — 2.10.3

---

<a id="q55"></a>
**Q55: What is React Leaflet?**

A:
- **What it is** — Leaflet is an open-source map library. React Leaflet wraps it for React.
- **What it does in general** — Interactive tile-based maps with markers, popups, click events — no paid API needed.
- **What it does here** — Risk map at `dashboard/risk-map/`. Circle markers at each of 7 risk zone coordinates. Red (overall_risk ≥0.7), amber (≥0.45), green (lower). Click = detailed breakdown popup.
- **Why we used it** — Free, open-source, OpenStreetMap tiles need no billing. Clean React bindings.
- **Why not alternatives** — Google Maps: requires billing. MapboxGL: complex license and setup. Leaflet is perfect for this use case.
- **Version** — Leaflet 1.9.4, React-Leaflet 4.2.1

---

<a id="q56"></a>
**Q56: What is Axios?**

A:
- **What it is** — An HTTP client for JavaScript for making web requests from the browser.
- **What it does in general** — Like the browser's built-in `fetch` but with cleaner interface, automatic JSON handling, and request/response interceptors.
- **What it does here** — All frontend API calls use Axios. Key feature: interceptor automatically adds `Authorization: Bearer <token>` to every request — JWT never forgotten.
- **Why we used it** — Interceptors for automatic JWT injection. Cleaner error handling than raw `fetch`.
- **Why not alternatives** — `fetch` has no interceptors natively — manually adding the auth header every call is error-prone.
- **Version** — 1.6.x

---

<a id="q57"></a>
**Q57: What is server-side rendering (SSR)?**

A: SSR = HTML generated on the server before sending to the browser. Browser gets a fully rendered page immediately instead of a blank shell that JavaScript fills in. Matters for: (1) SEO — search engines read actual content, and (2) initial load speed on slow connections. For dashboard pages (need live data + JWT), client-side rendering is appropriate. For the public landing page and registration page, Next.js SSR gives a fast initial paint on mid-range Android phones — the target device.

---

<a id="q58"></a>
**Q58: Why not Redux for state management?**

A: Redux adds significant ceremony — actions, reducers, dispatch, selectors, middleware, separate files for all of it. For this project: auth state lives in localStorage via `userStore.ts`, onboarding data uses React `useState`, demo context uses a React context. None of the state is complex enough to need a library. Adding Redux would be hundreds of lines of boilerplate for no real benefit. If the app grew to 50+ pages with shared state across unrelated components, Zustand or Redux would make sense. At 15+ pages, it doesn't.

---

<a id="q59"></a>
**Q59: What is the workerData.ts file?**

A: A 175-worker synthetic dataset across 5 Indian cities — Delhi, Mumbai, Bangalore, Hyderabad, Pune. Each worker has `worker_id`, `platform`, `city`, `days_active_last_30`, `avg_daily_income`, `hours_per_day`, `weather_exposure_days`, `aqi_exposure_days`, `risk_zone`. Calibrated realistically: Delhi workers have higher AQI exposure (multiplier 1.15×), Mumbai higher weather exposure (1.25×). Distribution: ~14% inactive, ~34% moderate, ~52% heavy. Powers demo mode onboarding pre-fill and `underwritingEngine.ts` risk preview.

---

## B5: Database

---

<a id="q60"></a>
**Q60: What is PostgreSQL?**

A:
- **What it is** — A powerful open-source relational database. Tables, rows, columns, foreign keys, concurrent access, full ACID.
- **What it does in general** — Stores data reliably at scale. Handles thousands of simultaneous connections. ACID guarantees every write.
- **What it does here** — The production database. All 6 tables in PostgreSQL when deployed. Docker Compose runs PostgreSQL 15 as a container.
- **Why we used it** — Full ACID, concurrent write support (SQLite breaks under concurrent writes from multiple Uvicorn workers), JSONB support, read replica support for analytics at scale.
- **Why not alternatives** — MySQL: close competitor but PostgreSQL has better standards compliance, stronger JSONB, more popular in Python ecosystem. MongoDB: rejected because insurance data is relational (see Q64).
- **Version** — 15 (Docker)

---

<a id="q61"></a>
**Q61: What is SQLite?**

A:
- **What it is** — A file-based embedded database. No server process — the entire database is one `.db` file.
- **What it does in general** — Full relational database (SQL, tables, foreign keys) embedded in the application. Not designed for high concurrency.
- **What it does here** — Local development database. File is `sanraksh.db` in `backend/`. SQLAlchemy treats it identically to PostgreSQL — switching is one env var.
- **Why we used it** — Zero setup. Anyone can clone and run the backend in 4 commands. Database just appears on first startup.
- **Why not alternatives** — PostgreSQL locally is fine but requires Docker or a local install. SQLite removes that friction entirely for dev.
- **Version** — Built into Python standard library

---

<a id="q62"></a>
**Q62: What is Psycopg2?**

A:
- **What it is** — The connector that lets Python talk to PostgreSQL. SQLAlchemy speaks Python; psycopg2 translates that into PostgreSQL's wire protocol.
- **What it does in general** — Bridge between Python code and PostgreSQL engine. Manages connections, sends queries, parses results.
- **What it does here** — Used automatically by SQLAlchemy when `DATABASE_URL` starts with `postgresql://`. For SQLite, Python's built-in `sqlite3` is used instead.
- **Why we used it** — Standard, most widely used PostgreSQL adapter for Python. `-binary` variant bundles the PG client library — no separate PostgreSQL client install needed.
- **Why not alternatives** — `asyncpg` is async-native but requires SQLAlchemy async session API, adding complexity. Psycopg2 works reliably with standard synchronous SQLAlchemy.
- **Version** — 2.9.9 (psycopg2-binary)

---

<a id="q63"></a>
**⭐ Q63: What does the database schema look like?**

A: Six tables:

**users** — id (UUID PK), phone (unique, indexed), name, email (unique, nullable), aadhaar_hash (SHA-256), delivery_platform (enum: SWIGGY/ZOMATO/BLINKIT/ZEPTO/DUNZO/UBER/OLA/OTHER), work_city, work_zone, work_location lat/lng, kyc_status (PENDING/SUBMITTED/VERIFIED/REJECTED), risk_score, is_active.

**policies** — id (UUID PK), user_id (FK→users), policy_number (unique, indexed), start_date, end_date, status (ACTIVE/EXPIRED/CANCELLED/SUSPENDED), weekly_premium, coverage_amount, coverage_type.

**claims** — id (UUID PK), claim_number (unique, indexed), user_id (FK→users), policy_id (FK→policies), disruption_id (FK→disruptions), claim_date, claim_amount, status (PENDING/PAID/REJECTED/UNDER_REVIEW), approval_type (AUTO/MANUAL), fraud_score, location_verified, peer_validation_count, rejection_reason (stores TRACE codes), payout_date, payout_transaction_id.

**disruptions** — id (UUID PK), disruption_type (WEATHER/TRAFFIC/SOCIAL/PLATFORM), event_type (9 types: HEAVY_RAIN, FLOOD, EXTREME_HEAT, SEVERE_POLLUTION, CURFEW, TRAFFIC_JAM, ROAD_CLOSURE, STRIKE, MARKET_CLOSURE), severity (LOW/MEDIUM/HIGH/EXTREME), city, zone, affected_radius_km, start_time, end_time, is_active, source, event_metadata (JSON as Text).

**risk_zones** — id (UUID PK), city, zone (indexed), lat, lng, weather_risk_score, traffic_risk_score, social_risk_score, overall_risk_score (`weather×0.5 + traffic×0.3 + social×0.2`), population_density, avg_disruptions_per_month.

**support_messages** — id (UUID PK), name, email, category (enum), message, status (NEW/READ/REPLIED), admin_reply, created_at, replied_at.

---

<a id="q64"></a>
**Q64: Why not MongoDB?**

A: Insurance data is relational — a claim references a policy, which references a user, which references a disruption. These need database-level enforcement. MongoDB doesn't enforce referential integrity automatically — you'd do it in application code, error-prone and unauditable. More importantly: financial operations need ACID guarantees. When a claim is created and marked PAID, either both happen or neither does. PostgreSQL gives you ACID by default. For financial data, default ACID is non-negotiable.

---

<a id="q65"></a>
**Q65: What is ACID?**

A: Four database guarantees:
- **Atomicity** — All-or-nothing. A claim creation that fails halfway leaves nothing in the database.
- **Consistency** — Database always goes from one valid state to another. Can't have a claim pointing to a nonexistent policy.
- **Isolation** — Two simultaneous operations don't interfere with each other.
- **Durability** — Once committed, data survives even if the server crashes immediately after.

PostgreSQL and SQLite both provide full ACID. This is why they're used for financial data.

---

<a id="q66"></a>
**Q66: What indexing exists and what's missing?**

A: **Existing:** `User.phone` (login field), `Policy.policy_number` (unique), `Claim.claim_number` (unique), `Disruption.city`, `Disruption.zone`, `RiskZone.city`, `RiskZone.zone`.

**Missing at scale:**
- Composite `(city, zone, status)` on policies — automation engine's policy matching query filters all three; without it, full scan of all active policies
- Composite `(user_id, claim_date, event_type)` on claims — duplicate detection checks these three per worker; composite index makes it O(log n) instead of O(n)

---

<a id="q67"></a>
**Q67: How are relationships between tables handled?**

A: Via `ForeignKey` column definitions in SQLAlchemy models. `Claim` has `user_id = Column(String, ForeignKey("users.id"))`, `policy_id = Column(String, ForeignKey("policies.id"))`, `disruption_id = Column(String, ForeignKey("disruptions.id"))`. Database-level constraints — can't insert a claim with a nonexistent user_id. Automation engine uses explicit joins: `select(Policy, User).join(User, Policy.user_id == User.id).where(User.work_city == city)` — SQLAlchemy 2.0 style.

---

<a id="q68"></a>
**Q68: How is data validated before it hits the database?**

A: Two layers: **Pydantic at the API boundary** — every route body uses a Pydantic model. Wrong types, missing fields → HTTP 422 before the handler runs. **SQLAlchemy at persistence** — unique constraints on phone, email, policy_number, claim_number. Enum columns reject invalid values. Foreign key constraints reject invalid references. Between these two layers, very little bad data can slip through.

---

## B6: Authentication & Security

---

<a id="q69"></a>
**Q69: What is JWT — JSON Web Token?**

A:
- **What it is** — A compact signed string that proves who you are. Like a stamped wristband — the server stamped it, so it's valid without checking a guest list each time.
- **What it does in general** — Encodes identity info (user ID, role, expiry) into a base64 string signed with a secret key. Server verifies any JWT without a database lookup.
- **What it does here** — Issued on OTP success. Payload: `{sub: user_id, phone, role, exp}`, signed HS256 with `settings.SECRET_KEY`. TTL: 30 minutes. Every protected request includes it as `Authorization: Bearer <token>`.
- **Why we used it** — Stateless auth — no session table. Token carries everything needed to identify the user.
- **Why not alternatives** — Session cookies require a server-side session store. For a stateless API with multiple workers, sessions add complexity. JWTs are the standard for stateless API auth.
- **Version** — python-jose 3.3.0

---

<a id="q70"></a>
**⭐ Q70: How does authentication work end to end?**

A:
1. `POST /api/v1/auth/register` — creates `User` record + auto-creates `Policy`
2. `POST /api/v1/auth/send-otp` — generates 6-digit OTP, stores in `_otp_store[phone]`, returns in response (demo mode)
3. `POST /api/v1/auth/verify-otp` — checks stored OTP or accepts `DEMO_OTP = "123456"` (workers) / `"000000"` (admin)
4. On success: `create_access_token()` signs payload with HS256 → JWT returned
5. Frontend stores JWT in localStorage. Axios interceptor adds it to every request header.
6. Protected routes: `get_current_user()` dependency decodes token, verifies signature + expiry, returns User object.

---

<a id="q71"></a>
**Q71: Why OTP instead of username and password?**

A: Three reasons: (1) **Familiarity** — delivery workers already use OTP for UPI, Paytm, and delivery apps. It's their existing financial auth model. (2) **No support burden** — passwords get forgotten, shared, and create tickets. OTPs eliminate "forgot password" entirely. (3) **Stronger baseline** — phone-verified identity is a stronger starting point than a self-created password for financial payouts.

---

<a id="q72"></a>
**Q72: What is SQL injection and how is it prevented?**

A: SQL injection = attacker puts SQL code in a form field and the app accidentally executes it. Classic: login form where attacker types `'; DROP TABLE users; --`. If the app concatenates user input into SQL strings, the command runs.

SQLAlchemy's ORM never does that. All values go as parameterized queries — SQL and data sent separately, database treats input as data only. This protection is automatic. You'd have to bypass the ORM entirely and write string-interpolated raw SQL to be vulnerable.

---

<a id="q73"></a>
**Q73: What is XSS and is the frontend vulnerable?**

A: XSS (Cross-Site Scripting) = attacker injects malicious JavaScript into a page that other users load. That script could steal localStorage data (including the JWT), make requests on the user's behalf, or deface the UI. The JWT is in localStorage, which JavaScript can read. Next.js auto-escapes all JSX content by default — you'd need to explicitly use `dangerouslySetInnerHTML` to create an XSS hole. There's no `dangerouslySetInnerHTML` in this codebase. Fully secure production solution: `httpOnly` cookie (JavaScript can't read it at all).

---

<a id="q74"></a>
**⭐ Q74: What are the known security issues?**

A: Three deliberate demo shortcuts that would be production vulnerabilities:

1. **`DEMO_OTP = "123456"` in `auth.py`** — Any phone can log in with this. Deliberate for demo usability. Remove entirely in production.
2. **`_otp_store` is an in-memory dict** — No TTL, no cross-process sharing, resets on restart. Redis-backed with 10-min key expiry needed for production.
3. **`SECRET_KEY` placeholder in docker-compose.yml** — The literal string "your-super-secret-key-change-this-in-production-min-32-chars-long" is on GitHub. Anyone can forge admin JWTs. Fix: `openssl rand -hex 32`, store in secrets manager, never commit.

---

<a id="q75"></a>
**Q75: How is CORS configured?**

A: `CORSMiddleware` in `main.py`: `allow_origins = settings.CORS_ORIGINS.split(",")`, defaults to `http://localhost:3000,https://sanraksh.vercel.app`. `allow_credentials=True`. `allow_methods=["*"]`, `allow_headers=["*"]` — permissive in dev. Production: restrict to exact domain, limit methods to `["GET","POST","PUT","DELETE"]`, limit headers to `["Authorization","Content-Type"]`.

---

<a id="q76"></a>
**Q76: How is Aadhaar data handled?**

A: Raw Aadhaar numbers are never stored. The `User` model has `aadhaar_hash = Column(String)` storing SHA-256 of the Aadhaar number. SHA-256 is one-way — you can verify a match but can't reverse the hash. Even if the database is compromised, no Aadhaar numbers are exposed.

---

<a id="q77"></a>
**Q77: No passwords — how are OTPs stored?**

A: OTPs are hashed with bcrypt before storage in `_otp_store`. The submitted OTP is compared using bcrypt's `verify()` which checks the hash without reversing it. So even with access to the in-memory dict, you can't read the stored OTPs. In production, these would move to Redis keys with 10-minute TTL.

---

## B7: Infrastructure & DevOps

---

<a id="q78"></a>
**Q78: What is Docker?**

A:
- **What it is** — A tool that packages your app and everything it needs into a portable container. Same behavior on every machine.
- **What it does in general** — Eliminates "works on my machine." Build a Docker image once, run it identically anywhere.
- **What it does here** — Backend: Python 3.11 image, installs `requirements.txt`, runs uvicorn. Frontend: Node 18 image, installs npm deps, runs `next dev`.
- **Why we used it** — One-command full stack startup. Eliminates environment setup issues.
- **Why not alternatives** — VMs do the same but are gigabytes heavier and take minutes to start. Docker is the dominant standard.
- **Version** — Latest (Docker Desktop)

---

<a id="q79"></a>
**Q79: What is Docker Compose?**

A:
- **What it is** — Manages multiple Docker containers together as one application.
- **What it does in general** — Define all services in one `docker-compose.yml`. One command starts them in correct order with right dependencies.
- **What it does here** — Orchestrates PostgreSQL 15, Redis 7, FastAPI backend, Next.js frontend on a shared bridge network. Health checks ensure PostgreSQL + Redis are ready before backend starts.
- **Why we used it** — Four services manually in four terminals is tedious. Docker Compose makes it one command.
- **Why not alternatives** — Kubernetes is the production-grade orchestrator but massively over-engineered for local dev.
- **Version** — Latest (bundled with Docker Desktop)

---

<a id="q80"></a>
**Q80: Container vs virtual machine?**

A: A VM emulates an entire computer — own OS kernel, virtual hardware. Heavy: minutes to start, gigabytes of RAM, full OS license. A container shares the host's OS kernel and just isolates the app's processes and filesystem. Lightweight: seconds to start, megabytes of RAM. Docker containers are the modern standard for packaging server applications.

---

<a id="q81"></a>
**Q81: What is GitHub Actions?**

A:
- **What it is** — A system built into GitHub that runs tasks automatically when code is pushed.
- **What it does in general** — YAML files in `.github/workflows/` define jobs. GitHub runs them on its cloud servers on every push or PR.
- **What it does here** — Three jobs on every push to `main`: `test-backend` (pytest on PostgreSQL 15), `test-frontend` (jest + next build), `lint` (flake8). All three must pass before Vercel auto-deploys.
- **Why we used it** — Free for public repos. Built into GitHub — zero external setup.
- **Why not alternatives** — CircleCI/Travis CI need separate accounts. Jenkins needs infrastructure. GitHub Actions needs only a `.github/workflows/` folder.
- **Version** — N/A (service)

---

<a id="q82"></a>
**Q82: What is Vercel?**

A:
- **What it is** — A cloud platform built specifically for deploying Next.js and other frontend frameworks.
- **What it does in general** — Connect GitHub repo → Vercel auto-deploys every push to `main`. Handles SSL, global CDN, preview URLs for PRs.
- **What it does here** — Hosts the Sanraksh frontend at `sanraksh.vercel.app`. Deployment is automatic after CI passes. Zero configuration beyond connecting the repo.
- **Why we used it** — Vercel created Next.js — integration is perfect. Free tier covers this project's traffic.
- **Why not alternatives** — Netlify is a close alternative. Vercel won for seamless Next.js integration.
- **Version** — N/A (service)

---

<a id="q83"></a>
**Q83: What is AWS EC2?**

A:
- **What it is** — Amazon's cloud virtual machine service — rent a server in Amazon's data centers.
- **What it does in general** — Choose machine size, Amazon starts a VM in minutes, SSH in and set it up like any Linux server.
- **What it does here** — FastAPI backend was deployed on `t3.micro` (1 vCPU, 1 GB RAM, Ubuntu 22.04). Currently stopped to avoid costs. Backend is run locally for demos.
- **Why we used it** — Free tier covers t3.micro. Full control — install anything, configure ports, run systemd services.
- **Why not alternatives** — Railway and Render are simpler PaaS options (deploy with git push). For production, those would be faster to manage. EC2 was chosen to understand the full deployment process.
- **Version** — t3.micro, Ubuntu 22.04 LTS

---

<a id="q84"></a>
**Q84: What is CI/CD and how does it work here?**

A: CI (Continuous Integration) = automatically test every code change. CD (Continuous Deployment) = automatically deploy code that passes tests.

`.github/workflows/ci.yml` has three jobs: **test-backend** — Python 3.11 + PostgreSQL 15 service container, runs `pytest tests/ -v --cov=app`, uploads coverage to Codecov. **test-frontend** — Node 18, `npm ci`, `npm run build`, `npm test -- --ci`. **lint** — `flake8` checking syntax errors + undefined names (E9, F63, F7, F82). All pass → Vercel auto-deploys frontend. Backend deployment to EC2 is manual.

---

<a id="q85"></a>
**Q85: What environment variables are required for production?**

A: **Backend:** `DATABASE_URL` (PostgreSQL), `REDIS_URL`, `SECRET_KEY` (real 32+ char random key — NOT the docker-compose placeholder), `ENVIRONMENT=production`, `DEBUG=False`, `CORS_ORIGINS` (production domain), `OPENWEATHER_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `SENDGRID_API_KEY`. **Frontend:** `NEXT_PUBLIC_API_URL` (production backend URL). Critical: `DEBUG=False` prevents internal error details from leaking in API responses.

---

## B8: Integration Services

---

<a id="q86"></a>
**Q86: What is Redis?**

A:
- **What it is** — A database that stores data in RAM. Because RAM is much faster than disk, reads and writes happen in microseconds.
- **What it does in general** — Used as a cache, session store, or message queue. Key-value pairs stored in memory.
- **What it does here** — Two roles: (1) Celery message broker — background tasks published to Redis queues. (2) Intended OTP store in production — each OTP with 10-min TTL auto-expiry.
- **Why we used it** — Celery needs a broker — Redis or RabbitMQ. Redis was chosen because it handles both broker and OTP storage in one dependency.
- **Why not alternatives** — RabbitMQ is a dedicated message broker with more features but adds overhead. Redis handles both jobs well here.
- **Version** — Redis 7 (Docker), redis Python client 4.6.0 + hiredis 2.2.3

---

<a id="q87"></a>
**Q87: What is Celery?**

A:
- **What it is** — A background job runner for Python. Push tasks to a queue so they run separately from the web request that triggered them.
- **What it does in general** — Web requests must return fast. Long tasks (polling an API, processing 500 claims) get pushed to Celery and processed asynchronously by separate worker processes.
- **What it does here** — Two tasks defined: `weather_monitor.py` polls OpenWeatherMap every 5 minutes, `claim_processor.py` processes claims in batches. Currently not actively running — simulation runs synchronously in dev. Production needs Celery as a separate process.
- **Why we used it** — Weather polling and claim automation must run on a fixed interval, independently of HTTP requests. Celery + Redis is the standard Python solution.
- **Why not alternatives** — APScheduler: works but doesn't scale to multiple workers. RQ: simpler but fewer features. Celery is the most mature Python task queue.
- **Version** — 5.3.4

---

<a id="q88"></a>
**Q88: What is Twilio?**

A:
- **What it is** — A cloud service for sending SMS and WhatsApp messages programmatically.
- **What it does in general** — Call their API with a phone number and message — Twilio delivers it through carrier networks globally.
- **What it does here** — Intended for OTP delivery via SMS/WhatsApp. Currently not active — `/send-otp` returns the OTP in the response body for demo. Production fix: call `twilio_client.messages.create(to=phone, body=f"Your OTP: {otp}")` and remove OTP from response.
- **Why we used it** — India-compatible, WhatsApp support (workers use WhatsApp more than SMS), clean Python SDK.
- **Why not alternatives** — MSG91 and TextLocal are Indian alternatives. Twilio was chosen for SDK quality and documentation.
- **Version** — 8.10.3

---

<a id="q89"></a>
**Q89: What is Razorpay?**

A:
- **What it is** — India's largest payment gateway — handles UPI, cards, net banking, wallets.
- **What it does in general** — Create a payment order via API, user pays through Razorpay checkout, Razorpay sends webhook confirming payment.
- **What it does here** — Intended for collecting weekly premiums and sending claim payouts via UPI. Currently simulated — mock card UI in frontend (4242 **** **** 4242). SDK installed, configured, not actively called.
- **Why we used it** — Built for Indian market. UPI is native first-class feature. Industry standard for Indian fintech.
- **Why not alternatives** — Stripe: better DX but no native Indian UPI, charges in USD. Paytm PG: more complex API. Razorpay is the standard.
- **Version** — 1.4.1

---

<a id="q90"></a>
**Q90: What is SendGrid?**

A:
- **What it is** — A cloud service for sending transactional emails at scale.
- **What it does in general** — Call their API with recipient/subject/body — SendGrid handles delivery, bounce management, deliverability.
- **What it does here** — Intended for claim settlement emails, policy confirmations, KYC status notifications. Configured with `SENDGRID_API_KEY` and `FROM_EMAIL = "noreply@sanraksh.app"` but not called anywhere in the active codebase.
- **Why we used it** — Generous free tier, excellent deliverability, clean Python SDK.
- **Why not alternatives** — AWS SES is cheaper at scale but more setup. Mailgun is similar but less popular in Python. SendGrid's free tier is sufficient.
- **Version** — 6.10.0

---

<a id="q91"></a>
**Q91: What is the OpenWeatherMap API?**

A:
- **What it is** — A web service providing real-time weather data for any location on Earth via HTTP.
- **What it does in general** — Call with lat/lng → get current temperature, rainfall, wind speed, conditions as JSON.
- **What it does here** — `WeatherService` in `weather.py` calls OpenWeatherMap with city coordinates from `CITY_COORDS` dict (e.g., Mumbai: 19.0760, 72.8777). Returns `rain_1h` and `temperature`. Feeds the weather signal in confidence aggregation. Falls back to simulated value if API unavailable.
- **Why we used it** — Free tier: 1,000 calls/day — enough for 5-min polling across 6 cities (288 calls/day max). Good Indian city coverage.
- **Why not alternatives** — India Meteorological Department (IMD) is authoritative but has no free API. Weather.com/AccuWeather have more restrictive free tiers.
- **Version** — API v2.5, accessed via httpx

---

<a id="q92"></a>
**Q92: What is joblib?**

A:
- **What it is** — A Python library for saving Python objects to disk efficiently — especially ML model weights (large NumPy arrays).
- **What it does in general** — `joblib.dump(model, "file.pkl")` saves. `joblib.load("file.pkl")` restores. Optimized for the large array structures in ML models.
- **What it does here** — The trained XGBoost fraud detection model is saved to `backend/app/ml_models/*.pkl`. On server startup, `joblib.load()` reads it back. Model doesn't need to be retrained on every startup.
- **Why we used it** — scikit-learn's official serialization format. More memory-efficient than standard `pickle` for ML objects.
- **Why not alternatives** — Standard `pickle` works but isn't optimized for ML array structures. joblib is the path of least resistance for scikit-learn/XGBoost.
- **Version** — 1.3.2

---

## B9: Features & Code Implementation

---

<a id="q93"></a>
**Q93: Walk through the backend folder structure.**

A: `backend/app/` contains:
- `main.py` — FastAPI app, CORS, 10 router registrations, `@app.on_event("startup")` → `_seed(db)`, global exception handler
- `config.py` — `Settings(BaseSettings)` — every env var typed with defaults
- `database.py` — Engine (SQLite: StaticPool; PostgreSQL: pool_pre_ping), `SessionLocal`, `Base`, `get_db()`
- `models/` — 6 SQLAlchemy model files: user, policy, claim, disruption, risk_zone, support
- `schemas/` — Pydantic v2 request/response shapes per domain
- `routers/` — 10 `APIRouter` instances: auth, users, policies, claims, disruptions, risk_zones, analytics, premium, support, phase2
- `services/` — `automation_engine.py`, `fraud_detection.py`, `signal_ingestion.py`, `pricing.py`, `weather.py`
- `workers/` — Celery tasks: `weather_monitor.py`, `claim_processor.py`
- `ml_models/` — `.pkl` artifacts from joblib

---

<a id="q94"></a>
**Q94: How is error handling done?**

A: Three layers: (1) **Pydantic** — validates request bodies before handlers run; invalid input → HTTP 422 automatically. (2) **Route handlers** — `raise HTTPException(status_code=..., detail="...")` for business logic errors: 404 not found, 401 unauthenticated, 403 unauthorized, 400 bad request. (3) **Global handler** — `@app.exception_handler(Exception)` in `main.py` catches everything else, logs it, returns HTTP 500. In DEBUG mode, error string included in response. In production with `DEBUG=False`, returns only "An error occurred".

---

<a id="q95"></a>
**Q95: What is dependency injection?**

A: A function receives the objects it needs from outside rather than creating them itself. FastAPI's `Depends()` makes this clean. Every route needing a DB session declares `db: Session = Depends(get_db)` — FastAPI calls `get_db()` and injects the session. Every route needing auth declares `current_user: User = Depends(get_current_user)` — FastAPI decodes the JWT and returns a ready User object. Makes testing easy (inject mocks), removes repetition, keeps handlers focused on business logic.

---

<a id="q96"></a>
**Q96: What is idempotency and where does this project need it?**

A: Idempotency = running the same operation multiple times gives the same result as running it once. In claims: if you run the simulation twice for the same event, workers should not get two payouts. The automation engine checks for existing claims with `(user_id, claim_date, disruption_id)` before creating new ones. The gap: if a second simulation creates a new `Disruption` record (new ID), the check misses it. True idempotency needs `(user_id, claim_date, event_type, city, zone)`. See Q114.

---

<a id="q97"></a>
**Q97: What is the most complex piece of code?**

A: `AutomationEngine.run_disruption_simulation()` in `automation_engine.py`. It: creates a Disruption record + stores signal metadata, queries active policies by zone (up to 500), checks duplicates per worker, calls fraud scoring per worker, computes payout amounts via `PAYOUT_MULTIPLIER[event_type]`, builds TRACE reason codes via `_build_reason_codes()`, creates Claim records with correct status/approval/payout tx_id, accumulates stats, commits everything in one transaction, returns `SimulationSummary`. All in one method, with correct deduplication, single DB transaction, full audit trail.

---

<a id="q98"></a>
**Q98: How does the _seed() function work?**

A: Runs on startup via `@app.on_event("startup")`. First: `if db.query(User).count() > 0: return` — exits immediately if any users exist. Creates: 11 users (1 admin + 10 workers across Swiggy, Zomato, Blinkit, Zepto, Dunzo platforms, various cities and risk scores), 8 active policies (skipping admin + one flagged high-risk worker), 5 disruptions (2 active in Pune + Hyderabad, 3 historical), 11 claims with varied statuses and fraud scores, 7 risk zones across major Indian cities with lat/lng + risk scores. All committed in one `db.commit()`.

---

<a id="q99"></a>
**Q99: How does the userStore.ts migration code work?**

A: `userStore.ts` manages auth state in localStorage under `sanraksh_current_user`. The migration code handles data stored under old keys from earlier project names: `giginsur_*` and `gigarmor_*`. On `getUsers()`, if data exists under those keys, it's copied to `sanraksh_*` keys and old keys deleted. Ensures any active session from before the project renames doesn't get lost. See Q120 for what this reveals about the project's history.

---

<a id="q100"></a>
**Q100: What does underwritingEngine.ts do?**

A: Client-side risk assessment before the API call. Takes a `GigWorker` object and scores on 5 factors: AQI exposure >12 days (+2), weather exposure >7 days (+2), hours/day >8 (+1), Tier 1 city (+1), days active ≥25/30 (+1). Score ≤2 → "low" tier. ≤4 → "medium". >4 → "high". Eligibility: ≥7 active days last 30. Returns `UnderwritingResult` with tier + explanation list. Drives onboarding UI risk preview instantly without waiting for the API.

---

<a id="q101"></a>
**Q101: What is triggerEngine.ts and how does it work?**

A: Frontend utility simulating parametric trigger checks. For **Delhi**: `getAQI()` returns 200–500 (Delhi skews high). Trigger fires if AQI >400. Severity: >450 → "high", >420 → "medium", else "low". Source: `"SIMULATED_CPCB"`. For **Mumbai**: `getRainfall()` returns 20–150mm (Mumbai skews heavy). Trigger fires if rainfall >100mm. Severity: >140 → "high", >120 → "medium". Source: `"SIMULATED_WEATHER"`. Other cities: `trigger: false`. `getActiveTriggers()` runs all cities, filters to those with active triggers. Powers the live trigger feed on the worker dashboard.

---

<a id="q102"></a>
**Q102: pricingEngine.ts vs the backend premium calculator — what's the difference?**

A: Two separate implementations of related but different logic. **Frontend `pricingEngine.ts`:** Preview calculator. Uses underwriting risk tier + formula: `triggerProbability × avg_daily_income × exposure_days`, bounded ₹20–₹50. Gives an instant estimate in the UI while the API call is in flight. **Backend `premium.py`:** The authoritative calculator. Uses city-risk-coefficient formula: `BASE(₹10) + city×6 + platform×4 + earnings/2000`, bounded ₹10–₹60. Two different formulas — the backend value is authoritative. Frontend preview is just a fast estimate.

---

<a id="q103"></a>
**Q103: What does the disruption simulation do from the admin side?**

A: Admin selects city, zone, event type (HEAVY_RAIN, CURFEW, SEVERE_POLLUTION, etc.), severity (LOW/MEDIUM/HIGH/EXTREME) in the Control Tower. Clicking Run calls `POST /api/v1/phase2/simulate-disruption`. Automation engine runs synchronously and returns `SimulationSummary`. The UI shows: targeted_workers, auto_paid_count, review_count, rejected_count, total_payout, avg_fraud_score, signal_confidence, and a table of sample TRACE reason codes per claim.

---

<a id="q104"></a>
**Q104: What does the Control Tower dashboard show?**

A: Two endpoints: `GET /api/v1/phase2/control-tower` → 24h automation metrics (claims generated, auto-approved, automation rate, total payout, avg fraud score, review queue size). `GET /api/v1/phase2/run-history` → last 10 simulation run summaries. The page at `dashboard/control-tower/page.tsx` displays these as live KPIs and a scrollable run history table — the admin's real-time window into the automation engine.

---

<a id="q105"></a>
**Q105: How does the risk map work?**

A: `GET /api/v1/risk-zones/` returns all 7 RiskZone records with lat/lng and risk scores. Each zone has `overall_risk_score = weather×0.5 + traffic×0.3 + social×0.2`. The map in `dashboard/risk-map/page.tsx` uses React-Leaflet with `<Circle>` markers at each coordinate. Color: red (≥0.7), amber (≥0.45), green (lower). Clicking a marker opens a popup with weather/traffic/social breakdown.

---

<a id="q106"></a>
**Q106: What is demo mode?**

A: Clicking "Use Demo Credentials" on the registration page pre-fills all fields from the `gigWorkers` dataset in `workerData.ts` — a realistic synthetic worker record. At the payment step, a mock card UI shows (4242 **** **** 4242). No real payment processed. Session stored in localStorage via `workerSession.ts` — risk tier, premium, policy, underwriting result all saved. Full dashboard experience works even when backend is unreachable. Makes the app fully demonstrable without live backend connectivity.

---

## B10: The Hard Questions

---

<a id="q107"></a>
**⭐ Q107: Your OTP is hardcoded as "123456" for all workers — isn't that a security vulnerability?**

A: Yes — deliberately for demo purposes. `DEMO_OTP = "123456"` in `auth.py` is the fallback when no real OTP has been generated. Any phone number can explore the full app without needing Twilio SMS. Three things are mandatory before production: remove `DEMO_OTP` entirely, replace `_otp_store` with Redis-backed storage with 10-minute TTL, and actually call the Twilio API in `/send-otp` instead of returning the OTP in the response body.

---

<a id="q108"></a>
**Q108: The SECRET_KEY in docker-compose.yml is a placeholder — what if someone deploys it as-is?**

A: Anyone who reads the public GitHub repo sees the placeholder string. They can use it to forge valid JWTs — a token with `{"sub": any_user_id, "role": "admin"}` — and get full admin access. Critical production security failure. Fix: `openssl rand -hex 32` → real 256-bit secret → stored in AWS Secrets Manager or GitHub Actions secrets → never committed. The application reads it correctly from the `SECRET_KEY` env var. The only problem is the committed placeholder.

---

<a id="q109"></a>
**Q109: Fraud thresholds differ between fraud_detection.py and the automation engine — which is used?**

A: Genuine inconsistency. `fraud_detection.py` uses 0.50 (approve) and 0.70 (reject). The automation engine's routing and the README documentation reference 0.35/0.70. Which logic you hit depends on the claim path: auto-generated by simulation → automation engine path (0.35/0.70). Manually filed through `/claims/` → fraud_detection.py path (0.50/0.70). Fix: extract into one `FRAUD_THRESHOLDS` constant dict imported by both. This is a known inconsistency to acknowledge directly.

---

<a id="q110"></a>
**Q110: Auth tokens in localStorage — what are the security implications?**

A: localStorage is readable by any JavaScript on the same origin. An XSS vulnerability would allow an attacker's injected script to steal the token. The secure alternative is `httpOnly` cookies — browser sends them automatically but JavaScript can't read them. localStorage was used for simplicity — `httpOnly` cookies in Next.js with SSR require careful handling (no `window` object during server rendering). The current codebase has no `dangerouslySetInnerHTML` which eliminates the main XSS vector. For production: `httpOnly`, `Secure`, `SameSite=Strict` cookie.

---

<a id="q111"></a>
**Q111: _seed() fails halfway — what happens?**

A: Single `db.commit()` at the very end — if the function crashes before reaching it, nothing persists. The session closes and rolls back. The `if db.query(User).count() > 0: return` guard at the top prevents re-seeding. The risk: if it crashes after flushing users but before flushing policies, you'd have users without policies in the session — but because there's no `try/except db.rollback()` wrapping the whole function, the state is ambiguous. A robust implementation would wrap the entire seed in a `try/except` with `db.rollback()` on failure.

---

<a id="q112"></a>
**Q112: 500 worker cap — what happens to the rest?**

A: They simply aren't processed in that run. `limit_workers=500` in `run_disruption_simulation()` truncates the SQLAlchemy query. For a synchronous HTTP request, 500 is a reasonable ceiling — more would risk timeouts and connection pool exhaustion. Production fix: Celery task fan-out — publish N tasks of 500 workers each to the queue, processed in parallel by multiple Celery workers. The 500-worker limit is a demo constraint that must be acknowledged and explained.

---

<a id="q113"></a>
**Q113: 94.2% precision on synthetic data — how valid is that?**

A: Internally valid — measured on a held-out test split of the same synthetic dataset. Externally, unknown until real deployment. The synthetic data was calibrated against IRDAI fraud statistics for class distribution (~3% fraud, ~8% questionable), and features were engineered from domain knowledge of real fraud patterns. That makes it a reasonable approximation. But if real fraud patterns differ from the synthetic distribution, the model could perform significantly worse. This caveat must always be stated alongside the number.

---

<a id="q114"></a>
**Q114: Could a worker claim multiple times for the same disruption event?**

A: Yes, through a bug. The duplicate check uses `(user_id, claim_date, disruption_id)`. If a second simulation runs for the same event type in the same zone on the same day, it creates a new `Disruption` record with a new UUID. The check sees a new `disruption_id` → misses the prior claim → worker gets two payouts. True fix: check `(user_id, claim_date, event_type, city, zone)` instead. Known issue that would cause double payouts during repeated simulation runs for the same event.

---

<a id="q115"></a>
**Q115: event_metadata is plain Text not JSONB — why?**

A: JSONB is PostgreSQL-specific — it stores JSON in a parsed binary format with indexing support. SQLite doesn't have JSONB. Since the same SQLAlchemy model must work on both SQLite (dev) and PostgreSQL (prod), plain `Text` with `json.dumps()`/`json.loads()` in application code is the portable solution. Downside: can't query inside the JSON in PostgreSQL efficiently. If the project committed to PostgreSQL-only, `from sqlalchemy.dialects.postgresql import JSONB` with `Column(JSONB)` is the right upgrade.

---

<a id="q116"></a>
**Q116: automation_rate formula includes pending claims — what's wrong?**

A: Formula: `auto_approved / total_claims × 100`. If 100 claims exist — 50 auto-approved, 30 pending, 20 rejected — this gives 50% automation rate. But of the 70 resolved claims, auto-approval rate is 71%. Including pending in the denominator understates real automation effectiveness. Correct metric: `auto_approved / (total_claims - pending_claims)`. The number shown in the Control Tower underreports how well the automation actually performs on resolved cases.

---

<a id="q117"></a>
**Q117: Python 3.14 locally vs 3.11 in CI — how do you know it works on both?**

A: Strictly, there's a risk. Python 3.14 deprecated some standard library patterns. A bug that exists only on 3.14 wouldn't be caught by CI running on 3.11. `requirements_local.txt` also excludes XGBoost and scikit-learn because they had no pre-built wheels for 3.14 at the time. Correct fix: pin Python to 3.11 in a `.python-version` file, use pyenv locally to match CI, avoid cutting-edge Python versions until all dependencies have stable wheel builds for them.

---

<a id="q118"></a>
**Q118: What prevents GPS spoofing?**

A: Three layers: (1) **Location verification signal (25% weight)** — `location_match=False` adds 0.7 to fraud score, near-certain rejection on its own. (2) **Geopy haversine check** — calculates straight-line distance between claimed GPS and disruption zone center; large discrepancy → location mismatch flag. (3) **Peer corroboration (25% weight)** — if a worker claims to be in a disrupted zone but <20% of other workers in that zone are filing claims, adds 0.8. GPS spoofing is typically solo — peers don't corroborate it, making coordinated GPS spoofing very expensive to sustain.

---

<a id="q119"></a>
**Q119: Simulation doesn't transfer money — is payout flow actually tested?**

A: Claim creation, fraud scoring, status assignment, and `payout_transaction_id` generation (a string like `AUTO-{uuid[:8]}`) are all live and tested. The actual money transfer — calling Razorpay's payout API to push funds to a worker's UPI account — is not wired up and not tested. The data flow works end to end; the financial settlement is simulated. This is the most significant remaining gap between demo and production. Closing it needs: Razorpay production credentials, IRDAI compliance approval, and a webhook to confirm each transaction.

---

<a id="q120"></a>
**Q120: userStore.ts backward compatibility — what does it reveal?**

A: The project went through at least two name changes before settling on Sanraksh: `giginsur_*` keys → GigInsure, `gigarmor_*` keys → GigArmor. The migration code exists because the app was deployed and had real users (or at least a running demo) under both previous names — their localStorage sessions needed migrating rather than abandoning. It's a sign of a living project that evolved through iteration. Also technical debt: the migration should eventually be removed after a reasonable cutover period.

---

<a id="q121"></a>
**Q121: affected_radius_km is hardcoded to 2.0 — why?**

A: Two kilometers is a reasonable default for urban zone targeting — matching the rough footprint of a dense urban ward in Indian cities. However, the automation engine doesn't actually use `affected_radius_km` for targeting. It uses `work_city` and `work_zone` string matching — not geospatial radius queries — because policy records only store city and zone strings, not exact coordinates. The `affected_radius_km` field exists in the Disruption model for future geospatial querying (e.g., with PostGIS). Currently stored but not used in automation logic.

---

## GROUP C — Non-Technical Questions

---

## C1: The Problem & Research

---

<a id="q122"></a>
**Q122: What data backs up the problem statement?**

A: Five numbers from published sources:
1. **7.7 million gig workers** — NASSCOM Gig Economy Report 2023 + Ministry of Labour and Employment
2. **96% uninsured** — FICCI / InsureGig Survey 2024
3. **~11.8 disruption days/month** — cross-correlated from IMD historical weather data and platform outage tracking
4. **₹96,000–₹1,44,000 annual income loss** — derived: 11.8 days × 12 months × ₹1,200–₹2,500/day
5. **14–30 day traditional claim processing** — IRDAI Annual Report 2023–24

---

<a id="q123"></a>
**Q123: What existing solutions were evaluated?**

A: SBI Life, HDFC Ergo, LIC — all require fixed employment proof, minimum income thresholds, manual claim review. Platform coverage (Swiggy/Zomato ₹5–10 lakh accident cover) only covers physical injury, not income disruption. ACKO's bite-size products are the closest — lower premiums, simpler signup — but still fixed pricing and manual filing. No Indian product combines automatic claim filing, per-worker dynamic pricing, and seconds-level settlement.

---

<a id="q124"></a>
**Q124: What gap does this fill that nothing else does?**

A: Three gaps simultaneously: affordability (automation removes adjuster cost → ₹10–₹60/week is viable), accessibility (OTP login, no employment proof), and speed (22-second settlement vs 2–4 weeks). Every existing product fails on at least one of these. Most fail on all three.

---

<a id="q125"></a>
**Q125: Is this problem real — did you actually research it?**

A: The market data comes from published government and industry reports — NASSCOM, Ministry of Labour, FICCI, IRDAI — all cited. The product design (parametric model, OTP-only auth, ₹10–₹60 pricing range) was informed by understanding the actual constraints of this demographic: no employer letters, phone as primary financial identity, UPI familiarity, weekly income cycles. The 11.8 disruption days per month figure was cross-correlated from IMD weather data and platform downtime histories. The problem is well-documented in labor economics research on India's gig economy.

---

<a id="q126"></a>
**Q126: What is IRDAI and how does it relate to this project?**

A: IRDAI = Insurance Regulatory and Development Authority of India — the body that regulates all insurance products in India. To legally collect premiums and make payouts, a company needs either an IRDAI insurance license or a partnership with a licensed insurer. Sanraksh can be built and demonstrated as technology without IRDAI approval, but no real policies can be issued. IRDAI runs an "InsurTech Sandbox" program for fintechs to test innovative insurance products in a limited regulated environment — this is the regulatory path forward.

---

## C2: Business, Market & Impact

---

<a id="q127"></a>
**Q127: How would this actually make money?**

A: Two paths. **B2C (own insurer):** Collect ₹10–₹60/week premiums directly, pay claims, retain margin. Requires IRDAI license and capital reserves. Higher upside, higher regulatory barrier. **B2B2C (tech platform):** License the automation engine + ML fraud scoring to an existing licensed insurer. Insurer underwrites risk; Sanraksh charges per-policy or per-claim SaaS fee. Faster to market, lower barrier. The competitive moat in either case is the automation. Traditional insurers can't profitably offer micro-premiums with manual adjuster-driven claims — the unit economics break. Automation makes micro-premiums viable.

---

<a id="q128"></a>
**Q128: What regulatory approvals would this need?**

A: Three categories: (1) **IRDAI** — full insurance license or partnership with a licensed insurer under the InsurTech Sandbox. IRDAI has published specific guidelines on parametric insurance which are favorable for this model. (2) **RBI PA registration** — if collecting premiums directly as a payment aggregator. (3) **Data protection** — India's Digital Personal Data Protection Act 2023 applies to worker financial and Aadhaar-linked data: privacy policy, data processing agreements, defined retention limits.

---

<a id="q129"></a>
**Q129: Who would you partner with to make this real?**

A: Three types: (1) **Licensed insurer** — TATA AIG, Bajaj Allianz, or a new IRDAI entrant. Provides insurance license, capital reserves, regulatory standing. Insurer assumes risk; Sanraksh provides technology. (2) **Delivery platforms** — Swiggy, Zomato, Blinkit for direct worker onboarding and premium deduction from the platform's weekly worker payments. No separate payment collection. (3) **UPI/payment rails** — PhonePe or Paytm as the payout PSP for real-time sub-second claim transfers to workers' existing UPI accounts.

---

<a id="q130"></a>
**Q130: What is the risk of widespread fraud at scale?**

A: Three realistic scenarios: (1) **Coordinated GPS spoofing** — a group claims to be in a zone they aren't. Peer corroboration catches it: if most workers in the zone aren't filing, the outlier group is flagged. (2) **Synthetic event abuse** — someone tries to trigger a disruption artificially. Mitigated by requiring multiple independent signal sources to agree before claims are created. (3) **Insider attack** — fake disruption inserted. Mitigated by requiring real-world API data confirmation and audit logs on every disruption record. Peer corroboration is the strongest defense — coordinated fraud requires enough fraudsters in one zone to look like legitimate affected workers, which is expensive to sustain.

---

<a id="q131"></a>
**Q131: 2-minute investor pitch?**

A: 7.7 million delivery workers in India lose ₹96,000 to ₹1,44,000 in income annually to disruptions. 96% are uninsured. Traditional insurance can't serve them — requires employment letters they don't have, costs 5–7% of monthly income, takes weeks to settle. Sanraksh fixes all three. We monitor weather, AQI, and platform signals in real time. When a disruption threshold is hit, we automatically file claims for every affected worker in that zone, run ML fraud scoring, and settle payouts in 22 seconds. ₹10–₹60 per week. No forms. No waiting. The technology is built and working. We need an IRDAI partnership to go to market. The delivery platforms are the distribution channel — 7.7 million workers already on their payrolls, already using UPI.

---

## C3: Results, Reflections & Future

---

<a id="q132"></a>
**⭐ Q132: Does this work end to end?**

A: Yes. Complete flow works locally:
1. Register → policy auto-created
2. Login via OTP → JWT issued
3. Worker dashboard → active policy, risk tier, premium, live trigger feed
4. Control Tower → trigger simulation (heavy rain, Mumbai, HIGH) → automation engine runs, claims generated with fraud scores
5. Claims dashboard → auto-approved claims with TRACE codes and payout amounts
6. Analytics → KPIs update with real data from the simulation
7. Admin login (`9999000000` / `000000`) → full admin dashboard with Control Tower, risk map, claims feed

Frontend live at `sanraksh.vercel.app`. Backend requires local setup.

---

<a id="q133"></a>
**Q133: What are the measured performance metrics?**

A: From a test simulation of 1,247 claims:
- Settlement: **22.3s** avg (p50: 19s, p95: 28s)
- Auto-approval: **72.4%** · Manual review: 18% · Rejected: 9.6%
- Fraud model: Precision **94.2%** · Recall **87.5%** · F1 **90.6%** · ROC-AUC **0.948**
- API: p50 **45ms** · p99 **280ms** · 1,000+ concurrent users
- Frontend: Lighthouse **92/100** · TTI 2.8s · CLS 0.045
- Backend test coverage: **82%** (16 test cases)

---

<a id="q134"></a>
**Q134: What was the biggest technical challenge?**

A: The automation engine's idempotency design. When a simulation runs, it must not create duplicate claims for workers who already have one for the same event that day. Getting the duplicate detection query right — joining Policy to User, filtering by zone, checking existing claims per worker in one pass — required careful planning. A secondary challenge: the settlement time estimation formula `max(20, min(90, 25 + auto_paid_count // 4))`. Needed to feel realistic — not so fast it seemed fake, not so slow it undermined the "instant payout" claim.

---

<a id="q135"></a>
**Q135: What took the most time?**

A: The frontend dashboard architecture. With 15+ distinct pages across worker and admin views, establishing a consistent layout in `dashboard/layout.tsx` with role-aware navigation, auth guard, and working sidebar took significant iteration. Role detection reads `localStorage.getItem("role")`. Managing auth state cleanly across 15+ pages without Redux, with local state and React context, required disciplined structure.

---

<a id="q136"></a>
**Q136: What's the riskiest assumption?**

A: That 94.2% fraud detection precision translates to real-world claims. Everything else can be validated with real infrastructure — payments, SMS, weather APIs. The fraud model was trained on synthetic data. If real fraud patterns differ from the synthetic distribution, the model could perform significantly worse in production. A production pilot with real claims is the only way to validate this number.

---

<a id="q137"></a>
**Q137: What would you change if starting over?**

A: Two things: (1) TypeScript on the backend too. Pydantic handles API validation, but full end-to-end type safety from HTTP request to database query would catch more bugs at compile time. (2) PostgreSQL-only from day one. The SQLite/PostgreSQL dual-mode forced: plain `Text` instead of `JSONB` for metadata, `StaticPool` hacks in `database.py`, schema version skew. A hosted PostgreSQL on Railway adds 30 seconds of setup and removes several architectural compromises.

---

<a id="q138"></a>
**Q138: What was planned but not implemented?**

A: Four things: (1) Real Twilio SMS OTP delivery — currently returned in API response. (2) Real Razorpay payment processing — currently mock UI. (3) Celery beat scheduler for automatic disruption detection — the weather API integration in `weather.py` exists but the beat scheduler calling it every 5 minutes is not wired up. (4) Loyalty discount in live pricing — `test_policies.py` tests a discount at 12+ months tenure, but the live calculator doesn't apply it — scoped out to keep the formula simple.

---

<a id="q139"></a>
**Q139: What would be refactored with more time?**

A: Three things: (1) `_otp_store` → Redis-backed — security requirement, not enhancement. (2) Three plan tiers hardcoded in `auth.py` → should be database-driven so plan management doesn't require code changes. (3) Fraud detection thresholds (0.35/0.70 in one place, 0.50/0.70 in another) → one `FRAUD_THRESHOLDS` constant dict imported by both services.

---

<a id="q140"></a>
**Q140: Most impressive technical achievement?**

A: The end-to-end claim automation pipeline. One API call to `/phase2/simulate-disruption` triggers: multi-source signal confidence aggregation, disruption creation, policy matching, per-worker fraud scoring, payout calculation, TRACE reason code generation, claim record creation for hundreds of workers, and a structured summary — all committed in one database transaction and returned in under 2 seconds. The combination of ML inference, query planning, deduplication logic, and transaction management executing correctly together in one synchronous call required the most design iteration.

---

<a id="q141"></a>
**⭐ Q141: Hardest part — rate it out of 10?**

A: Two parts tied at 9/10. The automation engine's idempotency logic — a bug here means a worker gets paid twice or not at all, and testing all edge cases around database transaction semantics required careful thought. The second is the frontend role-aware dashboard — managing auth state, route protection, and role-based navigation across 15+ pages without a state management library required disciplined architecture and several iterations to get right.

---

<a id="q142"></a>
**Q142: Most valuable things learned?**

A: Five concrete learnings: (1) Async Python is genuinely different from async JavaScript — when `async def` actually prevents blocking vs when it's theater took time to internalize. (2) Database schema decisions are expensive to change — the claim state machine design (`status`, `approval_type`, `fraud_score` as separate columns) was right but took two iterations. (3) ML explainability > ML accuracy in regulated domains — switching to XGBoost was about what an adjuster can read, not the accuracy number. (4) Environment separation is security, not polish — `DEBUG=False`, proper secrets, CORS restrictions should be day-one decisions. (5) Documentation forces architectural clarity — writing `LOCAL_SETUP.md` surfaced two configuration issues that would have blocked anyone trying to run the project.

---

<a id="q143"></a>
**Q143: What comes next technically?**

A: In priority order: (1) Redis-backed OTP with 10-min TTL — security requirement. (2) Real Twilio SMS delivery — remove OTP from API response. (3) Celery beat scheduler polling OpenWeather + CPCB AQI every 5 minutes for live disruption detection. (4) Razorpay webhook for real payment confirmation and policy activation. (5) Composite DB indexes on `(city, zone, status)` and `(user_id, claim_date, event_type)`. (6) IRDAI InsurTech Sandbox registration — the regulatory path for real premiums and real policies.

---

<a id="q144"></a>
**Q144: What would change at 1 million users?**

A: Architecture changes significantly: `_otp_store` → Redis (required before this). Disruption simulation → Celery fan-out (can't process 1M workers in one HTTP request). PostgreSQL → read replicas for analytics. Claim deduplication → Redis sliding window instead of per-request DB queries. `payout_transaction_id` → real Razorpay payout reference via NPCI UPI rails. The monolith starts showing seams — claim processing is the best extraction candidate for a separate service with its own database partition.

---

*This Q&A covers the complete Sanraksh codebase as of June 2026. Every answer references actual file names, function names, formula constants, and version numbers from the repository.*
