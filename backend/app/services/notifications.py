"""
Notification Service
Send notifications via WhatsApp, Email, SMS
"""

from typing import Dict, List, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class NotificationService:
    """Multi-channel notification service"""
    
    def __init__(self):
        self.whatsapp_enabled = True
        self.email_enabled = True
        self.sms_enabled = False
    
    async def send_claim_approved(
        self,
        user: Dict,
        claim: Dict,
        payout_info: Dict
    ) -> Dict:
        """Send claim approval notification"""
        
        message = self._format_claim_approved_message(claim, payout_info)
        
        results = {
            "whatsapp": await self._send_whatsapp(user["phone"], message),
            "email": await self._send_email(user.get("email"), "Claim Approved", message),
        }
        
        return {
            "notification_sent": True,
            "channels": results,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def send_disruption_alert(
        self,
        user: Dict,
        disruption: Dict
    ) -> Dict:
        """Send disruption alert notification"""
        
        message = self._format_disruption_alert(disruption)
        
        results = {
            "whatsapp": await self._send_whatsapp(user["phone"], message)
        }
        
        return {
            "notification_sent": True,
            "channels": results,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def send_risk_warning(
        self,
        user: Dict,
        risk_data: Dict
    ) -> Dict:
        """Send predictive risk warning"""
        
        message = self._format_risk_warning(risk_data)
        
        results = {
            "whatsapp": await self._send_whatsapp(user["phone"], message)
        }
        
        return {
            "notification_sent": True,
            "channels": results,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def send_premium_reminder(
        self,
        user: Dict,
        premium_data: Dict
    ) -> Dict:
        """Send weekly premium reminder"""
        
        message = self._format_premium_reminder(premium_data)
        
        results = {
            "whatsapp": await self._send_whatsapp(user["phone"], message)
        }
        
        return {
            "notification_sent": True,
            "channels": results,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def _send_whatsapp(
        self,
        phone: str,
        message: str
    ) -> Dict:
        """Send WhatsApp message via Twilio"""
        if not self.whatsapp_enabled:
            return {"sent": False, "reason": "whatsapp_disabled"}
        
        try:
            # This would integrate with Twilio API
            logger.info(f"WhatsApp to {phone}: {message}")
            return {
                "sent": True,
                "channel": "whatsapp",
                "phone": phone
            }
        except Exception as e:
            logger.error(f"WhatsApp error: {str(e)}")
            return {
                "sent": False,
                "error": str(e)
            }
    
    async def _send_email(
        self,
        email: Optional[str],
        subject: str,
        body: str
    ) -> Dict:
        """Send email via SendGrid"""
        if not email or not self.email_enabled:
            return {"sent": False, "reason": "email_not_available"}
        
        try:
            # This would integrate with SendGrid API
            logger.info(f"Email to {email}: {subject}")
            return {
                "sent": True,
                "channel": "email",
                "email": email
            }
        except Exception as e:
            logger.error(f"Email error: {str(e)}")
            return {
                "sent": False,
                "error": str(e)
            }
    
    def _format_claim_approved_message(
        self,
        claim: Dict,
        payout_info: Dict
    ) -> str:
        """Format claim approval message"""
        return f"""🎉 *Claim Approved!*

Claim: {claim.get('claim_number')}
Amount: ₹{claim.get('claim_amount')}
Status: ✅ Approved

💸 *Payout Details:*
Amount: ₹{payout_info.get('amount')}
Transaction ID: {payout_info.get('transaction_id')}
Status: Transferred

Check your bank account in 2-3 minutes.

Thank you for using Sanraksh! 🛡️"""
    
    def _format_disruption_alert(self, disruption: Dict) -> str:
        """Format disruption alert message"""
        return f"""⚠️ *Disruption Alert*

Type: {disruption.get('event_type').replace('_', ' ').title()}
Location: {disruption.get('zone')}
Severity: {disruption.get('severity').upper()}

🛡️ You're covered! If you can't work, your claim will be auto-approved.

Stay safe! 🙏"""
    
    def _format_risk_warning(self, risk_data: Dict) -> str:
        """Format predictive risk warning"""
        return f"""🔮 *Today's Risk Forecast*

Morning (8-12): {risk_data.get('morning_risk', 'SAFE')}
Afternoon (12-3): {risk_data.get('afternoon_risk', 'SAFE')}
Evening (3-6): {risk_data.get('evening_risk', 'HIGH')}

💡 *Suggestion:*
{risk_data.get('recommendation', 'Work normally')}

Your coverage: ₹{risk_data.get('coverage_amount', 800)}/day"""
    
    def _format_premium_reminder(self, premium_data: Dict) -> str:
        """Format premium reminder message"""
        return f"""💰 *Weekly Premium Due*

This Week: ₹{premium_data.get('amount')}
Due Date: {premium_data.get('due_date')}

Your premium breakdown:
Base: ₹{premium_data.get('base')}
Adjustments: ₹{premium_data.get('adjustment')}

Auto-debit will process on due date.

Questions? Reply HELP"""


notification_service = NotificationService()
