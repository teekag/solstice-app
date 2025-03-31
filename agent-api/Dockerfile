FROM python:3.11-slim

WORKDIR /app

# Install Ollama
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://ollama.com/install.sh | sh

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port for FastAPI
EXPOSE 8000

# Start Ollama in the background and run the FastAPI app
CMD ollama pull mistral && \
    uvicorn main:app --host 0.0.0.0 --port 8000
