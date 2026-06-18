FROM node:18-alpine AS builder
WORKDIR /app

# install node deps and build Tailwind CSS
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent
COPY . .
RUN npm run build:css

FROM python:3.11-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1

# copy built assets from node builder
COPY --from=builder /app/frontend/styles.css ./frontend/styles.css

# install python deps
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# copy project
COPY . /app

ENV PORT=8000
EXPOSE 8000

# Run the app with gunicorn + uvicorn worker
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "backend.main:app", "--bind", "0.0.0.0:8000", "--workers", "1"]
