FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src ./src

ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
