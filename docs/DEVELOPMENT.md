# Local Development (without Docker)

The main `README.md` covers the Docker path, which is the easiest way to run this project.
Use this guide instead if you want to run the backend/frontend directly on your machine.

## 1) Create the database and a dedicated role

```bash
sudo -u postgres psql \
  -c "CREATE USER manor_crm WITH PASSWORD 'manor_crm_dev_pw';" \
  -c "CREATE DATABASE manor_crm OWNER manor_crm;" \
  -c "GRANT ALL PRIVILEGES ON DATABASE manor_crm TO manor_crm;"
```

## 2) Start the backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Backend URL: `http://localhost:5000`

## 3) Start the frontend

Open a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## 4) Import demo data (optional)

```bash
PGPASSWORD=manor_crm_dev_pw psql -h localhost -U manor_crm -d manor_crm -f database/manor_crm_seed.sql
```

See the root README for the seeded demo accounts.

## Alternative: Dockerized PostgreSQL only (no local Postgres install)

If you don't want to install PostgreSQL locally but still want to run the backend/frontend
directly (not the full Docker stack), this brings up just a database + its own pgAdmin
(`http://localhost:8081`, on host port `5433` to avoid clashing with a local install):

```bash
docker compose up -d
```

Point `backend/.env`'s `DATABASE_URL` at
`postgresql://postgres:postgres@localhost:5433/manor_crm?schema=public` and continue from step 2
above.

## Running backend tests

```bash
cd backend
npm test
```

## RBAC permission matrix

Roles: `ADMIN`, `MANAGER`, `MARKETING`, `RECEPTION`. There is no public self-registration - staff
accounts are created only by an `ADMIN` from the in-app "Staff" page (or `POST /users`).

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

## Endpoints and other docs

- Full endpoint reference: `docs/API.md`
- System architecture, database ERD, and RBAC flow: `docs/SYSTEM_DOCUMENTATION.md`
- File/folder layout: `docs/PROJECT_STRUCTURE.md`
