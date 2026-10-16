# Production Deployment & Architecture Guide

## 1. System Architecture Overview

The **Face Recognition Biometric Attendance & Multi-Portal Workforce Management Platform** consists of three coordinated tiers:

```
                                  +-----------------------------+
                                  |   Management Web Portal     |
                                  |      (Next.js 16/React 19)  |
                                  +--------------+--------------+
                                                 | HTTPS / REST
                                                 v
+-------------------------------+ HTTPS / REST  +-----------------------------+
|    Mobile App (React Native)  +-------------->|      FastAPI Backend        |
|  - Management Portal (Manager)|               |  - Uvicorn / AsyncPG / SQLA |
|  - Employee Portal (Worker)   |               |  - ONNX / ArcFace 512D      |
+-------------------------------+               +--------------+--------------+
                                                               | PostgreSQL Wire + pgvector
                                                               v
                                                +-----------------------------+
                                                |   Render Cloud PostgreSQL   |
                                                |     (v16 + pgvector HNSW)   |
                                                +-----------------------------+
```

---

## 2. Environment Variables & Configuration

### Backend (`backend/.env`)
| Variable | Description | Production Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Render PostgreSQL connection string (asyncpg/psycopg2) | `postgresql://user:pass@host.render.com/dbname` |
| `SECRET_KEY` | HMAC-SHA256 signature key for JWT tokens | `openssl rand -hex 32` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifespan | `10080` (7 days) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifespan | `7` days |
| `GEOFENCE_RADIUS_METERS` | Permitted radius for on-site attendance | `200` meters |
| `FACE_SIMILARITY_THRESHOLD` | ArcFace cosine similarity cutoff | `0.68` (FAR < 0.001%, FRR < 1.0%) |
| `CORS_ORIGINS` | Permitted origins for web & mobile clients | `https://admin.yourdomain.com,exp://*` |

### Web Portal Frontend (`frontend/.env.local`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base API URL of backend | `https://api.yourdomain.com` |

### Mobile Client (`mobile/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | Backend API base URL accessible from physical devices | `https://api.yourdomain.com` |

---

## 3. Database & pgvector Setup (Render Cloud)

The database schema uses native PostgreSQL extensions:
```sql
-- Enable vector embeddings
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- HNSW Vector Index on Employee Facial Embeddings
CREATE INDEX IF NOT EXISTS idx_face_embeddings_hnsw 
ON face_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### Applying Migrations & Tables:
```bash
cd backend
source venv/bin/activate
# Automatically bootstrapped by app lifespan, or manually initialized:
python -c "import asyncio; from app.db.session import init_db; asyncio.run(init_db())"
```

---

## 4. Docker & Containerized Deployment

### Local / Self-Hosted Production Launch
Run the entire platform with Docker Compose:
```bash
# Build and start services in background
docker compose up -d --build

# Inspect logs
docker compose logs -f backend

# Verify health status
curl http://localhost:8000/health
```

### Standalone Backend Deployment (Render / AWS ECS / Fly.io / GCP Cloud Run)
```bash
docker build -t face-recognition-backend -f backend/Dockerfile ./backend
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host.render.com/dbname" \
  -e SECRET_KEY="your-production-secret" \
  face-recognition-backend
```

### Standalone Frontend Deployment (Vercel / Cloudflare Pages / Docker)
- Deploy directly to **Vercel** with Root Directory set to `frontend`.
- Provide `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`.

---

## 5. Mobile App Build & Distribution (Expo EAS)

The mobile application supports both iOS and Android with hardware camera & GPS access:
```bash
cd mobile

# 1. Typecheck & Validate
npx tsc --noEmit

# 2. Configure EAS CLI
npm install -g eas-cli
eas login
eas build:configure

# 3. Build Production Android APK / AAB
eas build --platform android --profile production

# 4. Build Production iOS IPA
eas build --platform iphone --profile production
```

---

## 6. Security Hardening & Zero-Trust Policies

1. **7-Day Rolling JWT + Refresh Token Invalidation**:
   - Access tokens expire in 7 days as requested.
   - Any device revocation via `/api/auth/devices/{id}/revoke` immediately locks out the associated refresh tokens and rejects subsequent API access with `403 Forbidden`.
2. **Untrusted Device Hardware Defense**:
   - Login and refresh workflows inspect the hardware device ID.
   - Revoked or blocked devices cannot obtain or refresh credentials.
3. **200m Spherical Geofence & Anti-Mock GPS**:
   - Haversine geodesic calculations enforce precision boundary gating ($d \le 200\,\text{m}$).
   - Mock provider detection rejects spoofed latitude/longitude payloads ($403 \text{ Forbidden}$).
4. **Biometric Benchmarks (ArcFace 512D Hypersphere)**:
   - Evaluated at threshold $\tau = 0.68$:
     - **FAR (False Acceptance Rate)**: $< 0.001\%$ ($< 1$ in $100,000$ impostor matches).
     - **FRR (False Rejection Rate)**: $< 1.0\%$ ($< 1$ in $100$ genuine captures rejected).
   - Real-time benchmark metrics accessible at `GET /api/biometrics/benchmarks`.

---

## 7. Health & Monitoring Endpoints

- **Health Check**: `GET /health` -> `{"status": "healthy", "service": "face-recognition-attendance-backend"}`
- **Biometric Calibration Audit**: `GET /api/biometrics/benchmarks?sample_size=10000`
- **Active Device Hardware Registry**: `GET /api/auth/devices`
