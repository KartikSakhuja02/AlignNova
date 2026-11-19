# ── Stage 1: Build Frontend (Fast React + Tailwind bundle via Vite) ─────────────
FROM node:22-alpine AS builder
WORKDIR /app/frontend

# Cache frontend dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --no-fund

# Copy frontend source and build production bundle to /app/frontend_dist
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python Runtime ───────────────────────────────────────────────────
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1

# Cache python dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --disable-pip-version-check -r /app/backend/requirements.txt

# Copy application backend and built frontend
COPY backend /app/backend
COPY --from=builder /app/frontend_dist /app/frontend_dist

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "exec uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
