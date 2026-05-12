#!/usr/bin/env bash
set -e

echo "Starting The Manor Hotel CRM setup..."
echo "1) Starting PostgreSQL with Docker"
docker compose up -d

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
psql -h localhost -U postgres -d manor_crm -f database/manor_crm_seed.sql

echo "Setup complete."
echo "Run backend: npm run dev:backend"
echo "Run frontend: npm run dev:frontend"
