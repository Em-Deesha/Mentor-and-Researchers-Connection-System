# 🚀 Quick Start Guide - Academic Mentorship Workflow

## Option 1: Docker (Recommended - Works on any system)

### Prerequisites
- Docker installed on your system
- API keys for OpenAI and/or Gemini

### Quick Setup
```bash
# 1. Make sure you have your API keys in .env file
# OPENAI_API_KEY=your_actual_key_here
# GEMINI_API_KEY=your_actual_key_here

# 2. Run the automated setup script
./run-docker.sh
```

### Manual Docker Commands
```bash
# Build and start
docker-compose up --build

# Or run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop application
docker-compose down
```

## Option 2: Local Python (Development)

### Prerequisites
- Python 3.11+
- pip

### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=your_key_here
export GEMINI_API_KEY=your_key_here

# Run application
python3 app.py
```

## 🌐 Access Application
- **URL**: http://localhost:8080
- **Features**: OpenAI and Gemini workflows
- **UI**: Dark mode, responsive design
- **Tables**: Professional HTML formatting for Agent 3

## 🔧 Troubleshooting

### Docker Issues
```bash
# Check Docker status
docker --version
docker-compose --version

# Fix permissions (Linux)
sudo usermod -aG docker $USER
# Then logout and login again

# View container logs
docker-compose logs academic-mentorship
```

### API Key Issues
```bash
# Check .env file
cat .env

# Test API keys
python3 -c "import os; print('OpenAI:', bool(os.getenv('OPENAI_API_KEY'))); print('Gemini:', bool(os.getenv('GEMINI_API_KEY')))"
```

### Port Issues
```bash
# Check if port 8080 is free
netstat -tulpn | grep 8080

# Use different port
# Edit docker-compose.yml: ports: - "8081:8080"
```

## 📋 What You Get

### Enhanced Agent Outputs:
- **Agent 1**: Clear research scope with 5 sections
- **Agent 2**: Simple methodology and risk analysis
- **Agent 3**: Professional HTML table with skills/resources
- **Agent 4**: Practical 30/60/90-day timeline

### Professional Features:
- ✅ **Concise answers** - No academic jargon
- ✅ **HTML tables** - Clean formatting for Agent 3
- ✅ **Mobile responsive** - Works on all devices
- ✅ **Dark theme** - Modern UI design
- ✅ **Collapsible cards** - Interactive sections

## 🎯 Test Questions
Try these sample questions:
- "I want to research machine learning in healthcare"
- "How can I study voice model integration in AI agents?"
- "I'm interested in blockchain technology for supply chains"
- "I want to explore quantum computing applications"

## 🆘 Need Help?
1. Check logs: `docker-compose logs -f`
2. Verify API keys in `.env` file
3. Ensure Docker is running: `docker info`
4. Try rebuilding: `docker-compose up --build`

The application is now ready to run on any system! 🎉
