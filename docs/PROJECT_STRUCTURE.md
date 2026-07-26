# Project Structure

```text
MKU-CRM-M.H/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── app.ts                # Express app assembly (middleware + route mounting)
│   │   ├── server.ts             # process entrypoint (listen)
│   │   ├── rbac.ts               # shared role-group constants
│   │   ├── lib/
│   │   │   ├── env.ts            # validated environment variables
│   │   │   ├── prisma.ts         # Prisma client singleton
│   │   │   └── asyncHandler.ts   # forwards async route errors to the error middleware
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT verification + requireRole guard
│   │   │   ├── errorHandler.ts   # maps Prisma errors to HTTP status codes
│   │   │   └── rateLimit.ts      # rate limiting for /auth
│   │   └── routes/
│   │       ├── auth.routes.ts
│   │       ├── users.routes.ts       # ADMIN-only staff management
│   │       ├── customers.routes.ts
│   │       ├── rooms.routes.ts
│   │       ├── reservations.routes.ts
│   │       ├── invoices.routes.ts    # billing: invoices + payments
│   │       ├── complaints.routes.ts
│   │       ├── interactions.routes.ts
│   │       ├── campaigns.routes.ts
│   │       ├── loyalty.routes.ts
│   │       └── dashboard.routes.ts
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── favicon.png
│   │   └── brand/                # logo/photo assets
│   ├── src/
│   │   ├── App.tsx                # routes + role-gated route groups
│   │   ├── main.tsx
│   │   ├── api.ts                 # fetch wrapper (auth header, error handling)
│   │   ├── rbac.ts                # frontend role-group constants (mirrors backend)
│   │   ├── types.ts
│   │   ├── styles.css
│   │   ├── auth/AuthContext.tsx   # JWT storage + login/logout
│   │   ├── components/
│   │   │   ├── Layout.tsx         # sidebar nav + topbar
│   │   │   ├── ProtectedRoute.tsx # requires authentication
│   │   │   ├── RoleRoute.tsx      # requires a specific role group
│   │   │   └── StatusBadge.tsx
│   │   └── pages/
│   │       ├── LoginPage.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── CustomersPage.tsx
│   │       ├── RoomsPage.tsx
│   │       ├── ReservationsPage.tsx
│   │       ├── InvoicesPage.tsx   # billing
│   │       ├── ComplaintsPage.tsx
│   │       ├── CampaignsPage.tsx
│   │       ├── LoyaltyPage.tsx
│   │       └── StaffPage.tsx      # ADMIN-only staff management
│   ├── .env.example
│   └── package.json
├── database/
│   └── manor_crm_seed.sql
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── FINAL_DEFENSE_REPORT_TEMPLATE.md
│   ├── PROJECT_STRUCTURE.md
│   └── screenshots/
├── postman/
│   └── manor-hotel-crm.postman_collection.json
├── scripts/
│   ├── setup.sh    # Linux/macOS
│   └── setup.ps1   # Windows
├── docker-compose.yml         # local PostgreSQL container (alternative to a host install)
├── docker-compose.prod.yml    # fully containerized stack (db + backend + frontend)
└── README.md
```

Use `scripts/setup.sh` on Linux/macOS (recommended path for this project) or
`scripts/setup.ps1` on Windows for the fastest local setup. See the root
`README.md` for the manual step-by-step and the RBAC permission matrix.
