# The Manor Hotel CRM (Free Stack)

A full-stack hotel CRM built as a final-year Business Information Technology project: guest
profiles, room and reservation management, billing/invoicing, complaint tracking, marketing
campaigns, and a loyalty program, all behind JWT-authenticated, role-based access control (RBAC).

- Frontend: React + TypeScript + Vite (dashboard, customers, rooms, reservations, billing,
  complaints, campaigns, loyalty, staff administration), styled as a hotel/hospitality product
- Backend: Node.js + Express + TypeScript, modular routes/middleware, JWT auth with
  role-based route guards, helmet + rate limiting
- Database: PostgreSQL + Prisma ORM

Every tool in this stack is free and open-source (Node.js, PostgreSQL, Prisma, React, Express).

## Project folders

- `backend/` Express API + Prisma schema (`src/routes`, `src/middleware`, `src/lib`)
- `frontend/` React UI
- `database/` SQL seed files for import
- `docs/` API, architecture, and defense-report documentation
- `postman/` ready API collection
- `scripts/` one-command setup scripts

## Role-based access control (RBAC)

Roles: `ADMIN`, `MANAGER`, `MARKETING`, `RECEPTION`.

There is **no public self-registration**. Staff accounts are created only by an `ADMIN` from the
in-app "Staff" page (or `POST /users`), which prevents anyone from granting themselves an
elevated role — a gap in earlier versions of this project where the public sign-up form let a
visitor pick their own role, including `ADMIN`.

| Area | Read | Write |
| --- | --- | --- |
| Customers | any authenticated staff | RECEPTION, MANAGER, ADMIN (delete: MANAGER, ADMIN) |
| Rooms | RECEPTION, MANAGER, ADMIN | MANAGER, ADMIN (status updates: also RECEPTION) |
| Reservations | RECEPTION, MANAGER, ADMIN | RECEPTION, MANAGER, ADMIN |
| Invoices & payments | RECEPTION, MANAGER, ADMIN | RECEPTION, MANAGER, ADMIN |
| Complaints | RECEPTION, MANAGER, ADMIN | RECEPTION, MANAGER, ADMIN |
| Interactions | any authenticated staff | any authenticated staff |
| Campaigns & loyalty | MARKETING, MANAGER, ADMIN | MARKETING, MANAGER, ADMIN |
| Staff accounts | ADMIN | ADMIN |

Deactivating a staff account (`isActive = false`) takes effect immediately — the auth middleware
re-checks account status on every request, not just at login/token-issue time.

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

## Manual setup — local PostgreSQL (recommended on Linux)

### 1) Create the database and a dedicated role

```bash
sudo -u postgres psql \
  -c "CREATE USER manor_crm WITH PASSWORD 'manor_crm_dev_pw';" \
  -c "CREATE DATABASE manor_crm OWNER manor_crm;" \
  -c "GRANT ALL PRIVILEGES ON DATABASE manor_crm TO manor_crm;"
```

### 2) Start the backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Backend URL: `http://localhost:5000`

### 3) Start the frontend

Open a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

### 4) Import demo data (optional)

```bash
PGPASSWORD=manor_crm_dev_pw psql -h localhost -U manor_crm -d manor_crm -f database/manor_crm_seed.sql
```

Default test users in the seed file (all use password `Password123!`):

- `admin@manorhotel.com` — ADMIN
- `manager@manorhotel.com` — MANAGER
- `reception@manorhotel.com` — RECEPTION
- `marketing@manorhotel.com` — MARKETING

Sign in as `ADMIN` and use the **Staff** page to create any further accounts.

## Alternative: Dockerized PostgreSQL

If you'd rather not touch your host PostgreSQL install, use the bundled container instead of
steps 1 above (update `backend/.env`'s `DATABASE_URL` to `postgresql://postgres:postgres@localhost:5432/manor_crm?schema=public`):

```bash
docker compose up -d
```

## Production-style Docker run (all services containerized)

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

## Running backend tests

```bash
cd backend
npm test
```

## Frontend pages

- **Login** — JWT sign-in (no public sign-up; accounts are admin-provisioned)
- **Dashboard** — live KPIs (customers, reservations, open complaints, revenue collected)
- **Customers** — guest directory with loyalty tier and points
- **Rooms** — inventory, rates, status, and a one-click starter seed
- **Reservations** — booking form and status updates (confirmed → checked-in → checked-out)
- **Billing** — generate invoices from reservations and record payments
- **Complaints** — service recovery log with severity and status tracking
- **Campaigns** — marketing outreach by segment/channel (MARKETING, MANAGER, ADMIN)
- **Loyalty** — award or redeem guest loyalty points
- **Staff** — create/deactivate staff accounts and change roles (ADMIN only)

## Included endpoints

Every route except `/health` and `POST /auth/login` requires an `Authorization: Bearer <token>`
header obtained from `/auth/login`. Individual routes are further restricted by role — see the
RBAC table above. In the included Postman collection, run the **Login** request first — it stores
the token in a collection variable used automatically by every other request.

- `GET /health`
- `POST /auth/login`
- `GET/POST /users`, `PATCH /users/:id` (ADMIN)
- `GET/POST/PATCH/DELETE /customers`, `/customers/:id`
- `GET/POST/PATCH/DELETE /rooms`, `/rooms/:id`, `POST /rooms/quick-seed`
- `GET/POST /reservations`, `PATCH /reservations/:id/status`
- `GET/POST /invoices`, `POST /invoices/:id/payments`
- `GET/POST/PATCH /complaints`, `/complaints/:id`
- `GET/POST /interactions`
- `GET/POST /campaigns`, `PATCH /campaigns/:id/status`
- `GET/POST /loyalty/transactions`
- `GET /dashboard/kpis`

## Core modules covered

- Customers and profiles
- Rooms and reservations
- Invoices and payments
- Complaints and service recovery
- Guest interactions log
- Campaigns and recipients
- Loyalty points and transactions
- Staff/user administration (RBAC)
- KPI dashboard API

## GitHub shipping checklist

- Ensure `.env` files are not committed (already in `.gitignore`)
- Commit this folder structure as-is
- Push repository to GitHub
- Add screenshots in a new `docs/screenshots/` folder when ready
- CI runs automatically from `.github/workflows/ci.yml` (build + backend tests)

## Final defense support files

- Architecture document and diagram: `docs/ARCHITECTURE.md`
- Report writing template for PDF: `docs/FINAL_DEFENSE_REPORT_TEMPLATE.md`
- Screenshot placeholders guide: `docs/screenshots/README.md`
