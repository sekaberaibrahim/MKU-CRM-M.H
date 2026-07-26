FROM node:20-alpine AS base
WORKDIR /app

RUN apk add --no-cache openssl postgresql-client

COPY backend/package*.json ./
RUN npm install

COPY backend/tsconfig.json ./
COPY backend/prisma ./prisma
COPY backend/src ./src
COPY backend/docker-entrypoint.sh ./
COPY database ./database

RUN npx prisma generate
RUN npm run build
RUN chmod +x docker-entrypoint.sh

RUN chown -R node:node /app
USER node

EXPOSE 5000
ENTRYPOINT ["./docker-entrypoint.sh"]
