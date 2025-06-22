#!/bin/bash

# server ports
DEVICE_IP_ADDR="192.168.1.3" # CHANGE THIS TO YOUR IP ADDRESS!!
FLASK_API_PORT=5002
HTTP_SERVER_PORT=5001

# Navigate to project directory
PROJECT_DIR="$(dirname "$(readlink -f "$0")")"
cd "$PROJECT_DIR"

# ADD VITE ENVIRONMENT VARIABLES (SO FRONTEND KNOWS ABOUT IPs AND PORTs)
VITE_ENV_FILE="frontend/.env.local"

echo "VITE_DEVICE_IP_ADDR=$DEVICE_IP_ADDR" > $VITE_ENV_FILE
echo "VITE_FLASK_API_PORT=$FLASK_API_PORT" >> $VITE_ENV_FILE

export "VITE_HTTP_SERVER_PORT=$HTTP_SERVER_PORT"

#### FUNCTIONS ####

# Function to start the servers
start_servers() {

    # Start Flask API
    echo
    echo "[Flask API] Starting Flask API on port $FLASK_API_PORT..."
    echo $FLASK_API_PORT
    python3 backend/flaskApi.py --port $FLASK_API_PORT "$@" &
    FLASK_API_PID=$!

    # Add a small delay to prevent printout mixing
    sleep 0.75

    # Start HTTP server for frontend
    cd frontend
    echo
    # UNUSED! echo "[HTTP Server] Starting HTTP server for frontend on port $HTTP_SERVER_PORT ..."
    # UNUSED! python3 -m http.server $HTTP_SERVER_PORT &
    
    #echo "[NODE] Building frontend ..."
    #npm run build
    #echo "[NODE] Starting frontend server ..."
    #npm run preview &
    
    echo "[NODE] Starting frontend dev server ..."
    npm run dev &
    HTTP_SERVER_PID=$!
    cd ..
}

# Function to restart the servers
restart_servers() {
    echo "Restarting servers..."
    
    # Kill the existing processes
    kill $HTTP_SERVER_PID $FLASK_API_PID
    
    # Wait for the servers to shut down completely
    wait $HTTP_SERVER_PID $FLASK_API_PID
    
    # Start the servers again
    start_servers
}

# Function to handle cleanup on exit (e.g., Ctrl+C)
cleanup() {
  echo "[CLEANUP] Shutting down servers (HTTP_SERVER=$HTTP_SERVER_PID FLASK_API=$FLASK_API_PID) ..."
  kill $HTTP_SERVER_PID $FLASK_API_PID
  echo "Exiting..."
  echo
  exit 0
}


#### MAIN ####

# Trap SIGINT (Ctrl+C) and cleanup
trap cleanup SIGINT

# Create and activate virtual environment (if not already done)
if [ ! -d "backend/.venv" ]; then
    echo
    echo "No venv created, run tools/setup.sh"
    exit 0
fi

source backend/.venv/bin/activate

# Start the servers initially
start_servers
sleep 0.75

# Interactive command loop
while true; do
    echo
    echo "Enter command (type 'restart' to restart the servers, 'exit' to quit):"
    read user_command
    
    case $user_command in
        restart)
            restart_servers
            ;;
        exit)
            cleanup
            ;;
        *)
            echo "Unknown command: $user_command"
            ;;
    esac
done
