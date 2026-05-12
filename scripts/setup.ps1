Write-Host "Starting The Manor Hotel CRM setup..."

Write-Host "1) Starting PostgreSQL with Docker"
docker compose up -d

Write-Host "2) Installing backend dependencies"
npm install --prefix backend

Write-Host "3) Installing frontend dependencies"
npm install --prefix frontend

Write-Host "4) Creating backend .env if missing"
if (!(Test-Path "backend/.env")) {
  Copy-Item "backend/.env.example" "backend/.env"
}

Write-Host "5) Creating frontend .env if missing"
if (!(Test-Path "frontend/.env")) {
  Copy-Item "frontend/.env.example" "frontend/.env"
}

Write-Host "6) Generating Prisma client and running migrations"
npm run prisma:generate --prefix backend
npm run prisma:migrate --prefix backend -- --name init

Write-Host "7) Importing SQL sample data"
psql -h localhost -U postgres -d manor_crm -f database/manor_crm_seed.sql

Write-Host "Setup complete."
Write-Host "Run backend: npm run dev:backend"
Write-Host "Run frontend: npm run dev:frontend"
