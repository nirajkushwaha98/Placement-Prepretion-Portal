#!/bin/bash

# Placement Preparation Portal - 1-Click Direct Runner
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=================================================="
echo "🚀 Starting Placement Preparation Portal..."
echo "=================================================="

# 1. Start Backend in Background
echo "⚙️ Starting Django Backend (http://127.0.0.1:8000)..."
cd "$DIR/backend"
"$DIR/.venv/bin/python" manage.py runserver 127.0.0.1:8000 &
BACKEND_PID=$!

# 2. Wait 2 seconds for backend to initialize
sleep 2

# 3. Start Frontend
echo "🎨 Starting Frontend (Vite)..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM
wait
