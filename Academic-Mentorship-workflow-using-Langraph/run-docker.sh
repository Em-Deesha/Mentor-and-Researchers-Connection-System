#!/bin/bash

# Academic Mentorship Workflow - Docker Setup Script
# This script helps you run the application with Docker

echo "🐳 Academic Mentorship Workflow - Docker Setup"
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    echo "   On Linux: sudo systemctl start docker"
    echo "   On Windows/Mac: Start Docker Desktop"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Creating template..."
    cat > .env << EOF
# Add your API keys here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
EOF
    echo "📝 Please edit .env file with your actual API keys"
    echo "   nano .env  # or use your preferred editor"
    exit 1
fi

# Check if API keys are set
if grep -q "your_.*_key_here" .env; then
    echo "⚠️  Please update .env file with your actual API keys"
    echo "   Current .env file contains placeholder values"
    exit 1
fi

echo "✅ Docker is running"
echo "✅ .env file found with API keys"

# Create logs directory
mkdir -p logs

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Build and start the application
echo "🔨 Building Docker image..."
docker-compose build

if [ $? -eq 0 ]; then
    echo "🚀 Starting application..."
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 Application is running!"
        echo "🌐 Open your browser and go to: http://localhost:8080"
        echo ""
        echo "📋 Useful commands:"
        echo "   View logs:     docker-compose logs -f"
        echo "   Stop app:      docker-compose down"
        echo "   Restart app:   docker-compose restart"
        echo "   Check status:  docker-compose ps"
        echo ""
        echo "🔍 To view logs in real-time:"
        echo "   docker-compose logs -f academic-mentorship"
    else
        echo "❌ Failed to start application"
        echo "🔍 Check logs: docker-compose logs academic-mentorship"
    fi
else
    echo "❌ Failed to build Docker image"
    echo "🔍 Check the build output above for errors"
fi
