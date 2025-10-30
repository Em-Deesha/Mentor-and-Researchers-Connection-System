# Complete Setup Guide - Multi-Agent Mentorship System

## 🎯 Overview

This guide will help you set up the Multi-Agent Mentorship System from scratch on Linux. We'll go step-by-step, assuming you're a beginner.

## 📋 Prerequisites

Before starting, make sure you have:
1. **Linux** (Ubuntu/Debian recommended)
2. **Internet connection**
3. **A code editor** (VS Code recommended)
4. **Basic terminal knowledge**

---

## Step 1: Install Python 3.9+ (if not already installed)

### Check if Python is installed:
```bash
python3 --version
```

If Python 3.9 or higher is not installed:

### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv -y
```

### Verify installation:
```bash
python3 --version
pip3 --version
```

---

## Step 2: Install Node.js 18+ (for Frontend)

### On Ubuntu/Debian:
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Verify installation:
```bash
node --version
npm --version
```

---

## Step 3: Set Up Backend Environment

### 3.1 Navigate to the project directory:
```bash
cd /home/eman-aslam/MA
cd backend
```

### 3.2 Create a Python virtual environment:
```bash
python3 -m venv venv
```

**What is a virtual environment?**  
It's like a separate room for your Python packages so they don't mix with system packages.

### 3.3 Activate the virtual environment:
```bash
source venv/bin/activate
```

You should see `(venv)` at the beginning of your terminal prompt. This means the virtual environment is active.

**Important:** Every time you open a new terminal, you need to run this command again!

### 3.4 Install Python dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This will install all necessary packages including:
- FastAPI (web framework)
- LangChain (for AI agents)
- OpenAI SDK
- Google Gemini SDK
- And more...

### 3.5 Create environment file:
```bash
cp .env.example .env
```

### 3.6 Edit the .env file:
```bash
nano .env
```

**You need to fill in these values:**

#### Required API Keys (you need at least ONE):

**Option A: Get Gemini API Key (Free)**
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key
5. Paste it in `.env`:
   ```
   GEMINI_API_KEY=your-actual-key-here
   ```

**Option B: Get OpenAI API Key (Paid, but has free tier)**
1. Go to: https://platform.openai.com/api-keys
2. Sign in/Sign up
3. Click "Create new secret key"
4. Copy the key
5. Paste it in `.env`:
   ```
   OPENAI_API_KEY=your-actual-key-here
   ```

**Recommendation:** Start with Gemini (it's free and works great!)

#### Supabase Configuration (Optional but Recommended):
If you don't have Supabase yet, you can leave these empty for now:
```
SUPABASE_URL=
SUPABASE_KEY=
```

The app will work without Supabase, but you won't be able to save conversation history.

**To get Supabase credentials:**
1. Go to: https://supabase.com
2. Sign up/Sign in
3. Create a new project
4. Go to Project Settings → API
5. Copy "Project URL" → `SUPABASE_URL`
6. Copy "anon public" key → `SUPABASE_KEY`

#### Set default provider:
```
AI_PROVIDER=gemini
```
(or `openai` if you prefer)

### 3.7 Save and exit:
Press `Ctrl+X`, then `Y`, then `Enter`

---

## Step 4: Set Up Frontend Environment

### 4.1 Navigate to project root:
```bash
cd /home/eman-aslam/MA
```

### 4.2 Install Node.js dependencies:
```bash
npm install
```

This will install React, TypeScript, Vite, and other frontend packages.

### 4.3 Create frontend environment file:
```bash
nano .env
```

(If the file exists, it will open it. If not, it will create it.)

### 4.4 Add frontend environment variables:
```
VITE_SUPABASE_URL=your-supabase-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

**Note:** If you don't have Supabase yet, you can use:
```
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=placeholder
```

### 4.5 Save and exit:
Press `Ctrl+X`, then `Y`, then `Enter`

---

## Step 5: Set Up Database (Supabase)

### 5.1 If you're using Supabase:
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Create a new query
4. Copy the contents of: `supabase/migrations/20251025074132_create_mentorship_tables.sql`
5. Paste and run it

This creates the necessary database tables.

---

## Step 6: Start the Backend Server

### 6.1 Navigate to backend:
```bash
cd /home/eman-aslam/MA/backend
```

### 6.2 Make sure virtual environment is activated:
```bash
source venv/bin/activate
```

(You should see `(venv)` in your prompt)

### 6.3 Start the server:
```bash
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**Keep this terminal open!** The backend is now running.

### 6.4 Test the backend:
Open a new terminal and run:
```bash
curl http://localhost:8000/
```

You should see a JSON response with status "healthy".

---

## Step 7: Start the Frontend

### 7.1 Open a NEW terminal window (keep backend running!):
```bash
cd /home/eman-aslam/MA
```

### 7.2 Start the frontend dev server:
```bash
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 7.3 Open your browser:
Go to: http://localhost:5173

You should see the Multi-Agent Mentorship interface!

---

## Step 8: Test the Application

### 8.1 Test Skill Coach Agent:
1. Click on "Skill Coach" card
2. Type: "I want to learn machine learning"
3. Click "Send"
4. Wait for the AI response

