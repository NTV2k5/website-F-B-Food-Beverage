# Website F&B — Food & Beverage Shop

Website đặt hàng nước uống & đồ ăn vặt với giao diện hiện đại.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, Tailwind CSS, shadcn/ui, Zustand, TanStack Query |
| Backend | NestJS, Prisma, PostgreSQL, Redis, Socket.io |
| Payment | SePay (VietQR + Webhook) |

## Project Structure

```
├── web/              # Next.js 16 — Customer frontend
├── backend/          # NestJS API
├── docker-compose.yml
└── README.md
```

## Getting Started

### 1. Start databases

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

API runs at `http://localhost:4000/api/v1`

### 3. Frontend

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

Web runs at `http://localhost:3000`

## Git Workflow

```
main          ← Production
develop       ← Integration
feature/*     ← Feature branches
```

## Sprint Roadmap

- [x] Sprint 1: Database + Menu API + Frontend scaffold
- [ ] Sprint 2: Menu UI + Cart (Zustand)
- [ ] Sprint 3: Auth + Checkout
- [ ] Sprint 4: SePay + Webhook + Real-time
