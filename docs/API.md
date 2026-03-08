# API Documentation

## Base URL

```
Development: http://localhost:8000
Production: https://api.gigarmor.app
```

## Authentication

All protected endpoints require JWT Bearer token:

```http
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User

```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "phone": "+919876543210",
  "name": "Rahul Kumar",
  "email": "rahul@example.com",
  "delivery_platform": "zomato",
  "work_city": "Mumbai",
  "work_zone": "Andheri West",
  "work_location_lat": 19.1136,
  "work_location_lng": 72.8697
}
```

**Response:**
```json
{
  "user_id": "uuid",
  "otp_sent": true,
  "message": "OTP sent to phone number"
}
```

### Verify OTP & Login

```http
POST /api/v1/auth/verify-otp
```

**Request Body:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "name": "Rahul Kumar",
    "phone": "+919876543210"
  }
}
```

---

## Policy Endpoints

### Calculate Premium

```http
POST /api/v1/policies/calculate-premium
```

**Request Body:**
```json
{
  "user_id": "uuid",
  "city": "Mumbai",
  "zone": "Andheri West",
  "coverage_amount": 800
}
```

**Response:**
```json
{
  "base_premium": 40.0,
  "adjustments": [
    {
      "factor": "Zone Risk",
      "amount": 4.0,
      "description": "Andheri West risk level"
    },
    {
      "factor": "Season",
      "amount": 5.0,
      "description": "Monsoon season"
    },
    {
      "factor": "Loyalty Discount",
      "amount": -3.0,
      "description": "6 months with us"
    }
  ],
  "final_premium": 46.0,
  "coverage_daily": 800.0,
  "calculation_timestamp": "2026-03-08T10:30:00Z"
}
```

### Create Policy

```http
POST /api/v1/policies/create
```

**Request Body:**
```json
{
  "user_id": "uuid",
  "coverage_amount": 800.0
}
```

**Response:**
```json
{
  "id": "uuid",
  "policy_number": "POL-2026-001234",
  "user_id": "uuid",
  "start_date": "2026-03-08",
  "end_date": "2026-03-15",
  "status": "active",
  "weekly_premium": 46.0,
  "coverage_amount": 800.0,
  "coverage_type": "income_loss_only",
  "created_at": "2026-03-08T10:30:00Z"
}
```

### Get Active Policies

```http
GET /api/v1/policies/active?user_id=uuid
```

**Response:**
```json
{
  "policies": [
    {
      "id": "uuid",
      "policy_number": "POL-2026-001234",
      "status": "active",
      "weekly_premium": 46.0,
      "coverage_amount": 800.0,
      "start_date": "2026-03-08",
      "end_date": "2026-03-15"
    }
  ]
}
```

---

## Claims Endpoints

### Create Claim

```http
POST /api/v1/claims/create
```

**Request Body:**
```json
{
  "user_id": "uuid",
  "policy_id": "uuid",
  "disruption_id": "uuid",
  "claim_date": "2026-03-08",
  "claim_amount": 800.0,
  "description": "Heavy rain, unable to work"
}
```

**Response:**
```json
{
  "id": "uuid",
  "claim_number": "CLM-2026-005678",
  "user_id": "uuid",
  "policy_id": "uuid",
  "claim_amount": 800.0,
  "status": "pending",
  "created_at": "2026-03-08T14:25:00Z"
}
```

### Get Claim Status

```http
GET /api/v1/claims/{claim_id}/status
```

**Response:**
```json
{
  "claim_id": "uuid",
  "claim_number": "CLM-2026-005678",
  "status": "approved",
  "amount": 800.0,
  "claim_date": "2026-03-08",
  "payout_info": {
    "transaction_id": "TXN-123456",
    "amount": 800.0,
    "status": "transferred",
    "timestamp": "2026-03-08T14:26:00Z"
  }
}
```

### Get User Claims

```http
GET /api/v1/claims/user/{user_id}
```

**Response:**
```json
{
  "claims": [
    {
      "id": "uuid",
      "claim_number": "CLM-2026-005678",
      "claim_date": "2026-03-08",
      "amount": 800.0,
      "status": "approved",
      "approval_type": "auto",
      "payout_transaction_id": "TXN-123456"
    }
  ],
  "total_claims": 1,
  "total_payout": 800.0
}
```

---

## Risk Zones Endpoints

### Get Risk Heatmap

```http
GET /api/v1/risk-zones/heatmap?city=Mumbai
```

**Response:**
```json
{
  "city": "Mumbai",
  "zones": [
    {
      "zone_id": "ZONE_19_72",
      "lat": 19.1136,
      "lng": 72.8697,
      "overall_risk_score": 0.68,
      "risk_level": "high",
      "color": "#f59e0b",
      "breakdown": {
        "weather_risk": 0.75,
        "traffic_risk": 0.60,
        "historical_risk": 0.70,
        "social_risk": 0.20
      },
      "recommendation": "⚠️ ELEVATED RISK: Work with caution"
    }
  ]
}
```

### Get City Risk Zones

```http
GET /api/v1/risk-zones/city/Mumbai
```

---

## Disruptions Endpoints

### Get Active Disruptions

```http
GET /api/v1/disruptions/active
```

**Response:**
```json
{
  "disruptions": [
    {
      "id": "uuid",
      "disruption_type": "weather",
      "event_type": "heavy_rain",
      "severity": "high",
      "city": "Mumbai",
      "zone": "Andheri West",
      "start_time": "2026-03-08T14:00:00Z",
      "is_active": true
    }
  ]
}
```

---

## Analytics Endpoints (Admin)

### Dashboard Stats

```http
GET /api/v1/analytics/dashboard
```

**Response:**
```json
{
  "total_users": 1247,
  "active_policies": 1089,
  "total_claims": 342,
  "claims_approved_today": 23,
  "total_payout_amount": 273600,
  "automation_rate": 99.8
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message",
  "error_code": "ERROR_CODE",
  "timestamp": "2026-03-08T14:30:00Z"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- **Authenticated:** 100 requests/minute
- **Unauthenticated:** 20 requests/minute

---

## Webhooks

### Twilio WhatsApp Webhook

```http
POST /webhooks/whatsapp
```

Receives WhatsApp messages from Twilio for bot conversations.

---

For more details, visit: http://localhost:8000/docs (Swagger UI)
