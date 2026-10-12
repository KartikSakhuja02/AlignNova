FROM node:18-alpine AS builder
WORKDIR /app

# Install root dependencies (for Tailwind)
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

# Install frontend dependencies (for React / Vite)
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && (npm ci --silent || npm install --silent)

# Copy source files
COPY . .

# Build Tailwind CSS and React frontend bundle (outputs to frontend_dist)
RUN npm run build:css
RUN cd frontend && npm run build

FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1

# Install python deps
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy project files
COPY . /app

# Copy built frontend from builder stage
COPY --from=builder /app/frontend_dist /app/frontend_dist
COPY --from=builder /app/frontend/styles.css /app/frontend/styles.css

ENV PORT=8000
EXPOSE 8000

# Run the app with gunicorn + uvicorn worker
CMD ["sh", "-c", "gunicorn -k uvicorn.workers.UvicornWorker backend.main:app --bind 0.0.0.0:${PORT:-8000} --workers 1"]
