"""Phase 2 unit tests for orchestration utilities and signal ingestion."""

import pytest

from app.models.disruption import EventType, Severity
from app.routers.phase2 import _extract_trace_codes, _safe_float
from app.services.automation_engine import automation_engine
from app.services.signal_ingestion import SignalIngestionService


def test_extract_trace_codes_parses_reason_notes():
    notes = "Manual rejection (TRACE:ROUTE_REJECT|FRAUD_SCORE_HIGH|LOCATION_MISMATCH)"
    codes = _extract_trace_codes(notes)

    assert codes == ["ROUTE_REJECT", "FRAUD_SCORE_HIGH", "LOCATION_MISMATCH"]


def test_extract_trace_codes_handles_empty_or_missing_trace():
    assert _extract_trace_codes(None) == []
    assert _extract_trace_codes("No trace available") == []


def test_safe_float_returns_default_on_invalid_values():
    assert _safe_float("12.3") == 12.3
    assert _safe_float(None) == 0.0
    assert _safe_float("bad", default=9.9) == 9.9


def test_build_reason_codes_for_manual_review():
    reasons = automation_engine._build_reason_codes(
        action="manual_review",
        fraud_score=0.52,
        location_match=True,
        recent_claims=5,
        signal_confidence=0.82,
        peer_match_ratio=0.6,
    )

    assert "ROUTE_MANUAL_REVIEW" in reasons
    assert "FRAUD_SCORE_MEDIUM" in reasons
    assert "LOCATION_MATCH" in reasons
    assert "MODERATE_30D_CLAIM_FREQUENCY" in reasons
    assert "HIGH_EVENT_CONFIDENCE" in reasons


@pytest.mark.asyncio
async def test_signal_ingestion_collect_signals_weighting(monkeypatch):
    service = SignalIngestionService()

    async def fake_weather(city: str, event_type: EventType, severity: Severity):
        return {"source": "stub-weather", "active": True, "confidence": 0.8, "detail": "ok"}

    monkeypatch.setattr(service, "_weather_signal", fake_weather)
    monkeypatch.setattr(
        service,
        "_pollution_signal",
        lambda event_type, severity: {"source": "stub-pollution", "active": False, "confidence": 0.4, "detail": "ok"},
    )
    monkeypatch.setattr(
        service,
        "_traffic_signal",
        lambda event_type, severity: {"source": "stub-traffic", "active": True, "confidence": 0.7, "detail": "ok"},
    )
    monkeypatch.setattr(
        service,
        "_platform_signal",
        lambda event_type, severity: {"source": "stub-platform", "active": False, "confidence": 0.5, "detail": "ok"},
    )
    monkeypatch.setattr(
        service,
        "_social_signal",
        lambda event_type, severity: {"source": "stub-social", "active": False, "confidence": 0.3, "detail": "ok"},
    )

    result = await service.collect_signals(
        city="Mumbai",
        zone="Andheri West",
        event_type=EventType.HEAVY_RAIN,
        severity=Severity.HIGH,
    )

    # heavy_rain weights: weather 0.45, traffic 0.2, platform 0.15, social 0.1, pollution 0.1
    expected_confidence = round(0.8 * 0.45 + 0.7 * 0.2 + 0.5 * 0.15 + 0.3 * 0.1 + 0.4 * 0.1, 3)

    assert result["aggregate_confidence"] == expected_confidence
    assert result["recommended_mode"] == "balanced"
    assert set(result["sources"].keys()) == {"weather", "pollution", "traffic", "platform", "social"}
