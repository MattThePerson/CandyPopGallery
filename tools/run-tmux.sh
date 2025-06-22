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

#### TMUX SESSION MANAGEMENT ####

TMUX_SESSION="web_app"

# Check if tmux session already exists
tmux has-session -t $TMUX_SESSION 2>/dev/null
if [ $? != 0 ]; then
    # Create a new tmux session
    tmux new-session -d -s $TMUX_SESSION -n backend

    # Start Flask API in the first window
    tmux send-keys -t $TMUX_SESSION:backend "source backend/.venv/bin/activate" C-m
    tmux send-keys -t $TMUX_SESSION:backend "python3 backend/flaskApi.py --port $FLASK_API_PORT" C-m

    # Create a new window for the frontend
    tmux new-window -t $TMUX_SESSION -n frontend
    tmux send-keys -t $TMUX_SESSION:frontend "cd frontend" C-m
    tmux send-keys -t $TMUX_SESSION:frontend "npm run dev" C-m

    echo "Tmux session '$TMUX_SESSION' created. Use 'tmux attach -t $TMUX_SESSION' to view."
else
    echo "Tmux session '$TMUX_SESSION' already exists. Use 'tmux attach -t $TMUX_SESSION' to view."
fi

#### CLEANUP FUNCTION ####

cleanup() {
    echo "[CLEANUP] Stopping tmux session '$TMUX_SESSION'..."
    tmux kill-session -t $TMUX_SESSION
    echo "Exiting..."
    exit 0
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

# Wait for user input to exit or restart
while true; do
    echo
    echo "Enter command (type 'restart' to restart the servers, 'exit' to quit):"
    read user_command
    
    case $user_command in
        restart)
            cleanup
            exec "$0" "$@"
            ;;
        exit)
            cleanup
            ;;
        *)
            echo "Unknown command: $user_command"
            ;;
    esac
done
