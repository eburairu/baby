# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies with caching
COPY frontend/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Build frontend
COPY frontend/ .
RUN npm run build

# Stage 2: Runtime
FROM python:3.10-slim AS runtime

WORKDIR /app

# Install system dependencies with caching
# libpq-dev is needed for psycopg2 (PostgreSQL adapter)
# gcc is needed for building psuycopg2 if using the source distribution, but slim images usually need it.
# removing apt lists to keep image small
RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && \
    apt-get install -y --no-install-recommends libpq-dev gcc

# Create a non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Install Python dependencies with caching
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY app ./app
COPY alembic ./alembic
COPY alembic.ini .

# Copy Frontend Build Output
COPY --from=frontend-builder --chown=appuser:appuser /app/frontend/out ./frontend/out

# Set ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Run Application
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
