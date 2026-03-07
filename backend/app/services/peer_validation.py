"""
Peer Validation Service
Validates claims using peer data
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta


class PeerValidationService:
    """Peer-based claim validation"""
    
    def validate_claim(
        self,
        claim_data: Dict,
        user_location: Dict,
        disruption_data: Optional[Dict] = None
    ) -> Dict:
        """
        Validate claim using peer data
        
        Args:
            claim_data: Claim information
            user_location: User's location
            disruption_data: Associated disruption info
        
        Returns:
            Validation result with confidence score
        """
        
        # Get peers in vicinity (1km radius)
        peers_in_zone = self._get_peers_in_zone(
            user_location.get("lat"),
            user_location.get("lng"),
            radius_km=1.0
        )
        
        # Count peers who also reported disruption
        peers_affected = self._count_affected_peers(
            peers_in_zone,
            claim_data.get("claim_date"),
            claim_data.get("disruption_type")
        )
        
        total_peers = len(peers_in_zone)
        affected_count = len(peers_affected)
        
        # Calculate confirmation rate
        if total_peers > 0:
            confirmation_rate = affected_count / total_peers
        else:
            confirmation_rate = 0.0
        
        # Determine validation confidence
        confidence, decision = self._determine_confidence(
            confirmation_rate,
            affected_count,
            total_peers
        )
        
        # Check for collusion patterns
        collusion_detected = self._check_collusion(
            claim_data.get("user_id"),
            peers_affected
        )
        
        return {
            "is_validated": decision == "approve",
            "confidence": confidence,
            "decision": decision,
            "peers_in_zone": total_peers,
            "peers_affected": affected_count,
            "confirmation_rate": round(confirmation_rate, 2),
            "collusion_detected": collusion_detected,
            "validation_method": "peer_validation",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _get_peers_in_zone(
        self,
        lat: float,
        lng: float,
        radius_km: float = 1.0
    ) -> List[Dict]:
        """Get other workers in geographic zone"""
        # This would query database for nearby active workers
        # For now, return mock data
        return [
            {"user_id": f"user_{i}", "lat": lat + 0.001 * i, "lng": lng + 0.001 * i}
            for i in range(10)  # Mock 10 peers
        ]
    
    def _count_affected_peers(
        self,
        peers: List[Dict],
        claim_date: str,
        disruption_type: str
    ) -> List[Dict]:
        """Count how many peers also filed claims"""
        # This would query database for peer claims
        # Mock: 60% of peers affected
        affected_count = int(len(peers) * 0.6)
        return peers[:affected_count]
    
    def _determine_confidence(
        self,
        confirmation_rate: float,
        affected_count: int,
        total_peers: int
    ) -> tuple:
        """Determine confidence level and decision"""
        
        # High confidence approval (5+ peers confirm)
        if affected_count >= 5 and confirmation_rate >= 0.5:
            return "high", "approve"
        
        # Medium confidence approval (3-4 peers confirm)
        if affected_count >= 3 and confirmation_rate >= 0.4:
            return "medium", "approve"
        
        # Low peer count but high rate
        if total_peers < 3 and confirmation_rate >= 0.8:
            return "medium", "approve"
        
        # Suspicious: lone claim or very low rate
        if affected_count <= 1 or confirmation_rate < 0.2:
            return "low", "manual_review"
        
        # Default: moderate confidence, needs review
        return "medium", "manual_review"
    
    def _check_collusion(
        self,
        user_id: str,
        peers_affected: List[Dict]
    ) -> bool:
        """Check if same users always claim together"""
        # This would analyze historical patterns
        # Check if user_id and peers_affected have claimed together >3 times
        # For now, return False (no collusion)
        return False
    
    def get_peer_summary(
        self,
        zone: str,
        disruption_id: str
    ) -> Dict:
        """Get summary of peer activity in zone during disruption"""
        
        return {
            "zone": zone,
            "disruption_id": disruption_id,
            "total_workers_in_zone": 25,
            "workers_affected": 18,
            "claims_filed": 15,
            "claims_auto_approved": 14,
            "claims_under_review": 1,
            "average_claim_amount": 800.0,
            "confidence_level": "high",
            "timestamp": datetime.utcnow().isoformat()
        }


peer_validation_service = PeerValidationService()
