ARG PYTHON_VERSION=3.11-slim

FROM python:${PYTHON_VERSION} as builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    gettext \
    && rm -rf /var/lib/apt/lists/*

COPY requirements/base.txt requirements.txt
RUN pip install --user -r requirements.txt


FROM python:${PYTHON_VERSION}

RUN groupadd -r django && useradd -r -g django django

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gettext \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

WORKDIR /app

COPY --chown=django:django . .

RUN mkdir -p /app/staticfiles /app/media /app/logs && \
    chown -R django:django /app

USER django

RUN python manage.py collectstatic --noinput 2>/dev/null || true

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--threads", "2", "--timeout", "120"]
