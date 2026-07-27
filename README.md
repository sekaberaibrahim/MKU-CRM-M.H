# The Manor Hotel CRM (Free Stack)

<img src="frontend/public/brand/logo-wordmark-light.jpg" alt="The Manor Hotel" width="360" />

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
elevated role - a gap in earlier versions of this project where the public sign-up form let a
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

Deactivating a staff account (`isActive = false`) takes effect immediately - the auth middleware
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

## Manual setup - local PostgreSQL (recommended on Linux)

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

- `admin@manorhotel.com` - ADMIN
- `manager@manorhotel.com` - MANAGER
- `reception@manorhotel.com` - RECEPTION
- `marketing@manorhotel.com` - MARKETING

Sign in as `ADMIN` and use the **Staff** page to create any further accounts.

## Fully Dockerized setup (recommended for demos / showing the database to your lecturer)

One command builds and runs the entire stack - PostgreSQL, backend, frontend, and a pgAdmin
GUI - with migrations and demo data applied automatically on first boot:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

> If your host's local PostgreSQL service is already running (see the manual setup above), it
> also listens on port 5432 and will conflict with the `db` container. Either stop it first
> (`sudo systemctl stop postgresql`) or this Docker stack, whichever you're not using right now.

Services once it's up:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000`
- PostgreSQL: `localhost:5432` (user `postgres`, password `postgres`, db `manor_crm`)
- **pgAdmin (database GUI): `http://localhost:8081`**

### Viewing the database tables in pgAdmin

This is the easiest way to show the actual database - tables, columns, rows - to a lecturer or
during a defense, without needing the `psql` CLI:

1. Open `http://localhost:8081`.
2. Log in with email `lecturer@manorhotel.com`, password `manor_crm_dev_pw` (set in
   `docker-compose.prod.yml`; change it there before a public demo if you want).
3. In the left tree, expand **Servers** - "Manor Hotel CRM (Docker)" is already registered.
4. Click it and enter the PostgreSQL password `postgres` when prompted (this one-time click is a
   pgAdmin security requirement; it isn't pre-filled on purpose).
5. Expand **Databases → manor_crm → Schemas → public → Tables** to see every table
   (`Customer`, `Reservation`, `Invoice`, `Payment`, `User`, etc.) - right-click any table →
   **View/Edit Data → All Rows** to show live rows.

Stop everything (add `-v` to also wipe the database volume for a clean slate):

```bash
docker compose -f docker-compose.prod.yml down
```

## Alternative: Dockerized PostgreSQL only (no local install)

If you'd rather not touch your host PostgreSQL install but don't want the full stack above,
this brings up just a database + its own pgAdmin (`http://localhost:8081`, same pre-registered
server, on host port `5433` to avoid clashing with a local install):

```bash
docker compose up -d
```

Point `backend/.env`'s `DATABASE_URL` at `postgresql://postgres:postgres@localhost:5433/manor_crm?schema=public`
and continue from step 2 of the manual setup above.

## Deploy to Vercel (free)

Vercel doesn't run a long-lived Express server or host a database directly, so this app deploys
as **two separate Vercel projects** (frontend + backend), plus a free external Postgres. Every
piece of this is free.

### 1) Create a free Postgres database (Neon)

1. Sign up at [neon.tech](https://neon.tech) (free tier, no credit card).
2. Create a project and database named `manor_crm`.
3. From the Neon dashboard, copy **two** connection strings:
   - The **pooled** connection string (has `-pooler` in the hostname) → this is `DATABASE_URL`.
   - The **direct** connection string (no `-pooler`) → this is `DIRECT_URL`.

### 2) Run migrations and seed against Neon (from your machine)

```bash
cd backend
DATABASE_URL="<neon direct connection string>" npx prisma migrate deploy
PGPASSWORD="<neon password>" psql "<neon direct connection string>" -f ../database/manor_crm_seed.sql
```

### 3) Deploy the backend

1. Push this repo to GitHub (already done if you're reading this from GitHub).
2. On [vercel.com](https://vercel.com), sign up free (GitHub login is fastest) and **Add New
   Project** → import this repo.
3. Set **Root Directory** to `backend`.
4. Add environment variables: `DATABASE_URL` (pooled), `DIRECT_URL` (direct), `JWT_SECRET`
   (generate a real random value, e.g. `openssl rand -base64 32`), `CORS_ORIGIN` (leave as a
   placeholder for now, e.g. `http://localhost:5173` - you'll update it in step 5).
5. Deploy. Note the resulting URL, e.g. `https://manor-crm-backend.vercel.app`.

### 4) Deploy the frontend

1. **Add New Project** again, same repo, **Root Directory** set to `frontend`.
2. Add environment variable `VITE_API_BASE_URL` = the backend URL from step 3 (no trailing
   slash).
3. Deploy. Note the resulting URL, e.g. `https://manor-crm.vercel.app`.

### 5) Point the backend's CORS at the real frontend URL

Go back to the **backend** Vercel project → Settings → Environment Variables → update
`CORS_ORIGIN` to the frontend URL from step 4, then redeploy the backend (Deployments → \[...\] →
Redeploy) so the new value takes effect.

Sign in with the seeded accounts (password `Password123!`) once both are live.

## Running backend tests

```bash
cd backend
npm test
```

## Frontend pages

- **Login** - JWT sign-in (no public sign-up; accounts are admin-provisioned)
- **Dashboard** - live KPIs (customers, reservations, open complaints, revenue collected)
- **Customers** - guest directory with loyalty tier and points
- **Rooms** - inventory, rates, status, and a one-click starter seed
- **Reservations** - booking form and status updates (confirmed → checked-in → checked-out)
- **Billing** - generate invoices from reservations and record payments
- **Complaints** - service recovery log with severity and status tracking
- **Campaigns** - marketing outreach by segment/channel (MARKETING, MANAGER, ADMIN)
- **Loyalty** - award or redeem guest loyalty points
- **Staff** - create/deactivate staff accounts and change roles (ADMIN only)

## Included endpoints

Every route except `/health` and `POST /auth/login` requires an `Authorization: Bearer <token>`
header obtained from `/auth/login`. Individual routes are further restricted by role - see the
RBAC table above. In the included Postman collection, run the **Login** request first - it stores
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

- **Full system documentation (stack, architecture, database ERD, auth/RBAC flow, worked
  examples, Docker deployment flow): `docs/SYSTEM_DOCUMENTATION.md`** - start here
- Architecture document and diagram: `docs/ARCHITECTURE.md`
- Report writing template for PDF: `docs/FINAL_DEFENSE_REPORT_TEMPLATE.md`
- Screenshot placeholders guide: `docs/screenshots/README.md`
