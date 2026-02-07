#!/usr/bin/env bash
# Launch local environment: build plumber Docker image, run it, render Quarto site, and serve static site
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Build plumber Docker image
echo "Building plumber Docker image..."
docker build -t select-names-plumber .

# Stop any previous container
if docker ps -a --format '{{.Names}}' | grep -q '^select-names-plumber$'; then
  echo "Stopping previous container..."
  docker rm -f select-names-plumber || true
fi

# Run plumber in detached mode
echo "Starting plumber container on port 8000..."
docker run -d --name select-names-plumber -p 8000:8000 select-names-plumber

# Render Quarto site
if command -v quarto >/dev/null 2>&1; then
  echo "Rendering Quarto site..."
  quarto render quarto-site
  OUTDIR="quarto-site/_site"
else
  echo "Quarto not found. Skipping render. You can install Quarto or run 'quarto render quarto-site' manually." >&2
  OUTDIR="quarto-site/_site"
fi

# Serve static site via python http.server
PORT=4000
if [ -d "$OUTDIR" ]; then
  echo "Serving site at http://localhost:$PORT"
  # kill existing server if running using a known pid file
  if [ -f /tmp/quarto_site_server.pid ]; then
    PID=$(cat /tmp/quarto_site_server.pid)
    if ps -p $PID >/dev/null 2>&1; then
      echo "Stopping existing static server (PID $PID)"
      kill $PID || true
    fi
    rm -f /tmp/quarto_site_server.pid
  fi
  nohup python3 -m http.server $PORT --directory "$OUTDIR" > /tmp/quarto_site_server.log 2>&1 &
  echo $! > /tmp/quarto_site_server.pid
  echo "Site served. Plumber API: http://localhost:8000  Site: http://localhost:$PORT"
else
  echo "Site output directory $OUTDIR not found. Ensure Quarto rendered the site." >&2
fi

echo "Done." 
