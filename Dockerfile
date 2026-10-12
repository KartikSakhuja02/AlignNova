# ── Stage 1: Build Frontend (Fast React + Tailwind bundle via Vite) ─────────────
FROM node:20-alpine AS builder
WORKDIR /app/frontend

# Cache frontend dependencies
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install --prefer-offline --no-audit --no-fund

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

# Run FastAPI app with gunicorn + uvicorn worker
CMD ["sh", "-c", "gunicorn -k uvicorn.workers.UvicornWorker backend.main:app --bind 0.0.0.0:${PORT:-8000} --workers 1"]
