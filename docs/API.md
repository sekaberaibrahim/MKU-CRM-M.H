# API Endpoints

Base URL: `http://localhost:5000`

Every endpoint below except `/health`, `/auth/register`, and `/auth/login` requires an
`Authorization: Bearer <token>` header, where `<token>` comes from `POST /auth/login`.
`POST /campaigns` additionally requires the caller's role to be `ADMIN`, `MANAGER`, or
`MARKETING`.

## Health
- `GET /health`

## Authentication
- `POST /auth/register`
- `POST /auth/login`

## Customers
- `GET /customers`
- `POST /customers`

## Rooms
- `GET /rooms`
- `POST /rooms/quick-seed`

## Reservations
- `GET /reservations`
- `POST /reservations`
- `PATCH /reservations/:id/status`

## Complaints
- `GET /complaints`
- `POST /complaints`

## Campaigns
- `GET /campaigns`
- `POST /campaigns`

## Loyalty
- `POST /loyalty/transactions`

## Dashboard
- `GET /dashboard/kpis`
