# API Endpoints

Base URL: `http://localhost:5000`

Every endpoint below except `GET /health` and `POST /auth/login` requires an
`Authorization: Bearer <token>` header, where `<token>` comes from `POST /auth/login`.
There is no public registration endpoint — staff accounts are created only by an `ADMIN`
via `POST /users`. See the RBAC table in the root `README.md` for the full per-role
permission matrix.

## Health
- `GET /health` — public

## Authentication
- `POST /auth/login` — public. Returns `{ token, user }`.

## Staff / users (ADMIN only)
- `GET /users`
- `POST /users` — create a staff account with a chosen role
- `PATCH /users/:id` — update `fullName`, `role`, or `isActive`

## Customers
- `GET /customers` — any authenticated staff
- `GET /customers/:id` — any authenticated staff (includes reservations, complaints, interactions, loyalty history)
- `POST /customers` — RECEPTION, MANAGER, ADMIN
- `PATCH /customers/:id` — RECEPTION, MANAGER, ADMIN
- `DELETE /customers/:id` — MANAGER, ADMIN

## Rooms
- `GET /rooms` — RECEPTION, MANAGER, ADMIN
- `POST /rooms` — MANAGER, ADMIN
- `PATCH /rooms/:id` — RECEPTION, MANAGER, ADMIN (status/rate updates)
- `DELETE /rooms/:id` — MANAGER, ADMIN
- `POST /rooms/quick-seed` — MANAGER, ADMIN (seeds 20 starter rooms if none exist)

## Reservations
- `GET /reservations` — RECEPTION, MANAGER, ADMIN
- `POST /reservations` — RECEPTION, MANAGER, ADMIN
- `PATCH /reservations/:id/status` — RECEPTION, MANAGER, ADMIN

## Invoices & payments
- `GET /invoices` — RECEPTION, MANAGER, ADMIN
- `POST /invoices` — generate an invoice from a reservation (`{ reservationId }`)
- `POST /invoices/:id/payments` — record a payment (`{ method, amount, reference? }`);
  invoice status auto-transitions `UNPAID` → `PARTIALLY_PAID` → `PAID`

## Complaints
- `GET /complaints` — RECEPTION, MANAGER, ADMIN
- `POST /complaints` — RECEPTION, MANAGER, ADMIN
- `PATCH /complaints/:id` — update `status`, `resolutionNote`, `assignedToId`
  (RECEPTION, MANAGER, ADMIN); resolving/closing auto-stamps `resolvedAt`

## Interactions
- `GET /interactions` — any authenticated staff (optional `?customerId=` filter)
- `POST /interactions` — any authenticated staff

## Campaigns
- `GET /campaigns` — MARKETING, MANAGER, ADMIN
- `POST /campaigns` — MARKETING, MANAGER, ADMIN
- `PATCH /campaigns/:id/status` — MARKETING, MANAGER, ADMIN

## Loyalty
- `GET /loyalty/transactions` — MARKETING, MANAGER, ADMIN (optional `?customerId=` filter)
- `POST /loyalty/transactions` — MARKETING, MANAGER, ADMIN

## Dashboard
- `GET /dashboard/kpis` — any authenticated staff
