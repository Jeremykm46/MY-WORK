FROM node:20-alpine AS base
WORKDIR /app

# Backend production dependencies
FROM base AS deps-backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Frontend build dependencies
FROM base AS deps-frontend
WORKDIR /app/frontend
COPY frontend/edutrack-web/package*.json ./
RUN npm install

# Build the frontend
FROM deps-frontend AS build-frontend
WORKDIR /app/frontend
COPY frontend/edutrack-web ./
RUN npm run build

# Production image
FROM base AS production
ENV NODE_ENV=production

WORKDIR /app
COPY --from=deps-backend /app/backend/node_modules ./node_modules
COPY backend ./
COPY --from=build-frontend /app/frontend/dist ./frontend/edutrack-web/dist

RUN mkdir -p logs uploads

EXPOSE 5000

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodeapp -u 1001
USER nodeapp

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
