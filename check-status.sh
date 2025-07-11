#!/bin/bash

echo "🔍 Checking AI Website Builder Status..."
echo ""

# Check if processes are running
echo "📊 Process Status:"
if pgrep -f "node.*index.js" >/dev/null; then
    echo "✅ Backend server (Node.js) is running"
else
    echo "❌ Backend server is not running"
fi

if pgrep -f "vite" >/dev/null; then
    echo "✅ Frontend server (Vite) is running"
else
    echo "❌ Frontend server is not running"
fi

echo ""

# Check if ports are listening
echo "🌐 Port Status:"
if lsof -i :3000 >/dev/null 2>&1; then
    echo "✅ Port 3000 (Frontend) is listening"
else
    echo "❌ Port 3000 is not listening"
fi

if lsof -i :3001 >/dev/null 2>&1; then
    echo "✅ Port 3001 (Backend) is listening"
else
    echo "❌ Port 3001 is not listening"
fi

echo ""

# Test API endpoints
echo "🔗 API Tests:"
if curl -s http://localhost:3001/api/health >/dev/null; then
    echo "✅ Backend API is responding"
else
    echo "❌ Backend API is not responding"
fi

if curl -s http://localhost:3000 >/dev/null; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

echo ""
echo "🎯 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   WebSocket: ws://localhost:3001" 