# Contributing to GigShield

Thank you for considering contributing to GigShield! This document provides guidelines for contributing to the project.

## Development Workflow

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Write tests** for new functionality
5. **Run tests:** `pytest` (backend) or `npm test` (frontend)
6. **Commit your changes:** Use conventional commits format
7. **Push to your fork:** `git push origin feature/your-feature-name`
8. **Create a Pull Request**

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(pricing): add loyalty discount calculation
fix(claims): correct fraud score threshold
docs(api): update authentication endpoints
```

## Code Style

### Python (Backend)
- Follow PEP 8 style guide
- Use type hints for function signatures
- Maximum line length: 100 characters
- Use docstrings for all functions/classes

```python
def calculate_premium(
    risk_score: float,
    city: str,
    season: str
) -> dict:
    """
    Calculate weekly insurance premium.
    
    Args:
        risk_score: User risk score (0-1)
        city: City name
        season: Season (monsoon/summer/winter)
        
    Returns:
        Dict with premium breakdown
    """
    pass
```

### TypeScript (Frontend)
- Use TypeScript strict mode
- Use functional components with hooks
- Use meaningful variable names
- Add comments for complex logic

```typescript
interface PremiumBreakdown {
  basePremium: number;
  adjustments: Adjustment[];
  finalPremium: number;
}

const calculateTotal = (breakdown: PremiumBreakdown): number => {
  return breakdown.finalPremium;
};
```

## Testing Guidelines

### Backend Tests
- Write tests for all new services
- Aim for >80% code coverage
- Use pytest fixtures for common setup
- Test edge cases and error handling

```python
def test_premium_calculation():
    service = PricingService()
    result = service.calculate_premium(
        risk_score=0.5,
        city="Mumbai",
        season="winter",
        user_history={}
    )
    assert result["base_premium"] == 40.0
```

### Frontend Tests
- Test components with user interactions
- Test API integration
- Test edge cases (loading, errors)

## Pull Request Guidelines

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] Tested locally with Docker Compose

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manually tested

## Screenshots (if applicable)
Add screenshots for UI changes
```

## Directory Structure

```
gigshield-dev/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── models/   # Database models
│   │   ├── services/ # Business logic
│   │   ├── routers/  # API endpoints
│   │   └── utils/    # Helper functions
│   ├── tests/        # Backend tests
│   └── alembic/      # Database migrations
├── frontend/         # Next.js frontend
│   ├── src/
│   │   ├── app/      # Pages
│   │   ├── components/ # React components
│   │   └── lib/      # Utilities
├── ml-training/      # ML notebooks
├── whatsapp-bot/     # WhatsApp integration
└── docs/             # Documentation
```

## Setting Up Development Environment

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Full Stack with Docker
```bash
docker-compose up
```

## API Documentation

When adding new endpoints:
1. Add proper docstrings to route handlers
2. Define Pydantic schemas for request/response
3. Update `docs/API.md` with examples
4. Test with Swagger UI at `/docs`

## Database Migrations

When modifying models:
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Questions?

- Open an issue for bugs or feature requests
- Join our Discord for discussions (link in README)
- Email: dev@gigshield.app

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

Thank you for contributing! 🙏
