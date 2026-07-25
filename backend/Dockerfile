FROM node:20-alpine AS base
WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build

RUN chown -R node:node /app
USER node

EXPOSE 5000
CMD ["npm", "run", "start"]
