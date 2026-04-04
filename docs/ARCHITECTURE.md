# Sanraksh Architecture

## System Overview

Sanraksh is a parametric insurance platform designed specifically for India's gig economy delivery partners. The system uses AI/ML for dynamic pricing, fraud detection, and hyper-local risk assessment.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Next.js UI  │  │ WhatsApp Bot │  │  Admin Panel │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
└─────────┼─────────────────┼──────────────────┼───────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│                      FastAPI (Python)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Authentication │ Rate Limiting │ Request Validation │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Users    │  │  Policies  │  │   Claims   │            │
│  │  Service   │  │  Service   │  │  Service   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                      ML/AI Engine Layer                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Pricing   │  │   Fraud    │  │    Risk    │            │
│  │   Model    │  │ Detection  │  │ Assessment │            │
│  │ (XGBoost)  │  │ (Isolation │  │ (Weighted  │            │
│  │            │  │   Forest)  │  │  Scoring)  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ PostgreSQL │  │   Redis    │  │  PostGIS   │            │
│  │  (Primary  │  │  (Cache +  │  │   (Geo     │            │
│  │    Data)   │  │   Queue)   │  │  Queries)  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Background Workers Layer                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Weather   │  │   Claim    │  │   Risk     │            │
│  │  Monitor   │  │ Processor  │  │   Zone     │            │
│  │ (5 min)    │  │ (1 min)    │  │  Update    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   External APIs Layer                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │OpenWeather │  │   Twilio   │  │ Razorpay   │            │
│  │    API     │  │  WhatsApp  │  │  Payments  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. API Gateway (FastAPI)
- **Purpose:** Single entry point for all requests
- **Responsibilities:**
  - JWT authentication
  - Rate limiting (100 req/min authenticated, 20 req/min public)
  - Request validation (Pydantic schemas)
  - CORS handling
  - Auto-generated Swagger docs

### 2. Business Services

#### User Service
- Registration with OTP verification
- KYC management
- Profile updates
- Risk score calculation

#### Policy Service
- Premium calculation (transparent breakdown)
- Policy creation (weekly coverage)
- Policy renewal
- Status management

#### Claims Service
- Claim creation
- Peer validation
- Fraud detection pipeline
- Auto-approval logic
- Payout processing (Razorpay)

### 3. ML/AI Models

#### Pricing Model (XGBoost)
- **Inputs:** Risk score, season, city, zone, historical claims, tenure
- **Output:** Weekly premium (₹35-80 range)
- **Update Frequency:** Weekly retraining
- **Accuracy Target:** MAE < ₹3

#### Fraud Detection (Isolation Forest)
- **Inputs:** Claim frequency, amount, location, peer data, timing
- **Output:** Fraud score (0-1)
- **Thresholds:** 
  - ≥0.7 = Auto-reject
  - 0.5-0.7 = Manual review
  - <0.5 = Proceed to approval

#### Risk Assessment
- **Zone Risk:** Weather (40%) + Traffic (25%) + Historical (25%) + Social (10%)
- **User Risk:** Delivery platform + Zone + Historical claims
- **Output:** Risk levels (low/medium/high/extreme) with color codes

### 4. Data Models

#### Users
```python
- id (UUID)
- phone (unique, indexed)
- name, email
- delivery_platform (enum)
- work_city, work_zone
- work_location (lat, lng)
- kyc_status (pending/approved/rejected)
- risk_score (0-1)
- created_at, updated_at
```

#### Policies
```python
- id (UUID)
- policy_number (unique)
- user_id (FK)
- start_date, end_date
- status (active/expired/cancelled)
- weekly_premium
- coverage_amount (₹600-1000)
- coverage_type (income_loss_only)
```

#### Claims
```python
- id (UUID)
- claim_number (unique)
- user_id, policy_id, disruption_id (FKs)
- claim_date, claim_amount
- status (pending/approved/rejected)
- approval_type (auto/manual/peer_validated)
- payout_date, payout_transaction_id
- fraud_score, peer_validation_count
- location_verified
```

#### Disruptions
```python
- id (UUID)
- disruption_type (weather/traffic/social)
- event_type (heavy_rain/flood/strike/etc)
- severity (low/medium/high/extreme)
- city, zone
- location (lat, lng)
- affected_radius_km
- start_time, end_time
- is_active
```

#### Risk Zones
```python
- id (UUID)
- zone_id (2km x 2km grid)
- city, zone_name
- center (lat, lng)
- weather_risk_score
- traffic_risk_score
- historical_risk_score
- social_risk_score
- overall_risk_score
- active_workers_count
```

