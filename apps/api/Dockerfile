FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY apps/api/pyproject.toml apps/api/requirements.txt /app/

RUN python -m pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY apps/api/app /app/app
COPY apps/api/migrations /app/migrations

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]