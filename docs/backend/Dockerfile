FROM python:3.10-slim

WORKDIR /app

# Dependencias de sistema necesarias para audio (libsndfile) y compilación
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV HOST=0.0.0.0
ENV PORT=7860
ENV OUTPUT_DIR=/app/outputs

EXPOSE 7860

CMD ["python", "app.py"]
