# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
# Next.js Static Export
RUN npm run build

# Stage 2: Backend & Final Image
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies if needed (e.g. for psycopg2)
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY app ./app
COPY alembic ./alembic
COPY alembic.ini .

# Copy Frontend Build Output
COPY --from=frontend-builder /app/frontend/out ./frontend/out

# Expose port
EXPOSE 8000

# Run Application
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
