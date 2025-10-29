#!/bin/bash

# Start RAG Backend Server
echo "🚀 Starting RAG Backend Server..."
cd "$(dirname "$0")/rag-backend"

# Check if already running
if lsof -ti:3003 > /dev/null 2>&1; then
    echo "✅ Backend already running on port 3003"
    exit 0
fi

# Start the backend
npm start

