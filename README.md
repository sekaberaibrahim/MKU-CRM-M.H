# The Manor Hotel CRM (Free Stack)



- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM

## Project folders

- `backend/` Express API + Prisma schema
- `frontend/` React UI
- `database/` SQL seed files for import
- `docs/` API, architecture, and defense-report documentation
- `postman/` ready API collection
- `scripts/` one-command setup scripts

## Quick setup (recommended)

Windows PowerShell:

```bash
./scripts/setup.ps1
```

Linux/macOS:

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

## Production-style Docker run

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Services:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432`

Stop:

```bash
docker compose -f docker-compose.prod.yml down
```

## Manual setup

### 1) Start PostgreSQL

```bash
docker compose up -d
```

## 2) Start backend

```bash
cd backend
copy .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Backend URL: `http://localhost:5000`

## 3) Start frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Import demo data

After migration, import sample data:

```bash
psql -h localhost -U postgres -d manor_crm -f database/manor_crm_seed.sql
```

Default test users in seed file:

- `admin@manorhotel.com`
- `reception@manorhotel.com`
- `marketing@manorhotel.com`
- Password hash corresponds to password: `Password123!`

## Included endpoints

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /customers`
- `POST /customers`
- `GET /rooms`
- `POST /rooms/quick-seed`
- `GET /reservations`
- `POST /reservations`
- `PATCH /reservations/:id/status`
- `GET /complaints`
- `POST /complaints`
- `GET /campaigns`
- `POST /campaigns`
- `POST /loyalty/transactions`
- `GET /dashboard/kpis`

## Core modules covered

- Customers and profiles
- Rooms and reservations
- Invoices and payments
- Complaints and service recovery
- Campaigns and recipients
- Loyalty points and transactions
- KPI dashboard API

## GitHub shipping checklist

- Ensure `.env` files are not committed (already in `.gitignore`)
- Commit this folder structure as-is
- Push repository to GitHub
- Add screenshots in a new `docs/screenshots/` folder when ready
- CI runs automatically from `.github/workflows/ci.yml`

## Final defense support files

- Architecture document and diagram: `docs/ARCHITECTURE.md`
- Report writing template for PDF: `docs/FINAL_DEFENSE_REPORT_TEMPLATE.md`
- Screenshot placeholders guide: `docs/screenshots/README.md`
