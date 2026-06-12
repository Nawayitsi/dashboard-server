# 🏠 HomelabOS Infrastructure Management Platform

HomelabOS is a production-ready, modular monitoring and control center designed for self-hosted infrastructure. It features a React-based glassmorphic dashboard, Express REST API, and a plugin connector architecture for centralizing Synology NAS, MikroTik routers, Nextcloud, LibreNMS, SafeLine WAF, and SIEM event streams.

---

## 🛠️ Tech Stack

### Frontend
- **React 19 & Vite** (with TypeScript)
- **Tailwind CSS v4** (CSS-first engine)
- **Framer Motion** (smooth micro-animations)
- **Zustand** (lightweight state management)
- **TanStack Query v5** (caching and remote sync)
- **Socket.IO-client** (real-time telemetry)
- **Recharts** (responsive performance graphs)

### Backend
- **Node.js & Express** (with TypeScript)
- **Prisma ORM** (MySQL database adapter)
- **Socket.IO** (Websocket event engine)
- **Redis 7** (caching, rate limiting)
- **Winston & Morgan** (structured JSON logging)

### Infrastructure
- **Docker & Docker Compose** (multi-container orchestration)
- **MySQL 8.0** (relational storage pool)

---

## 📦 Directory Structure

```text
├── backend/
│   ├── prisma/             # Schema definitions and database migrations/seeds
│   ├── src/
│   │   ├── config/         # Connection pools (Database, Redis, CORS)
│   │   ├── middleware/     # Rate limiter, RBAC guards, global error handler
│   │   ├── integrations/   # MikroTik, Synology, Nextcloud plugins
│   │   ├── modules/        # API route handlers (Auth, Alerts, Metrics, Logs)
│   │   ├── socket/         # Real-time WebSocket namespaces
│   │   └── jobs/           # Polling and scanning background schedulers
├── frontend/
│   ├── src/
│   │   ├── components/     # UI glassmorphic components, Recharts widgets
│   │   ├── store/          # Zustand global authorization states
│   │   ├── services/       # Axios and queryClient API wrappers
│   │   └── pages/          # Dashboard, Apps, Security, Logs view panels
└── docker-compose.yml      # Production stack orchestration
```

---

## 🚀 Quick Start (Local Docker Deployment)

### 1. Environment Configurations
Clone the sample template to activate settings:
```bash
cp .env.example .env
```
Update configuration keys (JWT keys, service URL paths, API tokens) in `.env`.

### 2. Startup Stack
Build and spin up database, Redis cache, frontend, and backend containers:
```bash
docker-compose up -d --build
```

### 3. Initialize Databases
Generate client structures and seed initial datasets:
```bash
# Enter backend container context
docker-compose exec backend npx prisma migrate dev --name init
docker-compose exec backend npx prisma db seed
```

### 4. Admin Portals
- **Frontend Panel**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)

**Demo Credentials:**
- **Email**: `admin@homelabos.local`
- **Password**: `admin123`
