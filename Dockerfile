FROM python:3.11-slim

# Install system build deps required for scientific packages
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    build-essential \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    liblapacke-dev \
    libatlas-base-dev \
    pkg-config \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy minimal files first to leverage cache
COPY requirements.txt runtime.txt pyproject.toml /app/

# Upgrade pip and install Python deps
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project
COPY . /app

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
