"""
Claim Processor Worker
Automatically processes and approves claims
"""

import asyncio
from datetime import datetime
import logging

from app.services.peer_validation import peer_validation_service
from app.services.fraud_detection import fraud_detection_service
from app.services.notifications import notification_service

logger = logging.getLogger(__name__)


class ClaimProcessor:
    """Background worker for claim processing"""
    
    def __init__(self):
        self.processing_interval = 60  # Check every minute
    
    async def start(self):
        """Start claim processing loop"""
        logger.info("⚖️  Claim processor worker started")
        
        while True:
            try:
                await self.process_pending_claims()
                await asyncio.sleep(self.processing_interval)
            except Exception as e:
                logger.error(f"Claim processor error: {str(e)}")
                await asyncio.sleep(60)
    
    async def process_pending_claims(self):
        """Process all pending claims"""
        # This would query database for pending claims
        pending_claims = self._get_pending_claims()
        
        if not pending_claims:
            return
        
        logger.info(f"Processing {len(pending_claims)} pending claims...")
        
        for claim in pending_claims:
            await self.process_claim(claim)
    
    async def process_claim(self, claim: dict):
        """Process individual claim"""
        try:
            claim_id = claim["id"]
            user_id = claim["user_id"]
            
            logger.info(f"Processing claim {claim_id} for user {user_id}")
            
            # Step 1: Peer validation
            peer_result = peer_validation_service.validate_claim(
                claim_data=claim,
                user_location=claim.get("user_location", {}),
                disruption_data=claim.get("disruption")
            )
            
            # Step 2: Fraud detection
            fraud_result = fraud_detection_service.calculate_fraud_score(
                claim_data=claim,
                user_history=claim.get("user_history", {}),
                peer_data=peer_result
            )
            
            # Step 3: Make decision
            decision = self._make_decision(peer_result, fraud_result)
            
            # Step 4: Execute decision
            if decision["action"] == "approve":
                await self._approve_claim(claim, decision)
            elif decision["action"] == "reject":
                await self._reject_claim(claim, decision)
            else:
                await self._flag_for_review(claim, decision)
            
        except Exception as e:
            logger.error(f"Error processing claim {claim.get('id')}: {str(e)}")
    
    def _make_decision(self, peer_result: dict, fraud_result: dict) -> dict:
        """Make final claim decision"""
        
        # High confidence from peers + low fraud score = Auto-approve
        if peer_result["confidence"] == "high" and fraud_result["fraud_score"] < 0.3:
            return {
                "action": "approve",
                "reason": "peer_validated_high_confidence",
                "approval_type": "auto",
                "confidence": "high"
            }
        
        # Medium confidence + low fraud = Auto-approve
        if peer_result["confidence"] in ["high", "medium"] and fraud_result["fraud_score"] < 0.5:
            return {
                "action": "approve",
                "reason": "peer_validated_medium_confidence",
                "approval_type": "auto",
                "confidence": "medium"
            }
        
        # High fraud score = Reject
        if fraud_result["fraud_score"] > 0.7:
            return {
                "action": "reject",
                "reason": "high_fraud_probability",
                "fraud_flags": fraud_result["flags"]
            }
        
        # Everything else = Manual review
        return {
            "action": "manual_review",
            "reason": "insufficient_confidence",
            "peer_confidence": peer_result["confidence"],
            "fraud_score": fraud_result["fraud_score"]
        }
    
    async def _approve_claim(self, claim: dict, decision: dict):
        """Approve and payout claim"""
        logger.info(f"✅ Approving claim {claim['id']}")
        
        # Process payout (integrate with Razorpay)
        payout_result = await self._process_payout(claim)
        
        # Send notification
        await notification_service.send_claim_approved(
            user=claim["user"],
            claim=claim,
            payout_info=payout_result
        )
        
        # Update database
        # db.update_claim(claim_id, status="approved", ...)
        
        logger.info(f"💸 Payout processed: {payout_result['transaction_id']}")
    
    async def _reject_claim(self, claim: dict, decision: dict):
        """Reject claim"""
        logger.info(f"❌ Rejecting claim {claim['id']}: {decision['reason']}")
        
        # Send notification with reason
        # await notification_service.send_claim_rejected(...)
        
        # Update database
        # db.update_claim(claim_id, status="rejected", ...)
    
    async def _flag_for_review(self, claim: dict, decision: dict):
        """Flag claim for manual review"""
        logger.info(f"⏸️  Flagging claim {claim['id']} for manual review")
        
        # Create review task
        # db.create_review_task(claim_id, reason=decision['reason'])
    
    async def _process_payout(self, claim: dict) -> dict:
        """Process payout via Razorpay"""
        # This would integrate with Razorpay API
        # For now, return mock response
        
        return {
            "transaction_id": f"TXN_{datetime.utcnow().timestamp()}",
            "amount": claim["claim_amount"],
            "status": "success",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _get_pending_claims(self):
        """Get pending claims from database"""
        # Mock data for now
        return []


# Create worker instance
claim_processor = ClaimProcessor()


if __name__ == "__main__":
    asyncio.run(claim_processor.start())