### 8.2 Test other agents:
- **Career Guide:** "What scholarships are available for Pakistani students?"
- **Writing Assistant:** "Help me write an abstract for my research"
- **Networking Guide:** "What conferences should I attend for AI research?"

### 8.3 Switch AI providers:
- Use the provider toggle to switch between Gemini and OpenAI (if both are configured)

---

## Step 9: Verify Everything Works

### Check Backend Logs:
Look at the terminal where backend is running. You should see:
```
INFO: Processing request: agent=skill_coach, provider=gemini
INFO: Configuration validated. AI Provider: gemini
```

### Check Browser Console:
1. Open browser DevTools (F12)
2. Go to Console tab
3. There should be no red errors

### Test API directly:
```bash
curl -X POST http://localhost:8000/mentorship \
  -H "Content-Type: application/json" \
  -d '{
    "agent_type": "skill_coach",
    "query": "I want to learn Python"
  }'
```

---

## 🎉 Congratulations!

Your Multi-Agent Mentorship System is now running!

---

## Common Issues & Solutions

### Issue 1: "No module named 'langchain'"
**Solution:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Issue 2: "No AI provider available"
**Solution:**
- Check your `.env` file has at least one API key
- Make sure the API key is correct (no extra spaces)
- Restart the backend server

### Issue 3: "Connection refused"
**Solution:**
- Make sure backend is running on port 8000
- Check if another application is using port 8000:
  ```bash
  sudo lsof -i :8000
  ```

### Issue 4: Frontend shows "Request failed"
**Solution:**
- Make sure backend is running
- Check browser console for errors
- Verify `.env` file has correct Supabase URL (or use `http://localhost:8000`)

### Issue 5: "Port 8000 already in use"
**Solution:**
```bash
# Find what's using the port
sudo lsof -i :8000
# Kill the process (replace PID with actual process ID)
sudo kill -9 PID
```

---

## Daily Usage

### Starting the Application:

1. **Terminal 1 - Backend:**
   ```bash
   cd /home/eman-aslam/MA/backend
   source venv/bin/activate
   python main.py
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd /home/eman-aslam/MA
   npm run dev
   ```

3. **Open Browser:**
   - Go to: http://localhost:5173

### Stopping the Application:

- **Backend:** Press `Ctrl+C` in Terminal 1
- **Frontend:** Press `Ctrl+C` in Terminal 2

---

## Next Steps

1. **Add more agents:** Edit `backend/agents.py` and `backend/langchain_agents.py`
2. **Customize prompts:** Edit system prompts in `backend/langchain_agents.py`
3. **Add features:** Extend the frontend in `src/components/`
4. **Deploy:** Follow deployment guides for production

---

## Getting Help

1. Check the logs in terminal
2. Check browser console (F12)
3. Review API documentation: http://localhost:8000/docs
4. Check error messages - they're designed to be helpful!

---

## Environment Variables Reference

### Backend (.env in backend/ folder):
```
SUPABASE_URL          # Your Supabase project URL
SUPABASE_KEY          # Your Supabase anon key
OPENAI_API_KEY        # Your OpenAI API key
GEMINI_API_KEY        # Your Gemini API key
AI_PROVIDER           # Default: gemini or openai
DEBUG                 # Default: false
LOG_LEVEL             # Default: INFO
```

### Frontend (.env in root/ folder):
```
VITE_SUPABASE_URL     # Your Supabase project URL
VITE_SUPABASE_ANON_KEY # Your Supabase anon key
```

**Note:** Frontend variables must start with `VITE_` to be accessible!

---

## Architecture Overview

```
┌─────────────┐
│   Browser   │ (Frontend - React + TypeScript)
│  Port 5173  │
└──────┬──────┘
       │ HTTP Requests
       ▼
┌─────────────┐
│   Backend    │ (FastAPI + LangChain)
│  Port 8000   │
└──────┬───────┘
       │
       ├──► OpenAI API / Gemini API
       │
       └──► Supabase (Database)
```

---

## What's Different in This Version?

### ✅ What's New:
1. **LangChain Integration:** Professional multi-agent orchestration
2. **Dual Provider Support:** Seamless switching between OpenAI and Gemini
3. **Better Error Handling:** Comprehensive error messages and logging
4. **Production Ready:** Optimized, secure, and scalable
5. **Enhanced Security:** Input validation, error sanitization
6. **Better Logging:** Detailed logs for debugging

### 🔧 Technical Improvements:
- LangChain agents with tools
- LangGraph for workflow orchestration
- Proper async/await patterns
- Type safety with Pydantic
- Comprehensive error handling
- Input validation
- Security best practices

---

## Troubleshooting Checklist

- [ ] Python 3.9+ installed?
- [ ] Node.js 18+ installed?
- [ ] Virtual environment activated?
- [ ] All dependencies installed?
- [ ] `.env` file created and filled?
- [ ] At least one API key configured?
- [ ] Backend server running?
- [ ] Frontend server running?
- [ ] No port conflicts?
- [ ] Browser console has no errors?

---

**Happy Coding! 🚀**


