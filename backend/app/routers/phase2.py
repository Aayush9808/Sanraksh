"""Phase 2 orchestration router."""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.claim import Claim, ClaimStatus, ApprovalType
from app.models.disruption import Disruption, EventType, Severity
from app.services.automation_engine import automation_engine

router = APIRouter()


class DisruptionSimulationRequest(BaseModel):
    city: str = Field(..., min_length=2, max_length=50)
    zone: str = Field(..., min_length=2, max_length=100)
    event_type: EventType = EventType.HEAVY_RAIN
    severity: Severity = Severity.HIGH
    strict_mode: bool = True
    affected_radius_km: float = Field(default=2.0, ge=0.5, le=10.0)
    limit_workers: int = Field(default=500, ge=1, le=2000)


@router.post("/simulate-disruption")
async def simulate_disruption(data: DisruptionSimulationRequest, db: Session = Depends(get_db)):
    """End-to-end disruption automation: create event -> generate claims -> route payouts/review."""
    result = await automation_engine.run_disruption_simulation(
        db=db,
        city=data.city,
        zone=data.zone,
        event_type=data.event_type,
        severity=data.severity,
        strict_mode=data.strict_mode,
        affected_radius_km=data.affected_radius_km,
        limit_workers=data.limit_workers,
    )
    return {"message": "Phase 2 automation run completed", **result}


@router.get("/control-tower")
async def control_tower(db: Session = Depends(get_db)):
    """Portfolio-level phase2 metrics useful for demo and operations."""
    since = datetime.utcnow() - timedelta(hours=24)

    disruptions_24h = db.query(func.count(Disruption.id)).filter(Disruption.created_at >= since).scalar() or 0
    active_disruptions = db.query(func.count(Disruption.id)).filter(Disruption.is_active == True).scalar() or 0

    claims_24h = db.query(func.count(Claim.id)).filter(Claim.created_at >= since).scalar() or 0
    paid_24h = db.query(func.count(Claim.id)).filter(Claim.created_at >= since, Claim.status == ClaimStatus.PAID).scalar() or 0
    review_24h = db.query(func.count(Claim.id)).filter(Claim.created_at >= since, Claim.status == ClaimStatus.PENDING).scalar() or 0
    rejected_24h = db.query(func.count(Claim.id)).filter(Claim.created_at >= since, Claim.status == ClaimStatus.REJECTED).scalar() or 0
    auto_24h = db.query(func.count(Claim.id)).filter(Claim.created_at >= since, Claim.approval_type == ApprovalType.AUTO).scalar() or 0

    payout_24h = (
        db.query(func.sum(Claim.claim_amount))
        .filter(Claim.created_at >= since, Claim.status == ClaimStatus.PAID)
        .scalar()
        or 0
    )

    avg_fraud = (
        db.query(func.avg(Claim.fraud_score)).filter(Claim.created_at >= since).scalar() or 0
    )

    return {
        "window": "24h",
        "active_disruptions": int(active_disruptions),
        "disruptions_24h": int(disruptions_24h),
        "claims_24h": int(claims_24h),
        "paid_24h": int(paid_24h),
        "review_24h": int(review_24h),
        "rejected_24h": int(rejected_24h),
        "auto_approval_rate": round((auto_24h / max(claims_24h, 1)) * 100, 1),
        "avg_fraud_score": round(float(avg_fraud), 3),
        "total_paid_24h": round(float(payout_24h), 2),
    }


@router.post("/review-queue/approve")
async def approve_review_queue(limit: int = 25, db: Session = Depends(get_db)):
    """Bulk-approve pending review queue for faster settlement simulations."""
    pending = (
        db.query(Claim)
        .filter(Claim.status == ClaimStatus.PENDING)
        .order_by(Claim.fraud_score.asc(), Claim.created_at.asc())
        .limit(limit)
        .all()
    )

    now = datetime.utcnow()
    approved = []
    total_paid = 0.0
    for claim in pending:
        claim.status = ClaimStatus.PAID
        claim.approval_type = ApprovalType.MANUAL
        claim.payout_date = now
        claim.payout_transaction_id = claim.payout_transaction_id or f"REV-{str(claim.id).split('-')[0].upper()}"
        total_paid += float(claim.claim_amount)
        approved.append(claim.claim_number)

    db.commit()

    return {
        "approved_count": len(approved),
        "approved_claim_numbers": approved,
        "total_paid": round(total_paid, 2),
        "message": "Review queue approval completed",
    }
