#!/bin/bash

echo "🔄 Restarting AI Website Builder..."

# Stop any existing processes
echo "🛑 Stopping existing processes..."
pkill -f "node.*index.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "concurrently" 2>/dev/null

# Wait a moment for processes to stop
sleep 2

# Check if ports are free
echo "🔍 Checking if ports are available..."
if lsof -i :3000 >/dev/null 2>&1; then
    echo "❌ Port 3000 is still in use. Please manually stop the process using it."
    exit 1
fi

if lsof -i :3001 >/dev/null 2>&1; then
    echo "❌ Port 3001 is still in use. Please manually stop the process using it."
    exit 1
fi

echo "✅ Ports are available"

# Start the application
echo "🚀 Starting the application..."
npm run start 