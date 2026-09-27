#!/bin/bash

# Placement Preparation Portal - Stop Runner

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🛑 Stopping Placement Preparation Portal..."

# 1. Kill backend on port 8000
BACKEND_PID=$(lsof -ti tcp:8000 -sTCP:LISTEN)
if [ -n "$BACKEND_PID" ]; then
    echo "Stopping Backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || kill -9 $BACKEND_PID 2>/dev/null
    echo "✅ Backend stopped."
else
    echo "ℹ️ Backend is not running."
fi

# 2. Kill frontend on port 3000
FRONTEND_PID=$(lsof -ti tcp:3000 -sTCP:LISTEN)
if [ -n "$FRONTEND_PID" ]; then
    echo "Stopping Frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || kill -9 $FRONTEND_PID 2>/dev/null
    echo "✅ Frontend stopped."
else
    echo "ℹ️ Frontend is not running."
fi

# Clean up PID files
rm -f "$DIR/.backend.pid" "$DIR/.frontend.pid"

echo "✨ All services stopped successfully."