### 5. Background Workers

#### Weather Monitor
- **Frequency:** Every 5 minutes
- **Tasks:**
  - Fetch weather for all zones (OpenWeatherMap API)
  - Detect severe conditions (>7.6mm/hr rain, >40°C temp)
  - Create disruption records
  - Trigger claim processing for affected zones
  - Send WhatsApp alerts to users

#### Claim Processor
- **Frequency:** Every 60 seconds
- **Pipeline:**
  1. Fetch pending claims
  2. Run peer validation (check 1km radius)
  3. Run fraud detection (calculate score)
  4. Make decision (approve/reject/review)
  5. Process payout (Razorpay API)
  6. Send notification (WhatsApp/Email)
  7. Update claim status

### 6. External Integrations

#### OpenWeatherMap
- **Endpoints:** Current weather, 5-day forecast
- **Rate Limit:** 1000 calls/day (free tier)
- **Data:** Temperature, rainfall, conditions, wind

#### Twilio WhatsApp Business API
- **Purpose:** Conversational insurance interface
- **Features:** Registration, claims, status checks
- **Webhook:** Flask handler with state management

#### Razorpay (Test Mode)
- **Purpose:** Instant payouts to users
- **Flow:** Claim approved → Create payout → Transfer to bank
- **Target:** <60 seconds from approval

## Data Flow Examples

### User Registration Flow
1. User sends message to WhatsApp bot
2. Bot collects: name, platform, city, zone
3. Backend creates user record
4. Pricing service calculates premium
5. Bot displays transparent breakdown
6. User confirms → Policy created

### Claim Processing Flow
1. User files claim (WhatsApp or Web)
2. Claim enters pending queue
3. Worker fetches claim every 60s
4. Peer validation checks zone (1km radius)
5. Fraud detection calculates score
6. If score < 0.3 && peers > 5 → Auto-approve
7. Razorpay payout initiated
8. WhatsApp notification sent
9. Status updated to approved

### Risk Assessment Flow
1. Weather monitor detects heavy rain
2. Disruption created for zone
3. Risk assessment recalculates zone risk
4. If risk > 0.75 → Alert sent to all users in zone
5. Dynamic pricing adjusts for next week
6. Risk heatmap updated in dashboard

## Technology Choices

### Why FastAPI?
- Async support for high concurrency
- Auto-generated API docs (Swagger)
- Type hints for better code quality
- Easy ML model integration

### Why PostgreSQL + PostGIS?
- Strong ACID guarantees for financial data
- PostGIS for efficient geo-queries
- JSON support for flexible schemas
- Proven reliability at scale

### Why Redis?
- Fast caching (weather data, user sessions)
- Pub/sub for real-time updates
- Job queue for background workers
- OTP storage with TTL

### Why Next.js?
- Server-side rendering for SEO
- React for rich UI components
- TypeScript for type safety
- Built-in API routes

## Security Considerations

1. **Authentication:** JWT tokens (15-min expiry), OTP verification (6 digits, 10-min expiry)
2. **Authorization:** Role-based access (user, admin)
3. **Data Encryption:** HTTPS only, database encryption at rest
4. **API Security:** Rate limiting, input validation, SQL injection prevention
5. **PII Protection:** Phone numbers hashed, minimal data collection
6. **Payment Security:** Razorpay PCI-compliant, no card storage

## Scalability Strategy

1. **Horizontal Scaling:** Multiple FastAPI instances behind load balancer
2. **Database:** Read replicas for queries, write to primary
3. **Caching:** Redis for frequently accessed data (zones, weather)
4. **CDN:** Static assets served from CDN
5. **Background Jobs:** Distributed workers using Celery (future)
6. **Monitoring:** Prometheus metrics, Grafana dashboards

## Deployment Architecture

### Development
- Docker Compose (4 services: postgres, redis, backend, frontend)
- Local volumes for data persistence

### Production (Railway.app)
- Backend: Python service with Gunicorn + Uvicorn workers
- Frontend: Next.js service with Node.js
- Database: Managed PostgreSQL with automatic backups
- Redis: Managed Redis instance
- Workers: Separate service for background tasks

## Monitoring & Observability

1. **Logs:** Structured JSON logs, centralized in CloudWatch
2. **Metrics:** Request latency, error rates, queue depths
3. **Alerts:** Slack notifications for critical errors
4. **Health Checks:** `/health` endpoint, database connectivity check
5. **Performance:** APM for slow query detection

---

**Last Updated:** March 8, 2026
**Version:** 1.0
