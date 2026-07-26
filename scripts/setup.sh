#!/usr/bin/env bash
set -e

echo "Starting The Manor Hotel CRM setup..."
echo "1) Ensuring local PostgreSQL role/database exist"
if command -v psql >/dev/null 2>&1 && pg_isready >/dev/null 2>&1; then
  sudo -u postgres psql \
    -c "DO \$\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'manor_crm') THEN CREATE USER manor_crm WITH PASSWORD 'manor_crm_dev_pw'; END IF; END \$\$;" \
    -c "SELECT 'CREATE DATABASE manor_crm OWNER manor_crm' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'manor_crm')\gexec" \
    -c "GRANT ALL PRIVILEGES ON DATABASE manor_crm TO manor_crm;"
else
  echo "Local PostgreSQL not detected — falling back to Docker Compose (postgres:16-alpine)."
  docker compose up -d
fi

echo "2) Installing backend dependencies"
npm install --prefix backend

echo "3) Installing frontend dependencies"
npm install --prefix frontend

echo "4) Creating backend .env if missing"
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
fi

echo "5) Creating frontend .env if missing"
if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
fi

echo "6) Generating Prisma client and running migrations"
npm run prisma:generate --prefix backend
npm run prisma:migrate --prefix backend -- --name init

echo "7) Importing SQL sample data"
PGPASSWORD=manor_crm_dev_pw psql -h localhost -U manor_crm -d manor_crm -f database/manor_crm_seed.sql

echo "Setup complete."
echo "Run backend: npm run dev --prefix backend"
echo "Run frontend: npm run dev --prefix frontend"
