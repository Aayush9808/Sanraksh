"""Automation orchestration router — disruption simulation, claim routing, and settlement."""

from datetime import datetime, timedelta
from typing import Any
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.claim import Claim, ClaimStatus, ApprovalType
from app.models.disruption import Disruption, EventType, Severity
from app.models.user import User
from app.services.automation_engine import automation_engine

router = APIRouter()


def _extract_trace_codes(notes: str | None) -> list[str]:
    if not notes or "TRACE:" not in notes:
        return []
    raw = notes.split("TRACE:", 1)[1]
    return [code for code in raw.replace(")", "").split("|") if code]


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _fallback_reasons_for_claim(claim: Claim) -> list[str]:
    reasons = []

    if claim.status == ClaimStatus.PENDING:
        reasons.append("ROUTE_MANUAL_REVIEW")
    elif claim.status == ClaimStatus.PAID:
        reasons.append("ROUTE_AUTO_PAY" if claim.approval_type == ApprovalType.AUTO else "ROUTE_MANUAL_PAY")
    elif claim.status == ClaimStatus.REJECTED:
        reasons.append("ROUTE_REJECT")

    fraud = _safe_float(claim.fraud_score)
    if fraud >= 0.75:
        reasons.append("FRAUD_SCORE_HIGH")
    elif fraud >= 0.40:
        reasons.append("FRAUD_SCORE_MEDIUM")
    else:
        reasons.append("FRAUD_SCORE_LOW")

    reasons.append("LOCATION_MATCH" if claim.location_verified else "LOCATION_MISMATCH")
    if _safe_float(claim.peer_validation_count) <= 1:
        reasons.append("WEAK_PEER_CORROBORATION")

    return reasons


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


