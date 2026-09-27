#!/bin/bash

# Placement Preparation Portal - Background Service Runner
# Runs Backend & Frontend detached so closing Antigravity IDE won't kill them!

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$DIR/logs"
mkdir -p "$LOGS_DIR"

echo "=================================================="
echo "🚀 Starting Placement Preparation Portal (Background)..."
echo "=================================================="

# Check if Backend is already running on port 8000
BACKEND_RUNNING=$(lsof -ti tcp:8000 -sTCP:LISTEN)
if [ -n "$BACKEND_RUNNING" ]; then
    echo "⚠️ Backend is already running on port 8000 (PID: $BACKEND_RUNNING)"
else
    echo "⚙️ Starting Django Backend on port 8000..."
    cd "$DIR/backend"
    nohup "$DIR/.venv/bin/python" manage.py runserver 127.0.0.1:8000 > "$LOGS_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$DIR/.backend.pid"
    echo "✅ Backend started (PID: $BACKEND_PID, Log: logs/backend.log)"
fi

# Check if Frontend is already running on port 3000
FRONTEND_RUNNING=$(lsof -ti tcp:3000 -sTCP:LISTEN)
if [ -n "$FRONTEND_RUNNING" ]; then
    echo "⚠️ Frontend is already running on port 3000 (PID: $FRONTEND_RUNNING)"
else
    echo "🎨 Starting Frontend on port 3000..."
    cd "$DIR/frontend"
    nohup npm run dev > "$LOGS_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > "$DIR/.frontend.pid"
    echo "✅ Frontend started (PID: $FRONTEND_PID, Log: logs/frontend.log)"
fi

# Wait for backend to be ready
echo "⏳ Verifying services..."
sleep 2

if lsof -ti tcp:8000 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "✅ Backend is healthy at http://127.0.0.1:8000"
else
    echo "❌ Warning: Backend failed to start. Check logs/backend.log"
fi

if lsof -ti tcp:3000 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "✅ Frontend is healthy at http://localhost:3000"
else
    echo "❌ Warning: Frontend failed to start. Check logs/frontend.log"
fi

echo "=================================================="
echo "🎉 Portal is running detached in background!"
echo "👉 You can now safely close Antigravity IDE / Terminal."
echo "👉 URL: http://localhost:3000"
echo "👉 To stop anytime, run: ./stop.sh"
echo "=================================================="
