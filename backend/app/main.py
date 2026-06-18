"""
Sanraksh - Main FastAPI Application
AI-Powered Parametric Insurance for Gig Workers
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging, uuid
from datetime import date, datetime, timedelta

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import auth, users, policies, claims, disruptions, risk_zones, analytics, phase2
from app.routers import premium as premium_router
from app.routers import support as support_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Sanraksh API",
    description="AI-Powered Parametric Insurance for Gig Economy Workers",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(users.router, prefix="/api/v1/workers", tags=["Workers"])  # alias
app.include_router(policies.router, prefix="/api/v1/policies", tags=["Policies"])
app.include_router(claims.router, prefix="/api/v1/claims", tags=["Claims"])
app.include_router(disruptions.router, prefix="/api/v1/disruptions", tags=["Disruptions"])
app.include_router(risk_zones.router, prefix="/api/v1/risk-zones", tags=["Risk Zones"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(phase2.router, prefix="/api/v1/phase2", tags=["Automation Engine"])
app.include_router(premium_router.router, prefix="/api/v1/premium", tags=["Premium Calculator"])
app.include_router(support_router.router, prefix="/api/v1/support", tags=["Support"])

# ─── SEED DATA ──────────────────────────────────────────────────────────────

def _seed(db):
    """Seed demo data if database is empty."""
    from app.models.user import User, KYCStatus, DeliveryPlatform
    from app.models.policy import Policy, PolicyStatus
    from app.models.claim import Claim, ClaimStatus, ApprovalType
    from app.models.disruption import Disruption, DisruptionType, EventType, Severity
    from app.models.risk_zone import RiskZone
    import json

    if db.query(User).count() > 0:
        return  # Already seeded

    logger.info("🌱 Seeding demo data...")

    workers_data = [
        {"phone": "9999000000", "name": "Admin User",       "platform": DeliveryPlatform.SWIGGY,  "city": "Mumbai",    "zone": "Andheri West",    "risk": 0.1,  "kyc": KYCStatus.VERIFIED},
        {"phone": "9999000001", "name": "Rahul Kumar",      "platform": DeliveryPlatform.SWIGGY,  "city": "Mumbai",    "zone": "Andheri West",    "risk": 0.12, "kyc": KYCStatus.VERIFIED},
        {"phone": "9999000002", "name": "Priya Mistry",     "platform": DeliveryPlatform.ZOMATO,  "city": "Bengaluru", "zone": "Koramangala",     "risk": 0.34, "kyc": KYCStatus.VERIFIED},
        {"phone": "9999000003", "name": "Arjun Sharma",     "platform": DeliveryPlatform.OTHER,   "city": "Delhi",     "zone": "Connaught Place", "risk": 0.06, "kyc": KYCStatus.VERIFIED},
        {"phone": "9999000004", "name": "Meena Rajan",      "platform": DeliveryPlatform.DUNZO,   "city": "Chennai",   "zone": "Anna Nagar",      "risk": 0.11, "kyc": KYCStatus.VERIFIED},
        {"phone": "9999000005", "name": "Vikram Patil",     "platform": DeliveryPlatform.SWIGGY,  "city": "Hyderabad", "zone": "Banjara Hills",   "risk": 0.82, "kyc": KYCStatus.SUBMITTED},
        {"phone": "9999000006", "name": "Divya Nair",       "platform": DeliveryPlatform.ZOMATO,  "city": "Pune",      "zone": "Kothrud",         "risk": 0.09, "kyc": KYCStatus.VERIFIED},
        {"phone": "9999000007", "name": "Kiran Rao",        "platform": DeliveryPlatform.OTHER,   "city": "Delhi",     "zone": "Lajpat Nagar",    "risk": 0.45, "kyc": KYCStatus.PENDING},
        {"phone": "9999000008", "name": "Anita Desai",      "platform": DeliveryPlatform.SWIGGY,  "city": "Mumbai",    "zone": "Bandra West",     "risk": 0.07, "kyc": KYCStatus.VERIFIED},
        {"phone": "9999000009", "name": "Suresh Menon",     "platform": DeliveryPlatform.BLINKIT, "city": "Bengaluru", "zone": "Whitefield",      "risk": 0.23, "kyc": KYCStatus.VERIFIED},
        {"phone": "9999000010", "name": "Fatima Sheikh",    "platform": DeliveryPlatform.ZEPTO,   "city": "Mumbai",    "zone": "Dharavi",         "risk": 0.18, "kyc": KYCStatus.VERIFIED},
    ]

    users = []
    for w in workers_data:
        u = User(
            id=str(uuid.uuid4()), phone=w["phone"], name=w["name"],
            email=f"{w['name'].lower().replace(' ', '.')}@demo.sanraksh.in",
            delivery_platform=w["platform"], work_city=w["city"], work_zone=w["zone"],
            kyc_status=w["kyc"], risk_score=w["risk"], is_active=True,
        )
        db.add(u)
        users.append(u)
    db.flush()

    # Policies for all except admin (index 0) and the flagged user (index 5)
    policies_created = []
    plan_types = ["income_loss_only", "income_loss_only", "income_loss_only", "heavy_rain",
                  "income_loss_only", "income_loss_only", "income_loss_only", "income_loss_only", "income_loss_only"]
    premiums = [49.0, 55.0, 42.0, 48.0, 59.0, 44.0, 52.0, 46.0, 50.0]
    for i, u in enumerate(users[1:10], 0):
        if i == 4:  # Vikram (flagged) - no active policy
            continue
        p = Policy(
            id=str(uuid.uuid4()), user_id=u.id,
            policy_number=f"GS-202603-{str(uuid.uuid4())[:6].upper()}",
            start_date=date.today() - timedelta(days=30 + i * 7),
            end_date=date.today() + timedelta(days=335 - i * 7),
            status=PolicyStatus.ACTIVE, weekly_premium=premiums[i],
            coverage_amount=800.0, coverage_type=plan_types[i],
        )
        db.add(p)
        policies_created.append((u, p))
    db.flush()

    # Disruptions
    disruption_data = [
        {"etype": EventType.HEAVY_RAIN,       "sev": Severity.HIGH,    "city": "Mumbai",    "zone": "Andheri West",   "active": False},
        {"etype": EventType.SEVERE_POLLUTION, "sev": Severity.HIGH,    "city": "Delhi",     "zone": "Connaught Place","active": False},
        {"etype": EventType.CURFEW,           "sev": Severity.EXTREME, "city": "Chennai",   "zone": "Anna Nagar",     "active": False},
        {"etype": EventType.HEAVY_RAIN,       "sev": Severity.MEDIUM,  "city": "Pune",      "zone": "Kothrud",        "active": True},
        {"etype": EventType.EXTREME_HEAT,     "sev": Severity.MEDIUM,  "city": "Hyderabad", "zone": "Banjara Hills",  "active": True},
    ]
    disruptions = []
    for i, d in enumerate(disruption_data):
        disc = Disruption(
            id=str(uuid.uuid4()),
            disruption_type=DisruptionType.WEATHER if d["etype"] in {EventType.HEAVY_RAIN, EventType.FLOOD, EventType.EXTREME_HEAT, EventType.SEVERE_POLLUTION} else DisruptionType.SOCIAL,
            event_type=d["etype"], severity=d["sev"],
            city=d["city"], zone=d["zone"],
            affected_radius_km=2.0,
            start_time=datetime.utcnow() - timedelta(days=i * 3, hours=2),
            end_time=None if d["active"] else datetime.utcnow() - timedelta(days=i * 3),
            is_active=d["active"], source="imd_api",
            event_metadata=json.dumps({"phase": "seed"}),
        )
        db.add(disc)
        disruptions.append(disc)
    db.flush()

    # Historical claims
    claim_scenarios = [
        (0, 0, ClaimStatus.PAID,    ApprovalType.AUTO,   0.08, True,  "Heavy Rain payout"),
        (1, 1, ClaimStatus.PAID,    ApprovalType.AUTO,   0.12, True,  "AQI Alert payout"),
        (2, 2, ClaimStatus.PAID,    ApprovalType.AUTO,   0.06, True,  "Curfew payout"),
        (0, 0, ClaimStatus.PAID,    ApprovalType.AUTO,   0.09, True,  "Heavy Rain payout"),
        (1, 1, ClaimStatus.PENDING, ApprovalType.MANUAL, 0.34, False, "Location mismatch - manual review"),
        (2, 2, ClaimStatus.PAID,    ApprovalType.AUTO,   0.07, True,  "Curfew payout 2"),
        (3, 3, ClaimStatus.REJECTED,ApprovalType.MANUAL, 0.81, False, "High fraud score"),
        (4, 4, ClaimStatus.PAID,    ApprovalType.AUTO,   0.11, True,  "App outage payout"),
        (5, 0, ClaimStatus.PAID,    ApprovalType.AUTO,   0.05, True,  "Rain payout"),
        (6, 1, ClaimStatus.PENDING, ApprovalType.MANUAL, 0.45, True,  "Excessive frequency"),
        (7, 2, ClaimStatus.PAID,    ApprovalType.AUTO,   0.08, True,  "Curfew payout 3"),
    ]
    for idx, (pol_i, disc_i, cstatus, atype, fraud, loc, reason) in enumerate(claim_scenarios):
        if pol_i >= len(policies_created):
            continue
        u, p = policies_created[pol_i]
        disc = disruptions[disc_i]
        days_ago = (len(claim_scenarios) - idx) * 2 + 1
        payout_txn = f"PAY-{str(uuid.uuid4())[:8].upper()}" if cstatus == ClaimStatus.PAID else None
        c = Claim(
            id=str(uuid.uuid4()),
            claim_number=f"CLM-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}",
            user_id=u.id, policy_id=p.id, disruption_id=disc.id,
            claim_date=date.today() - timedelta(days=days_ago),
            claim_amount=800.0, status=cstatus, approval_type=atype,
            fraud_score=fraud, location_verified=loc,
            rejection_reason=reason if cstatus == ClaimStatus.REJECTED else None,
            payout_date=datetime.utcnow() - timedelta(days=days_ago) if cstatus == ClaimStatus.PAID else None,
            payout_transaction_id=payout_txn,
            peer_validation_count=12 if loc else 2,
        )
        db.add(c)

    # Risk zones
    zone_data = [
        ("Mumbai",    "Andheri West",    19.119, 72.836, 0.75, 0.55, 0.30),
        ("Mumbai",    "Bandra West",     19.060, 72.831, 0.65, 0.60, 0.25),
        ("Delhi",     "Connaught Place", 28.632, 77.220, 0.55, 0.70, 0.45),
        ("Bengaluru", "Koramangala",     12.934, 77.627, 0.45, 0.65, 0.30),
        ("Chennai",   "Anna Nagar",      13.086, 80.211, 0.60, 0.50, 0.35),
        ("Pune",      "Kothrud",         18.504, 73.812, 0.50, 0.45, 0.20),
        ("Hyderabad", "Banjara Hills",   17.410, 78.448, 0.40, 0.55, 0.25),
    ]
    for city, zone, lat, lng, wrisk, trisk, srisk in zone_data:
        rz = RiskZone(
            id=str(uuid.uuid4()), city=city, zone=zone, lat=lat, lng=lng,
            weather_risk_score=wrisk, traffic_risk_score=trisk, social_risk_score=srisk,
            overall_risk_score=round((wrisk * 0.5 + trisk * 0.3 + srisk * 0.2), 2),
            population_density=12000.0, avg_disruptions_per_month=3.5,
        )
        db.add(rz)

    db.commit()
    logger.info("✅ Demo data seeded: 11 users, 8 policies, 11 claims, 5 disruptions, 7 risk zones")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Sanraksh API - Protecting India's Gig Workers",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": "connected",
        "redis": "connected",
    }


@app.on_event("startup")
async def startup_event():
    """Startup event handler"""
    logger.info("🚀 Sanraksh API starting up...")
    db = SessionLocal()
    try:
        _seed(db)
    finally:
        db.close()
    logger.info("✅ Application ready to serve requests")


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler"""
    logger.info("👋 Sanraksh API shutting down...")


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc) if settings.DEBUG else "An error occurred",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
