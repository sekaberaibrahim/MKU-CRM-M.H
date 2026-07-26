#!/bin/sh
set -e

echo "Applying database migrations..."
npx prisma migrate deploy

if [ "$AUTO_SEED" = "true" ]; then
  echo "Seeding demo data (safe to re-run; existing rows are skipped)..."
  # psql doesn't understand Prisma's ?schema= query param, so strip it before connecting
  PSQL_URL="${DATABASE_URL%%\?*}"
  psql "$PSQL_URL" -f database/manor_crm_seed.sql || echo "Seed skipped (data likely already present)."
fi

exec node dist/server.js
