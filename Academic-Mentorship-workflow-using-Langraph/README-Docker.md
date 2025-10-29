# 🐳 Docker Setup for Academic Mentorship Workflow

This guide will help you run the Academic Mentorship Workflow application using Docker on any system.

## 🚀 Quick Start

### Prerequisites
- Docker installed on your system
- Docker Compose (usually comes with Docker Desktop)
- API keys for OpenAI and/or Gemini

### 1. Clone and Setup
```bash
# Navigate to the project directory
cd "langraph agents"

# Make sure your .env file has the API keys
# OPENAI_API_KEY=your_openai_key_here
# GEMINI_API_KEY=your_gemini_key_here
```

### 2. Run with Docker Compose (Recommended)
```bash
# Build and start the application
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 3. Access the Application
- Open your browser and go to: `http://localhost:8080`
- The application will be running with all dependencies included

## 🔧 Alternative: Docker Build

### Build the Image
```bash
# Build the Docker image
docker build -t academic-mentorship .

# Run the container
docker run -p 8080:8080 \
  -e OPENAI_API_KEY=your_openai_key \
  -e GEMINI_API_KEY=your_gemini_key \
  academic-mentorship
```

## 📋 Docker Commands

### Basic Commands
```bash
# Start the application
docker-compose up

# Start in background
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up --build
```

### Development Commands
```bash
# Access container shell
docker-compose exec academic-mentorship bash

# View container status
docker-compose ps

# Restart specific service
docker-compose restart academic-mentorship
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change port in docker-compose.yml
   ports:
     - "8081:8080"  # Use port 8081 instead
   ```

2. **API Key Issues**
   ```bash
   # Check if .env file exists and has correct keys
   cat .env
   
   # Or set environment variables directly
   export OPENAI_API_KEY=your_key
   export GEMINI_API_KEY=your_key
   ```

3. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

4. **Container Won't Start**
   ```bash
   # Check logs for errors
   docker-compose logs academic-mentorship
   
   # Rebuild from scratch
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

### Health Check
The application includes a health check that verifies the service is running:
```bash
# Check health status
docker-compose ps

# Manual health check
curl http://localhost:8080/
```

## 🔒 Security Features

- **Non-root user**: Application runs as non-privileged user
- **Minimal dependencies**: Only necessary packages included
- **Health checks**: Automatic service monitoring
- **Environment isolation**: Secure API key handling

## 📊 Monitoring

### View Application Logs
```bash
# Real-time logs
docker-compose logs -f academic-mentorship

# Last 100 lines
docker-compose logs --tail=100 academic-mentorship
```

### Resource Usage
```bash
# Check container resource usage
docker stats academic-mentorship-app
```

## 🌐 Production Deployment

For production use, consider:

1. **Use a reverse proxy** (nginx) in front of the Flask app
2. **Set up SSL/TLS** certificates
3. **Use environment-specific configurations**
4. **Implement proper logging and monitoring**
5. **Use a production WSGI server** (gunicorn is included)

### Production Docker Compose Example
```yaml
version: '3.8'
services:
  academic-mentorship:
    build: .
    ports:
      - "8080:8080"
    environment:
      - FLASK_ENV=production
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

## 🎯 Features Included

- ✅ **Automatic dependency installation**
- ✅ **Environment variable handling**
- ✅ **Health checks and monitoring**
- ✅ **Security best practices**
- ✅ **Cross-platform compatibility**
- ✅ **Easy deployment and scaling**

## 📞 Support

If you encounter any issues:

1. Check the logs: `docker-compose logs academic-mentorship`
2. Verify your API keys are correct
3. Ensure Docker and Docker Compose are properly installed
4. Try rebuilding: `docker-compose up --build`

The application is now containerized and ready to run on any system with Docker! 🚀
