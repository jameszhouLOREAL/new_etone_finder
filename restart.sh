#!/bin/bash

# VCA Server Restart Script
echo "🔄 Restarting VCA Photo Submission Results Server..."

# Kill any existing Node.js processes running app.js
echo "🛑 Stopping existing server..."
pkill -f "node app.js" 2>/dev/null

# Wait a moment for processes to terminate
sleep 2

# Start the new server
echo "🚀 Starting new server..."
node app.js &

echo "✅ Server restart complete!"
echo "📊 Server is running at http://localhost:4200"