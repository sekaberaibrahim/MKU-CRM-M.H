# The Manor Hotel CRM (Free Stack)

A full-stack hotel CRM built as a final-year Business Information Technology project: guest
profiles, room and reservation management, billing, complaint tracking, marketing campaigns,
and a loyalty program, all behind JWT-authenticated, role-based access.

- Frontend: React + TypeScript + Vite (multi-page app: dashboard, customers, rooms,
  reservations, complaints, campaigns, loyalty), styled as a hotel/hospitality product
- Backend: Node.js + Express + TypeScript, JWT auth with role-based route guards
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

Default test users in seed file (all use password `Password123!`):

- `admin@manorhotel.com` — ADMIN
- `reception@manorhotel.com` — RECEPTION
- `marketing@manorhotel.com` — MARKETING

You can also create additional staff accounts from the "Create account" tab on the login screen.

## Frontend pages

- **Login / Create account** — JWT sign-in and staff registration
- **Dashboard** — live KPIs (customers, reservations, open complaints, revenue collected)
- **Customers** — guest directory with loyalty tier and points
- **Rooms** — inventory, rates, status, and a one-click starter seed
- **Reservations** — booking form and status updates (confirmed → checked-in → checked-out)
- **Complaints** — service recovery log with severity levels
- **Campaigns** — marketing outreach by segment/channel (ADMIN, MANAGER, MARKETING only)
- **Loyalty** — award or redeem guest loyalty points

## Included endpoints

All routes below except `/health`, `/auth/register`, and `/auth/login` require an
`Authorization: Bearer <token>` header obtained from `/auth/login`. `POST /campaigns` is further
restricted to the `ADMIN`, `MANAGER`, and `MARKETING` roles. In the included Postman collection,
run the **Login** request first — it stores the token in a collection variable automatically used
by every other request.

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
