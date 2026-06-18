# Deployment Guide

## Development Setup

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- PostgreSQL 15
- Redis 7

### Quick Start

1. **Clone and setup environment:**
```bash
git clone https://github.com/Aayush9808/GigArmor.git
cd GigArmor
cp .env.example .env
# Edit .env with your API keys
```

2. **Start all services:**
```bash
docker-compose up -d
```

3. **Run migrations:**
```bash
docker-compose exec backend alembic upgrade head
```

4. **Access applications:**
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:3000

---

## Production Deployment

### Option 1: Railway.app (Recommended for Demo)

1. **Fork repository** to your GitHub

2. **Deploy Backend:**
   - Go to railway.app
   - Create new project → Deploy from GitHub
   - Select backend folder
   - Add environment variables from `.env`
   - Deploy

3. **Deploy Frontend:**
   - Create new service in same project
   - Select frontend folder
   - Add `NEXT_PUBLIC_API_URL` environment variable
   - Deploy

4. **Add Database:**
   - Add PostgreSQL plugin
   - Add Redis plugin
   - Connect to backend service

### Option 2: Docker Compose on VPS

1. **Setup VPS (Ubuntu 22.04):**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Clone and configure:**
```bash
git clone https://github.com/Aayush9808/GigArmor.git
cd GigArmor
cp .env.example .env
# Edit .env with production values
```

3. **Deploy:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

4. **Setup Nginx reverse proxy:**
```nginx
server {
    listen 80;
    server_name api.sanraksh.app;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name sanraksh.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Environment Variables (Production)

### Backend
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/sanraksh_production

# Redis
REDIS_URL=redis://host:6379

# Security
SECRET_KEY=<strong-random-key>
ENVIRONMENT=production
DEBUG=False

# APIs
OPENWEATHER_API_KEY=<your-key>
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
RAZORPAY_KEY_ID=<your-key>
RAZORPAY_KEY_SECRET=<your-secret>
SENDGRID_API_KEY=<your-key>

# URLs
CORS_ORIGINS=https://sanraksh.app
```

### Frontend
```env
NEXT_PUBLIC_API_URL=https://api.sanraksh.app
```

---

## Database Migrations

### Create new migration:
```bash
docker-compose exec backend alembic revision --autogenerate -m "migration message"
```

### Apply migrations:
```bash
docker-compose exec backend alembic upgrade head
```

### Rollback:
```bash
docker-compose exec backend alembic downgrade -1
```

---

## Monitoring & Logging

### View logs:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Health checks:
- Backend: `curl http://localhost:8000/health`
- Frontend: `curl http://localhost:3000`

---

## Backup & Recovery

### Database backup:
```bash
docker-compose exec postgres pg_dump -U sanraksh sanraksh_db > backup.sql
```

### Database restore:
```bash
docker-compose exec -T postgres psql -U sanraksh sanraksh_db < backup.sql
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong SECRET_KEY
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Configure firewall (only 80, 443 open)
- [ ] Set DEBUG=False in production
- [ ] Limit CORS origins
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database encryption at rest
- [ ] API key rotation policy

---

## Performance Optimization

1. **Database:**
   - Enable connection pooling
   - Add indexes on frequently queried columns
   - Use Redis for caching

2. **Backend:**
   - Enable Gunicorn workers: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker`
   - Use async endpoints where possible

3. **Frontend:**
   - Enable Next.js production build
   - Use CDN for static assets
   - Enable caching headers

---

## Troubleshooting

### Backend won't start:
```bash
docker-compose logs backend
# Check database connection
docker-compose exec backend python -c "from app.database import engine; print(engine)"
```

### Database migration issues:
```bash
docker-compose exec backend alembic current
docker-compose exec backend alembic history
```

### Frontend build fails:
```bash
cd frontend
npm install
npm run build
```

---

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          # Railway deployment commands
```

---

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@sanraksh.app
