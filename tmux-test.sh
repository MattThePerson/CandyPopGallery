#!/bin/bash

# Create a new tmux session named "test_session" and start it detached.
# -d: Start the session in detached mode (doesn't immediately take over the terminal).
# -s: Specifies the name of the session ("test_session").
tmux new-session -d -s test_session

# Split the current window into two panes, with the new pane below.
# -v: Splits the window vertically (pane below).
# -t: Specifies the target session/window (default is ":0", the first window in the session).
tmux split-window -v -t test_session

# Send the "htop" command to the lower pane.
# -t: Specifies the target pane (":0.1" means window 0, pane 1).
# C-m: Simulates pressing "Enter" to execute the command.
tmux send-keys -t test_session:0.1 "htop" C-m

# Select the upper pane to make it active.
# -t: Specifies the target pane (":0.0" means window 0, pane 0).
tmux select-pane -t test_session:0.0

# Send the "python3 --version" command to the upper pane.
# -t: Specifies the target pane (":0.0").
# C-m: Simulates pressing "Enter" to execute the command.
tmux send-keys -t test_session:0.0 "python3 --version" C-m

# Attach to the session to make it visible in the terminal.
# -t: Specifies the target session ("test_session").
tmux attach-session -t test_session
