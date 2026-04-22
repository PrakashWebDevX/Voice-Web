# ⚡ VoiceForge v2 — Voice to Code SaaS
### Razorpay Payments + Redis + Cluster — Production Scalable

---

## 🏗️ Architecture

```
                 ┌──────────────────────────────────┐
                 │         FRONTEND (Vercel)         │
                 │   Next.js 14 · Tailwind · Framer  │
                 └────────────────┬─────────────────┘
                                  │ HTTPS
                 ┌────────────────▼─────────────────┐
                 │        BACKEND (Railway)          │
                 │   Express Cluster · TypeScript    │
                 │   Node Cluster (multi-core)       │
                 └───┬────────┬──────────┬──────────┘
                     │        │          │
          ┌──────────▼─┐ ┌───▼───┐ ┌───▼──────┐
          │  MongoDB    │ │ Redis │ │Razorpay  │
          │  Atlas      │ │Cache  │ │Webhooks  │
          │  Pool=20    │ │+RL    │ │          │
          └─────────────┘ └───────┘ └──────────┘
                     │
          ┌──────────▼──────────┐
          │   Claude API (AI)   │
          │   Streaming SSE     │
          └─────────────────────┘
```

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/yourname/voiceforge.git
cd voiceforge

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

### 2. Backend Environment
```bash
cp .env.example .env
```

Fill in `.env`:
```env
PORT=4000
FRONTEND_URL=http://localhost:3000

ANTHROPIC_API_KEY=sk-ant-...
MONGODB_URI=mongodb+srv://user:pass@cluster/voiceforge
MONGODB_MAX_POOL_SIZE=20

REDIS_URL=redis://localhost:6379

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_PLAN_ID=plan_...         # optional (for subscriptions)
RAZORPAY_PRO_AMOUNT=99900         # 999 INR in paise
RAZORPAY_CURRENCY=INR
```

```bash
npm run dev           # single process
npm run start:cluster # multi-core (production)
```

---

### 3. Frontend Environment
```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
```

```bash
npm run dev
```

---

## 💳 Razorpay Setup (Step by Step)

### 1. Create Razorpay Account
- Go to [razorpay.com](https://razorpay.com) → Sign Up
- Complete KYC for live mode (test mode works immediately)

### 2. Get API Keys
- Dashboard → Settings → API Keys → Generate
- Copy `Key ID` (rzp_live_...) and `Key Secret`
- Key ID goes in frontend .env (`NEXT_PUBLIC_RAZORPAY_KEY_ID`)
- Both go in backend .env

### 3. Create a Subscription Plan (for recurring billing)
- Dashboard → Products → Subscriptions → Plans → Create Plan
- Set: ₹999/month, interval=monthly, period=1
- Copy Plan ID → `RAZORPAY_PLAN_ID` in backend .env
- Also put plan ID in frontend as `NEXT_PUBLIC_RAZORPAY_PLAN_ID`

### 4. Set Up Webhook
- Dashboard → Settings → Webhooks → Add Webhook URL
- URL: `https://your-backend.railway.app/api/payments/webhook`
- Select events:
  - `subscription.activated`
  - `subscription.cancelled`
  - `subscription.halted`
  - `subscription.pending`
  - `payment.captured`
  - `payment.failed`
- Copy the webhook secret → `RAZORPAY_WEBHOOK_SECRET`

### 5. Payment Flow (Two Options)

**Option A — Subscription (Hosted Page)**
- User clicks Upgrade → backend creates subscription → redirect to Razorpay hosted page
- User pays with UPI/card → webhook fires → user upgraded to Pro
- *Best for recurring billing*

**Option B — One-time Order (Checkout Modal)**
- Leave `NEXT_PUBLIC_RAZORPAY_PLAN_ID` empty
- User clicks Upgrade → Razorpay modal opens in-app
- User pays → frontend calls `/payments/verify` → user upgraded
- *Best for one-time payments or if you want in-app experience*

---

## ⚡ Scalability Features

| Feature | Implementation |
|---------|---------------|
| Multi-core | Node.js cluster (1 worker/CPU) |
| Distributed rate limiting | Redis + rate-limit-redis |
| DB connection pooling | MongoDB maxPoolSize=20 |
| Response caching | Redis with TTL |
| Cache invalidation | Pattern-based Redis DEL |
| Structured logging | Winston + daily log rotation |
| Graceful shutdown | SIGTERM handler, 10s drain |
| Health checks | `/health` + `/ready` endpoints |
| Error handling | express-async-errors global handler |
| Compression | gzip level 6, 1KB threshold |

### Scaling for High Traffic

**Vertical (single server):**
```bash
# Use cluster mode — uses all CPU cores
npm run start:cluster
# Or set WEB_CONCURRENCY=8 for 8 workers
WEB_CONCURRENCY=8 node dist/cluster.js
```

**Horizontal (multiple servers):**
- Deploy multiple Railway/Render instances
- Redis handles shared rate limiting across all instances
- MongoDB Atlas handles shared data
- Use a load balancer (Railway/Render does this automatically)

**Performance tips:**
- Upstash Redis for serverless Redis (free tier available)
- MongoDB Atlas M10+ for production workloads
- Enable Railway autoscaling or Render auto-deploy

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
# Set all NEXT_PUBLIC_* env vars in Vercel dashboard
```

### Backend → Railway
1. New Project → Deploy from GitHub → select `/backend` root
2. Add all env vars from `.env`
3. Start command: `npm run start:cluster`
4. Railway auto-scales horizontally

### Redis → Upstash (Free)
1. upstash.com → Create Redis database
2. Copy `REDIS_URL` (starts with `rediss://`) → Railway env

### MongoDB → Atlas
1. cloud.mongodb.com → Free M0 cluster
2. Network: Allow all IPs (`0.0.0.0/0`)
3. Copy URI → `MONGODB_URI` in Railway

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/generate/stream` | ✅ | SSE streaming generation |
| POST | `/api/generate/explain` | ✅ | Explain code with AI |
| POST | `/api/generate/download` | ✅ | Download as ZIP |
| GET | `/api/history` | ✅ | Paginated history |
| GET | `/api/history/:id` | ✅ | Single generation |
| DELETE | `/api/history/:id` | ✅ | Delete generation |
| PATCH | `/api/history/:id/favorite` | ✅ | Toggle favorite |
| POST | `/api/auth/sync` | ✅ | Sync Firebase user |
| GET | `/api/auth/me` | ✅ | Get current user |
| POST | `/api/payments/subscribe` | ✅ | Create Razorpay subscription |
| POST | `/api/payments/order` | ✅ | Create Razorpay order |
| POST | `/api/payments/verify` | ✅ | Verify payment signature |
| POST | `/api/payments/cancel` | ✅ | Cancel subscription |
| GET | `/api/payments/status` | ✅ | Get plan status |
| POST | `/api/payments/webhook` | ❌ | Razorpay webhook (signed) |
| GET | `/health` | ❌ | Health check + PID |
| GET | `/ready` | ❌ | Readiness check (Redis ping) |

---

## 🔐 Security

- Firebase Admin token verification on every protected route
- Razorpay signature verification (HMAC SHA-256) on payment + webhook
- Helmet.js HTTP security headers
- Redis-backed distributed rate limiting (shared across cluster workers)
- Zod input validation
- Raw body preserved for webhook integrity check
- No secrets in frontend code (only public Key ID)
