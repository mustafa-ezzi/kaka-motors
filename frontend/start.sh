#!/bin/sh
set -eu
port="${PORT:-4173}"
case "$port" in
  ''|*[!0-9]*) port=4173 ;;
esac
exec npx --yes serve dist -s -n -l "tcp://0.0.0.0:${port}"
