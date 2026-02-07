#!/bin/bash

# Define the port
PORT=8000
URL="http://localhost:$PORT"

# Check if python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 could not be found. Please install Python 3 to run the local server."
    exit 1
fi

echo "Starting local server for Validated Names Web App..."
echo "Serving at $URL"
echo "Press Ctrl+C to stop the server."

# Open the browser (macOS specific 'open' command, or 'xdg-open' on Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$URL"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$URL"
else
    echo "Please open $URL in your browser."
fi

# Navigate to the web-app directory and start the server
cd web-app
python3 -m http.server "$PORT"
