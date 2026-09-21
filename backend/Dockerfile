# EcoSort AI — FastAPI Backend
# Python 3.11 slim image for production deployment

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required by TensorFlow / Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies first (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create models directory for the classifier weights
RUN mkdir -p models

# Expose port
EXPOSE 8000

# Run with uvicorn (production: no --reload)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
