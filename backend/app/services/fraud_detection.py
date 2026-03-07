"""
Fraud Detection Service
Detects anomalies and suspicious claim patterns
"""

from typing import Dict, List
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class FraudDetectionService:
    """Fraud detection using rule-based and ML approaches"""
    
    def __init__(self):
        self.fraud_threshold = 0.7  # 70% fraud probability triggers review
    
    def calculate_fraud_score(
        self,
        claim_data: Dict,
        user_history: Dict,
        peer_data: Dict
    ) -> Dict:
        """
        Calculate fraud probability score
        
        Args:
            claim_data: Current claim information
            user_history: User's historical data
            peer_data: Peer validation data
        
        Returns:
            Dict with fraud score and flags
        """
        
        score = 0.0
        flags = []
        
        # 1. Frequency check (30%)
        frequency_score, frequency_flags = self._check_frequency(user_history)
        score += frequency_score * 0.3
        flags.extend(frequency_flags)
        
        # 2. Location verification (25%)
        location_score, location_flags = self._verify_location(claim_data, peer_data)
        score += location_score * 0.25
        flags.extend(location_flags)
        
        # 3. Peer validation (25%)
        peer_score, peer_flags = self._validate_peers(peer_data)
        score += peer_score * 0.25
        flags.extend(peer_flags)
        
        # 4. Amount anomaly (15%)
        amount_score, amount_flags = self._check_amount(claim_data, user_history)
        score += amount_score * 0.15
        flags.extend(amount_flags)
        
        # 5. Timing patterns (5%)
        timing_score, timing_flags = self._check_timing(claim_data, user_history)
        score += timing_score * 0.05
        flags.extend(timing_flags)
        
        # Determine action
        if score >= 0.7:
            action = "reject"
            confidence = "high"
        elif score >= 0.5:
            action = "manual_review"
            confidence = "medium"
        else:
            action = "approve"
            confidence = "low"
        
        return {
            "fraud_score": round(score, 3),
            "confidence": confidence,
            "action": action,
            "flags": flags,
            "breakdown": {
                "frequency": frequency_score,
                "location": location_score,
                "peer_validation": peer_score,
                "amount": amount_score,
                "timing": timing_score
            }
        }
    
    def _check_frequency(self, user_history: Dict) -> tuple:
        """Check claim frequency patterns"""
        claims_last_30_days = user_history.get("claims_last_30_days", 0)
        avg_days_between_claims = user_history.get("avg_days_between_claims", 30)
        
        score = 0.0
        flags = []
        
        # Too many claims
        if claims_last_30_days > 8:
            score += 0.8
            flags.append("excessive_claims")
        elif claims_last_30_days > 5:
            score += 0.5
            flags.append("high_frequency")
        
        # Claims too close together
        if avg_days_between_claims < 3:
            score += 0.6
            flags.append("rapid_succession")
        
        return min(score, 1.0), flags
    
    def _verify_location(self, claim_data: Dict, peer_data: Dict) -> tuple:
        """Verify location matches disruption"""
        score = 0.0
        flags = []
        
        # GPS disabled or unavailable
        if not claim_data.get("gps_enabled"):
            score += 0.5
            flags.append("gps_disabled")
        
        # Location doesn't match disruption zone
        if not claim_data.get("location_match"):
            score += 0.7
            flags.append("location_mismatch")
        
        # No peers in same location
        if peer_data.get("peers_in_zone", 0) == 0:
            score += 0.4
            flags.append("no_peer_presence")
        
        return min(score, 1.0), flags
    
    def _validate_peers(self, peer_data: Dict) -> tuple:
        """Validate using peer data"""
        score = 0.0
        flags = []
        
        peers_affected = peer_data.get("peers_affected", 0)
        peers_in_zone = peer_data.get("peers_in_zone", 1)
        
        # Calculate peer confirmation rate
        if peers_in_zone > 0:
            confirmation_rate = peers_affected / peers_in_zone
            
            if confirmation_rate < 0.2:  # <20% peers affected
                score += 0.8
                flags.append("low_peer_confirmation")
            elif confirmation_rate < 0.5:
                score += 0.3
                flags.append("moderate_peer_confirmation")
        
        # Collusion check - same users always claiming together
        if peer_data.get("collusion_pattern"):
            score += 0.9
            flags.append("possible_collusion")
        
        return min(score, 1.0), flags
    
    def _check_amount(self, claim_data: Dict, user_history: Dict) -> tuple:
        """Check if claim amount is anomalous"""
        score = 0.0
        flags = []
        
        claim_amount = claim_data.get("amount", 0)
        avg_claim_amount = user_history.get("avg_claim_amount", claim_amount)
        
        # Amount significantly higher than average
        if avg_claim_amount > 0:
            ratio = claim_amount / avg_claim_amount
            if ratio > 2.0:
                score += 0.6
                flags.append("inflated_amount")
        
        return min(score, 1.0), flags
    
    def _check_timing(self, claim_data: Dict, user_history: Dict) -> tuple:
        """Check timing patterns"""
        score = 0.0
        flags = []
        
        # Immediate claims might be suspicious if no real-time trigger
        submission_delay = claim_data.get("submission_delay_minutes", 0)
        if submission_delay < 1 and not claim_data.get("auto_triggered"):
            score += 0.3
            flags.append("suspicious_timing")
        
        # Always claims at specific times (pattern)
        if user_history.get("same_hour_pattern"):
            score += 0.4
            flags.append("timing_pattern")
        
        return min(score, 1.0), flags


fraud_detection_service = FraudDetectionService()
