#!/bin/bash

echo "🚀 Starting AI Website Builder..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install server dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p server/projects
mkdir -p server/temp

# Start the application
echo "🌟 Starting the application..."
echo "📱 Frontend will be available at: http://localhost:3000"
echo "🔧 Backend will be available at: http://localhost:3001"
echo "📡 WebSocket will be available at: ws://localhost:3001"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

# Start both client and server
npm run start 