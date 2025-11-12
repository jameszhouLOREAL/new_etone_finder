#!/bin/bash

# Stop VCA Server
echo "🛑 Stopping VCA Server..."
pkill -f "node app.js"
echo "✅ Server stopped"