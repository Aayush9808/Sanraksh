"""
Phase 2 Automation Engine
Orchestrates disruption simulation, claim generation, and settlement routing.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Dict, List, Tuple
import uuid

from sqlalchemy import Date, cast, func
from sqlalchemy.orm import Session

from app.models.claim import ApprovalType, Claim, ClaimStatus
from app.models.disruption import Disruption, DisruptionType, EventType, Severity
from app.models.policy import Policy, PolicyStatus
from app.models.user import User
from app.services.fraud_detection import fraud_detection_service
from app.services.signal_ingestion import signal_ingestion_service


PAYOUT_MULTIPLIER = {
    "heavy_rain": 1.00,
    "flood": 1.50,
    "severe_pollution": 0.75,
    "curfew": 1.10,
    "market_closure": 0.90,
}


def _claim_number() -> str:
    return f"CLM-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"


def _infer_disruption_type(event_type: EventType) -> DisruptionType:
    if event_type in {EventType.HEAVY_RAIN, EventType.FLOOD, EventType.EXTREME_HEAT, EventType.SEVERE_POLLUTION}:
        return DisruptionType.WEATHER
    if event_type in {EventType.TRAFFIC_JAM, EventType.ROAD_CLOSURE}:
        return DisruptionType.TRAFFIC
    return DisruptionType.SOCIAL


@dataclass
class SimulationSummary:
    disruption_id: str
    city: str
    zone: str
    event_type: str
    severity: str
    targeted_workers: int
    created_claims: int
    auto_paid_count: int
    review_count: int
    rejected_count: int
    skipped_existing_count: int
    total_payout: float
    avg_fraud_score: float
    signal_confidence: float
    decision_trace_samples: List[Dict]
    estimated_settlement_seconds: int


class AutomationEngine:
    """Production-style orchestration for Phase 2 simulations."""

    async def run_disruption_simulation(
        self,
        db: Session,
        city: str,
        zone: str,
        event_type: EventType,
        severity: Severity,
        strict_mode: bool = True,
        source: str = "phase2_simulator",
        affected_radius_km: float = 2.0,
        limit_workers: int = 500,
    ) -> Dict:
        now = datetime.utcnow()
        signal_profile = await signal_ingestion_service.collect_signals(
            city=city,
            zone=zone,
            event_type=event_type,
            severity=severity,
        )
        signal_confidence = float(signal_profile["aggregate_confidence"])

        disruption = Disruption(
            id=uuid.uuid4(),
            disruption_type=_infer_disruption_type(event_type),
            event_type=event_type,
            severity=severity,
            city=city,
            zone=zone,
            affected_radius_km=affected_radius_km,
            start_time=now,
            is_active=True,
            source=source,
            event_metadata={
                "strict_mode": strict_mode,
                "phase": "phase2",
                "signal_profile": signal_profile,
            },
        )
        db.add(disruption)
        db.flush()

        workers_q = (
            db.query(Policy, User)
            .join(User, User.id == Policy.user_id)
            .filter(Policy.status == PolicyStatus.ACTIVE)
        )

        if city:
            workers_q = workers_q.filter(User.work_city == city)
        if zone and zone.lower() != "all zones":
            workers_q = workers_q.filter(User.work_zone == zone)

        worker_rows: List[Tuple[Policy, User]] = workers_q.limit(limit_workers).all()
        targeted_workers = len(worker_rows)

        multiplier = PAYOUT_MULTIPLIER.get(event_type.value, 1.0)
        created_claims = 0
        auto_paid_count = 0
        review_count = 0
        rejected_count = 0
        skipped_existing_count = 0
        total_payout = 0.0
        fraud_scores: List[float] = []
        decision_trace_samples: List[Dict] = []

        peers_in_zone = max(targeted_workers, 1)
        base_affected_ratio = 0.8 if severity in {Severity.HIGH, Severity.EXTREME} else 0.55
        likely_affected_ratio = max(0.35, min(0.95, base_affected_ratio * (0.8 + signal_confidence * 0.5)))

        for policy, user in worker_rows:
            duplicate_same_event = (
                db.query(Claim.id)
                .join(Disruption, Claim.disruption_id == Disruption.id)
                .filter(
                    Claim.user_id == user.id,
                    cast(Claim.created_at, Date) == date.today(),
                    Disruption.event_type == event_type,
                )
                .first()
            )
            if duplicate_same_event:
                skipped_existing_count += 1
                continue

            recent_claims = (
                db.query(func.count(Claim.id))
                .filter(Claim.user_id == user.id, Claim.created_at >= now - timedelta(days=30))
                .scalar()
                or 0
            )
            avg_claim_amount = (
                db.query(func.avg(Claim.claim_amount)).filter(Claim.user_id == user.id).scalar() or policy.coverage_amount
            )

            peers_affected = int(peers_in_zone * likely_affected_ratio)
            location_match = bool(user.work_zone and user.work_zone == zone) if zone.lower() != "all zones" else True
            gps_enabled = True

            if strict_mode and recent_claims >= 8:
                location_match = False

            claim_amount = round(policy.coverage_amount * multiplier, 2)
            fraud_result = fraud_detection_service.calculate_fraud_score(
                claim_data={
                    "amount": claim_amount,
                    "gps_enabled": gps_enabled,
                    "location_match": location_match,
                    "auto_triggered": True,
                    "submission_delay_minutes": 0,
                },
                user_history={
                    "claims_last_30_days": recent_claims,
                    "avg_days_between_claims": 30 / max(recent_claims, 1),
                    "avg_claim_amount": float(avg_claim_amount),
                },
                peer_data={
                    "peers_affected": peers_affected,
                    "peers_in_zone": peers_in_zone,
                    "collusion_pattern": strict_mode and recent_claims > 10,
                },
            )

            fraud_score = float(fraud_result["fraud_score"])
            fraud_scores.append(fraud_score)

            status = ClaimStatus.PENDING
            approval_type = ApprovalType.MANUAL
            rejection_reason = None
            payout_date = None
            payout_txn = None

            if fraud_result["action"] == "approve":
                status = ClaimStatus.PAID
                approval_type = ApprovalType.AUTO
                payout_date = now
                payout_txn = f"AUTO-{str(uuid.uuid4())[:8].upper()}"
                auto_paid_count += 1
                total_payout += claim_amount
            elif fraud_result["action"] == "manual_review":
                status = ClaimStatus.PENDING
                approval_type = ApprovalType.MANUAL
                review_count += 1
            else:
                status = ClaimStatus.REJECTED
                approval_type = ApprovalType.MANUAL
                rejection_reason = "High fraud probability during disruption automation"
                rejected_count += 1

            reason_codes = self._build_reason_codes(
                action=fraud_result["action"],
                fraud_score=fraud_score,
                location_match=location_match,
                recent_claims=recent_claims,
                signal_confidence=signal_confidence,
                peer_match_ratio=(peers_affected / max(peers_in_zone, 1)),
            )

            decision_note = "TRACE:" + "|".join(reason_codes)
            rejection_reason = f"{rejection_reason} ({decision_note})" if rejection_reason else decision_note

            claim = Claim(
                id=uuid.uuid4(),
                claim_number=_claim_number(),
                user_id=user.id,
                policy_id=policy.id,
                disruption_id=disruption.id,
                claim_date=date.today(),
                claim_amount=claim_amount,
                status=status,
                approval_type=approval_type,
                rejection_reason=rejection_reason,
                fraud_score=fraud_score,
                location_verified=location_match,
                payout_date=payout_date,
                payout_transaction_id=payout_txn,
                peer_validation_count=peers_affected,
            )
            db.add(claim)
            created_claims += 1

            if len(decision_trace_samples) < 10:
                decision_trace_samples.append(
                    {
                        "claim_number": claim.claim_number,
                        "status": status.value,
                        "fraud_score": round(fraud_score, 3),
                        "reasons": reason_codes,
                    }
                )

        db.commit()

        avg_fraud_score = round(sum(fraud_scores) / max(len(fraud_scores), 1), 3)
        estimated_settlement_seconds = max(20, min(90, 25 + auto_paid_count // 4))

        summary = SimulationSummary(
            disruption_id=str(disruption.id),
            city=city,
            zone=zone,
            event_type=event_type.value,
            severity=severity.value,
            targeted_workers=targeted_workers,
            created_claims=created_claims,
            auto_paid_count=auto_paid_count,
            review_count=review_count,
            rejected_count=rejected_count,
            skipped_existing_count=skipped_existing_count,
            total_payout=round(total_payout, 2),
            avg_fraud_score=avg_fraud_score,
            signal_confidence=round(signal_confidence, 3),
            decision_trace_samples=decision_trace_samples,
            estimated_settlement_seconds=estimated_settlement_seconds,
        )
        return summary.__dict__

    def _build_reason_codes(
        self,
        action: str,
        fraud_score: float,
        location_match: bool,
        recent_claims: int,
        signal_confidence: float,
        peer_match_ratio: float,
    ) -> List[str]:
        reasons: List[str] = []

        if action == "approve":
            reasons.append("ROUTE_AUTO_PAY")
        elif action == "manual_review":
            reasons.append("ROUTE_MANUAL_REVIEW")
        else:
            reasons.append("ROUTE_REJECT")

        if fraud_score >= 0.75:
            reasons.append("FRAUD_SCORE_HIGH")
        elif fraud_score >= 0.4:
            reasons.append("FRAUD_SCORE_MEDIUM")
        else:
            reasons.append("FRAUD_SCORE_LOW")

        reasons.append("LOCATION_MATCH" if location_match else "LOCATION_MISMATCH")

        if recent_claims >= 8:
            reasons.append("HIGH_30D_CLAIM_FREQUENCY")
        elif recent_claims >= 4:
            reasons.append("MODERATE_30D_CLAIM_FREQUENCY")

        if signal_confidence < 0.55:
            reasons.append("LOW_EVENT_CONFIDENCE")
        elif signal_confidence >= 0.75:
            reasons.append("HIGH_EVENT_CONFIDENCE")

        if peer_match_ratio < 0.35:
            reasons.append("WEAK_PEER_CORROBORATION")
        else:
            reasons.append("PEER_CORROBORATION_OK")

        return reasons


automation_engine = AutomationEngine()
