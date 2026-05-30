FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml poetry.lock* /app/
RUN apt-get update && apt-get install -y build-essential curl && rm -rf /var/lib/apt/lists/*
RUN python -m pip install --upgrade pip
# Install runtime deps (fastapi + uvicorn) as a minimal set
RUN pip install fastapi "uvicorn[standard]" pydantic-settings
COPY . /app
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
