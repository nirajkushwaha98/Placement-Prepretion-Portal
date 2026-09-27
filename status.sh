#!/bin/bash

# Placement Preparation Portal - Status Checker

echo "=================================================="
echo "📊 Placement Preparation Portal - Service Status"
echo "=================================================="

BACKEND_PID=$(lsof -ti tcp:8000 -sTCP:LISTEN)
if [ -n "$BACKEND_PID" ]; then
    echo "🟢 Backend:  RUNNING (PID: $BACKEND_PID) -> http://127.0.0.1:8000"
else
    echo "🔴 Backend:  STOPPED (Port 8000 is free)"
fi

FRONTEND_PID=$(lsof -ti tcp:3000 -sTCP:LISTEN)
if [ -n "$FRONTEND_PID" ]; then
    echo "🟢 Frontend: RUNNING (PID: $FRONTEND_PID) -> http://localhost:3000"
else
    echo "🔴 Frontend: STOPPED (Port 3000 is free)"
fi

echo "=================================================="
