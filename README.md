# The Manor Hotel CRM (Free Stack)

<img src="frontend/public/brand/logo-wordmark-light.jpg" alt="The Manor Hotel" width="360" />

A hotel CRM: guest profiles, room and reservation management, billing, complaint tracking,
marketing campaigns, and a loyalty program, behind JWT-authenticated, role-based access control.
Built entirely with free, open-source tools (Node.js, PostgreSQL, Prisma, React, Docker).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose installed. That's it.

## 1) Run the whole app

One command builds and starts everything: PostgreSQL, backend API, frontend, and a pgAdmin GUI.
Migrations and demo data are applied automatically the first time it boots.

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Give it a minute the first time (it's building the images). Then open:

- **App**: [http://localhost:8080](http://localhost:8080)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **pgAdmin (database GUI)**: [http://localhost:8081](http://localhost:8081)

## 2) Log into the app

Go to [http://localhost:8080](http://localhost:8080) and sign in with any of these (all use the
same password):

| Email | Password | Role |
| --- | --- | --- |
| `admin@manorhotel.com` | `Password123!` | ADMIN |
| `manager@manorhotel.com` | `Password123!` | MANAGER |
| `reception@manorhotel.com` | `Password123!` | RECEPTION |
| `marketing@manorhotel.com` | `Password123!` | MARKETING |

Each role sees a different set of pages in the sidebar (that's the RBAC part). Sign in as
`ADMIN` to see everything, including the **Staff** page where new accounts are created - there's
no public sign-up.

## 3) Browse the database in pgAdmin

Go to [http://localhost:8081](http://localhost:8081):

1. **Log in** to pgAdmin itself: email `lecturer@manorhotel.com`, password `manor_crm_dev_pw`.
2. In the left sidebar, click **Servers** to expand it - "Manor Hotel CRM (Docker)" is already
   there, pre-configured.
3. Click it, and when prompted for a password, enter `postgres` (this is the database's own
   password, separate from your pgAdmin login - you only need to type it once).
4. Expand **Databases → manor_crm → Schemas → public → Tables** to see every table
   (`Customer`, `Reservation`, `Invoice`, `Payment`, `User`, and more).
5. Right-click any table → **View/Edit Data → All Rows** to see the live data.

## 4) Stop it

```bash
docker compose -f docker-compose.prod.yml down
```

Add `-v` to that command instead if you also want to wipe the database and start fresh next time.

## If something doesn't come up

If you already have PostgreSQL running locally on your machine outside Docker, it also uses port
`5432` and will conflict with this stack's database container. Stop your local Postgres service
first (`sudo systemctl stop postgresql` on Linux), then run step 1 again.

## More documentation

- **How the system works** (stack, architecture, database diagram, RBAC flow): `docs/SYSTEM_DOCUMENTATION.md`
- **Full API reference**: `docs/API.md`
- **Running it without Docker**: `docs/DEVELOPMENT.md`
- **Postman collection**: `postman/manor-hotel-crm.postman_collection.json`
