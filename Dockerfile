FROM python:3.11-slim

# Install system build deps required for scientific packages
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    build-essential \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    liblapacke-dev \
    pkg-config \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

# Copy minimal files first to leverage cache
COPY requirements.txt runtime.txt pyproject.toml /app/


# Upgrade pip and install Python deps
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project
COPY . /app

# Build frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Go back to app root
WORKDIR /app

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
