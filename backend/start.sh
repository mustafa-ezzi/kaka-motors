#!/bin/sh
set -eu

if [ -f manage.py ]; then
  :
elif [ -f backend/manage.py ]; then
  cd backend
else
  echo "manage.py not found" >&2
  exit 1
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput
exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}"