@router.get("/review-queue")
async def review_queue(limit: int = 100, db: Session = Depends(get_db)):
    """Pending review queue with operator-friendly metadata."""
    now = datetime.utcnow()
    rows = (
        db.query(Claim, User)
        .join(User, User.id == Claim.user_id)
        .filter(Claim.status == ClaimStatus.PENDING)
        .order_by(Claim.created_at.asc())
        .limit(max(1, min(limit, 500)))
        .all()
    )

    claims = []
    for claim, user in rows:
        age_minutes = 0
        if claim.created_at:
            age_minutes = max(0, int((now - claim.created_at).total_seconds() // 60))

        reasons = _extract_trace_codes(claim.rejection_reason) or _fallback_reasons_for_claim(claim)

        claims.append(
            {
                "id": str(claim.id),
                "claim_number": claim.claim_number,
                "worker_name": user.name if user else "Worker",
                "zone": user.work_zone if user else "-",
                "amount": round(_safe_float(claim.claim_amount), 2),
                "status": claim.status.value if claim.status else "pending",
                "fraud_score": round(_safe_float(claim.fraud_score), 3),
                "created_at": claim.created_at.isoformat() if claim.created_at else None,
                "age_minutes": age_minutes,
                "decision_reasons": reasons,
            }
        )

    return {"claims": claims, "count": len(claims)}


@router.get("/queue-health")
async def queue_health(db: Session = Depends(get_db)):
    """Queue SLA health snapshot for control tower operations."""
    now = datetime.utcnow()
    pending = (
        db.query(Claim)
        .filter(Claim.status == ClaimStatus.PENDING)
        .order_by(Claim.created_at.asc())
        .all()
    )

    ages: list[int] = []
    for claim in pending:
        if not claim.created_at:
            continue
        ages.append(max(0, int((now - claim.created_at).total_seconds() // 60)))

    warning_count = len([age for age in ages if 15 <= age < 30])
    breach_count = len([age for age in ages if age >= 30])
    avg_age_minutes = round(sum(ages) / max(len(ages), 1), 1)

    # Operational planning heuristic based on 25 claims / 5 min sweep.
    projected_clear_minutes = 0 if not pending else max(5, ((len(pending) + 24) // 25) * 5)

    return {
        "queue_size": len(pending),
        "warning_count": warning_count,
        "breach_count": breach_count,
        "avg_age_minutes": avg_age_minutes,
        "breach_rate_pct": round((breach_count / max(len(pending), 1)) * 100, 1),
        "projected_clear_minutes": projected_clear_minutes,
    }


@router.get("/run-history")
async def run_history(limit: int = 10, db: Session = Depends(get_db)):
    """Recent disruption automation runs with aggregated outcomes."""
    disruptions = (
        db.query(Disruption)
        .order_by(Disruption.created_at.desc())
        .limit(max(1, min(limit, 50)))
        .all()
    )

    rows = []
    for disruption in disruptions:
        claims = db.query(Claim).filter(Claim.disruption_id == disruption.id).all()

        created_claims = len(claims)
        auto_paid_count = len(
            [
                claim
                for claim in claims
                if claim.status == ClaimStatus.PAID and claim.approval_type == ApprovalType.AUTO
            ]
        )
        review_count = len([claim for claim in claims if claim.status == ClaimStatus.PENDING])
        rejected_count = len([claim for claim in claims if claim.status == ClaimStatus.REJECTED])
        total_payout = sum(float(claim.claim_amount or 0) for claim in claims if claim.status == ClaimStatus.PAID)
        avg_fraud_score = _safe_float(
            sum(_safe_float(claim.fraud_score) for claim in claims) / max(created_claims, 1)
        )

        reason_freq: dict[str, int] = {}
        for claim in claims:
            for code in _extract_trace_codes(claim.rejection_reason):
                reason_freq[code] = reason_freq.get(code, 0) + 1

        metadata = disruption.event_metadata if isinstance(disruption.event_metadata, dict) else {}
        signal_profile = metadata.get("signal_profile", {}) if isinstance(metadata, dict) else {}
        signal_confidence = _safe_float(signal_profile.get("aggregate_confidence"), 0.0)

        rows.append(
            {
                "id": str(disruption.id),
                "city": disruption.city,
                "zone": disruption.zone,
                "event_type": disruption.event_type.value if disruption.event_type else None,
                "severity": disruption.severity.value if disruption.severity else None,
                "created_at": disruption.created_at.isoformat() if disruption.created_at else None,
                "created_claims": created_claims,
                "auto_paid_count": auto_paid_count,
                "review_count": review_count,
                "rejected_count": rejected_count,
                "total_payout": round(total_payout, 2),
                "avg_fraud_score": round(avg_fraud_score, 3),
                "signal_confidence": round(signal_confidence, 3),
                "top_reasons": [
                    {"reason": item[0], "count": item[1]}
                    for item in sorted(reason_freq.items(), key=lambda x: x[1], reverse=True)[:5]
                ],
            }
        )

    return {"runs": rows}


@router.get("/run-impact/{disruption_id}")
async def run_impact(disruption_id: str, db: Session = Depends(get_db)):
    """Detailed impact breakdown for a specific disruption run."""
    try:
        disruption_uuid = uuid.UUID(disruption_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid disruption id") from exc

    disruption = db.query(Disruption).filter(Disruption.id == disruption_uuid).first()
    if not disruption:
        raise HTTPException(status_code=404, detail="Disruption run not found")

    claims = db.query(Claim).filter(Claim.disruption_id == disruption.id).all()
    created_claims = len(claims)
    auto_paid_count = len(
        [
            claim
            for claim in claims
            if claim.status == ClaimStatus.PAID and claim.approval_type == ApprovalType.AUTO
        ]
    )
    review_count = len([claim for claim in claims if claim.status == ClaimStatus.PENDING])
    rejected_count = len([claim for claim in claims if claim.status == ClaimStatus.REJECTED])
    total_payout = sum(float(claim.claim_amount or 0) for claim in claims if claim.status == ClaimStatus.PAID)

    reason_freq: dict[str, int] = {}
    for claim in claims:
        for code in _extract_trace_codes(claim.rejection_reason):
            reason_freq[code] = reason_freq.get(code, 0) + 1

    return {
        "run": {
            "id": str(disruption.id),
            "city": disruption.city,
            "zone": disruption.zone,
            "event_type": disruption.event_type.value if disruption.event_type else None,
            "severity": disruption.severity.value if disruption.severity else None,
            "created_at": disruption.created_at.isoformat() if disruption.created_at else None,
        },
        "summary": {
            "created_claims": created_claims,
            "auto_paid_count": auto_paid_count,
            "review_count": review_count,
            "rejected_count": rejected_count,
            "total_payout": round(total_payout, 2),
        },
        "timeline": [
            {"stage": "disruption_triggered", "count": 1},
            {"stage": "claims_generated", "count": created_claims},
            {"stage": "auto_paid", "count": auto_paid_count},
            {"stage": "manual_review", "count": review_count},
            {"stage": "rejected", "count": rejected_count},
        ],
        "reason_breakdown": [
            {"reason": item[0], "count": item[1]}
            for item in sorted(reason_freq.items(), key=lambda x: x[1], reverse=True)[:10]
        ],
    }
