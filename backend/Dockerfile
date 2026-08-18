FROM python:3.13-slim-bookworm

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings.production

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app
RUN mkdir -p /app/staticfiles /app/bin \
    && chmod +x /app/start.sh /app/bin/node \
    && printf '%s\n' '#!/bin/sh' 'exec sh /app/start.sh' > /app/bin/node \
    && chmod +x /app/bin/node

ENV PATH="/app/bin:${PATH}"

EXPOSE 8000

CMD ["sh", "/app/start.sh"]
