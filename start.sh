#!/bin/sh
set -eu
if [ -f backend/start.sh ]; then
  exec sh backend/start.sh
fi
if [ -f start.sh ] && [ -f manage.py ]; then
  echo "start.sh: already in backend" >&2
  exit 1
fi
echo "backend/start.sh not found" >&2
exit 1
