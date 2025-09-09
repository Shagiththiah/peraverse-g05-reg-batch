# Use Node 22
FROM node:22-slim

WORKDIR /app

# Copy everything
COPY Frontend ./Frontend
COPY Backend ./Backend

# Build frontend
RUN cd Frontend && npm ci && npm run build

# Install backend dependencies
RUN cd Backend && npm ci

WORKDIR /app/Backend

# Env defaults (can be overridden by Fly secrets)
ENV NODE_ENV=production
ENV PORT=8080
ENV SERVE_FRONTEND=true
ENV HOST=0.0.0.0

EXPOSE 8080

CMD ["node", "server/index.js"]
