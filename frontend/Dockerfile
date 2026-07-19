# ── Build Stage ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (with fallback if no lock file exists)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ── Production Stage ────────────────────────────────────────────────────────
FROM cgr.dev/chainguard/nginx:latest

WORKDIR /app

# Copy built assets to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to support Single Page Applications (SPA) routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

ENV PORT=8080
EXPOSE 8080

CMD ["-g", "daemon off;"]
