#!/bin/bash

# Simple restart script - kills and restarts the VCA server

echo "🔄 Restarting VCA Server..."

# Kill existing server
pkill -f "node app.js"
sleep 1

# Start new server
echo "🚀 Starting server..."
node app.js
