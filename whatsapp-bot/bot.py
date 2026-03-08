"""
WhatsApp Bot
Twilio webhook handler for WhatsApp conversations
"""

from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
import os
from datetime import datetime

app = Flask(__name__)

# Twilio configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Simple state management (would use Redis in production)
user_states = {}


@app.route("/webhooks/whatsapp", methods=["POST"])
def whatsapp_webhook():
    """Handle incoming WhatsApp messages"""
    
    # Get message details
    from_number = request.form.get("From")
    message_body = request.form.get("Body", "").strip().lower()
    
    # Create response
    response = MessagingResponse()
    
    # Get or initialize user state
    state = user_states.get(from_number, {"step": "initial"})
    
    # Handle message based on state
    reply = handle_message(from_number, message_body, state)
    
    response.message(reply)
    
    return str(response)


def handle_message(phone: str, message: str, state: dict) -> str:
    """
    Handle message based on conversation state
    
    Returns reply message
    """
    
    step = state.get("step", "initial")
    
    # Initial greeting
    if step == "initial" or message in ["hi", "hello", "start", "insurance"]:
        user_states[phone] = {"step": "ask_name"}
        return """👋 Welcome to GigArmor!

Protect yourself from income loss due to weather, traffic, and strikes.

💰 Just ₹48/week
🛡️  ₹800/day coverage
⚡ 60-second payouts

To get started, what's your name?"""
    
    # Get name
    elif step == "ask_name":
        user_states[phone] = {
            "step": "ask_platform",
            "name": message.title()
        }
        return f"""Nice to meet you, {message.title()}!

Which delivery platform do you work for?

1️⃣ Zomato
2️⃣ Swiggy
3️⃣ Amazon
4️⃣ Zepto
5️⃣ Blinkit
6️⃣ Other

Reply with the number (1-6)"""
    
    # Get platform
    elif step == "ask_platform":
        platforms = {
            "1": "Zomato", "2": "Swiggy", "3": "Amazon",
            "4": "Zepto", "5": "Blinkit", "6": "Other"
        }
        
        platform = platforms.get(message, "Unknown")
        user_states[phone]["platform"] = platform
        user_states[phone]["step"] = "ask_city"
        
        return f"""Great! {platform} partner 💼

Which city do you work in?
(Example: Mumbai, Bangalore, Delhi)"""
    
    # Get city
    elif step == "ask_city":
        user_states[phone]["city"] = message.title()
        user_states[phone]["step"] = "ask_zone"
        
        return f"""Perfect! Working in {message.title()} 🏙️

Which area/zone do you usually work in?
(Example: Andheri, Koramangala, Connaught Place)"""
    
    # Get zone and show pricing
    elif step == "ask_zone":
        zone = message.title()
        user_states[phone]["zone"] = zone
        user_states[phone]["step"] = "confirm_policy"
        
        # Calculate premium (mock)
        premium = 48
        risk_level = "MEDIUM"
        
        return f"""Excellent! 📍 {zone}

YOUR COVERAGE DETAILS:
━━━━━━━━━━━━━━━━━━━━━━
⚠️  Zone Risk: {risk_level}
💰 Weekly Premium: ₹{premium}
🛡️  Daily Coverage: ₹800
━━━━━━━━━━━━━━━━━━━━━━

✅ Auto-claim approval
⚡ 60-second payouts
🔄 Cancel anytime

Reply YES to activate your policy!
Reply NO to cancel."""
    
    # Confirm and activate
    elif step == "confirm_policy":
        if message == "yes":
            # Create policy
            policy_number = f"POL-{datetime.now().strftime('%Y%m%d%H%M%S')}"
            user_states[phone]["policy_number"] = policy_number
            user_states[phone]["step"] = "active"
            
            return f"""🎉 Congratulations!

Policy Activated: {policy_number}

━━━━━━━━━━━━━━━━━━━━━━
💰 Premium: ₹48/week
🛡️  Coverage: ₹800/day
━━━━━━━━━━━━━━━━━━━━━━

📌 HOW IT WORKS:
• Heavy rain/disruption detected
• Your claim auto-filed
• Money transferred in 60 seconds
• Track everything at gigarmor.app

COMMANDS:
/status - Check policy
/claims - View claims
/premium - Payment info
/help - Get help

Stay safe! 🙏"""
        else:
            user_states[phone] = {"step": "initial"}
            return "No problem! Reply HI anytime to get covered. Take care! 👋"
    
    # Handle commands for active users
    elif step == "active":
        if message == "/status":
            policy = user_states[phone].get("policy_number", "N/A")
            return f"""📋 POLICY STATUS

Policy: {policy}
Status: ✅ ACTIVE
Coverage: ₹800/day
Next Payment: March 15

You're fully protected! 🛡️"""
        
        elif message == "/claims":
            return """📑 YOUR CLAIMS

No claims filed yet.

When a disruption happens, we'll auto-file your claim and notify you immediately!"""
        
        elif message == "/premium":
            return """💰 PREMIUM DETAILS

This Week: ₹48
Due: March 15, 2026

BREAKDOWN:
Base Rate: ₹40
+ Zone Risk: ₹4
+ Monsoon: ₹5
- Loyalty: -₹1

Auto-debit enabled ✅"""
        
        elif message == "/help":
            return """🆘 HELP & COMMANDS

/status - Policy status
/claims - View claims
/premium - Payment info
/help - This message

Questions?
📧 support@gigarmor.app
📞 1800-XXX-XXXX

We're here to help! 💙"""
        
        else:
            return """I didn't understand that. 🤔

Try these commands:
/status - Check policy
/claims - View claims
/help - Get help

Or just say HI!"""
    
    # Default
    return "Welcome to GigArmor! Reply HI to get started. 👋"


def send_whatsapp_message(to_phone: str, message: str):
    """Send WhatsApp message to user"""
    try:
        client.messages.create(
            from_=TWILIO_WHATSAPP_NUMBER,
            to=to_phone,
            body=message
        )
        return True
    except Exception as e:
        print(f"Error sending WhatsApp: {str(e)}")
        return False


if __name__ == "__main__":
    app.run(port=5000, debug=True)
