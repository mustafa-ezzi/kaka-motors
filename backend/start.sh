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

port="${PORT:-8000}"
case "$port" in
  ''|*[!0-9]*) port=8000 ;;
esac

if command -v python3 >/dev/null 2>&1; then
  py=python3
else
  py=python
fi

"$py" manage.py migrate --noinput
"$py" manage.py collectstatic --noinput
exec gunicorn config.wsgi:application --bind "0.0.0.0:${port}"
