FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build

EXPOSE 5000
CMD ["npm", "run", "start"]
