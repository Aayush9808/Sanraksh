# Changelog

All notable changes to GigShield will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- [ ] Multi-language support (Hindi, Marathi, Tamil)
- [ ] Voice-based claim filing
- [ ] Integration with more delivery platforms
- [ ] Mobile app (React Native)
- [ ] Premium payment via UPI AutoPay
- [ ] Gamification (safe driving rewards)

## [1.0.0] - 2026-03-20

### Added - Phase 1 Launch
- User registration with OTP verification
- Weekly policy creation with transparent pricing
- WhatsApp bot for conversational interface
- Dynamic premium calculation using XGBoost
- Hyper-local risk zones (2km x 2km grid)
- Fraud detection using Isolation Forest
- Peer validation for claims
- Auto-processing of claims (<60 seconds)
- Weather monitoring with real-time alerts
- Instant payouts via Razorpay
- Admin dashboard with analytics
- Risk heatmap visualization
- Complete API with Swagger docs
- Database migrations with Alembic
- Docker Compose for local development

### Security
- JWT authentication with token expiry
- OTP verification for login (10-min validity)
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation with Pydantic schemas

### Documentation
- Comprehensive README with setup instructions
- API documentation with examples
- Architecture diagrams
- Deployment guide for Railway.app
- Contributing guidelines

## [0.3.0] - 2026-03-15

### Added
- Background workers (weather monitor, claim processor)
- ML training notebooks
- Frontend components (PricingBreakdown, ClaimsList)
- Seed data script for testing

## [0.2.0] - 2026-03-10

### Added
- Core backend services (pricing, weather, fraud detection)
- Database models (User, Policy, Claim, Disruption, RiskZone)
- Basic frontend with Next.js
- Docker configuration

## [0.1.0] - 2026-03-08

### Added
- Initial project structure
- Git repository setup
- README with project vision

---

## Version History

- **v1.0.0** (2026-03-20): Phase 1 Launch - MVP with all core features
- **v0.3.0** (2026-03-15): Workers and ML integration
- **v0.2.0** (2026-03-10): Backend services and frontend
- **v0.1.0** (2026-03-08): Initial setup

## Future Roadmap

### Phase 2 (Q2 2026)
- Mobile app launch
- 5 more cities (Delhi, Bangalore, Pune, Hyderabad, Chennai)
- Integration with Dunzo, Porter, Urban Company
- Multi-language support

### Phase 3 (Q3 2026)
- Health insurance add-on (₹50/week for accident coverage)
- Family plans (spouse, children coverage)
- Long-term plans (monthly, quarterly)
- Referral program (₹50 credit for each referral)

### Phase 4 (Q4 2026)
- IoT integration (smart helmet with fall detection)
- Predictive maintenance alerts for vehicles
- Wellness program (mental health support)
- Expansion to 20 cities

---

**Current Version:** v1.0.0 (Phase 1)
**Last Updated:** March 8, 2026
