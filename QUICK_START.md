# ⚡ Quick Start Guide

## 🎯 For Those in a Hurry

### Step 1: Setup Backend (First Time Only)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env  # Add your API keys
```

**Required:** Add at least ONE API key in `.env`:
- `GEMINI_API_KEY=your-key` (Get from: https://makersuite.google.com/app/apikey)
- OR `OPENAI_API_KEY=your-key` (Get from: https://platform.openai.com/api-keys)

### Step 2: Setup Frontend (First Time Only)
```bash
cd ..  # Back to project root
npm install
```

### Step 3: Run the Application

**Option A: Use the start script**
```bash
./start.sh
```

**Option B: Manual (Two Terminals)**

Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
python main.py
```

Terminal 2 - Frontend:
```bash
npm run dev
```

### Step 4: Open Browser
Go to: **http://localhost:5173**

---

## 🧪 Test It Works

1. Click on "Skill Coach" agent
2. Type: "I want to learn Python"
3. Click Send
4. You should get a response!

---

## ⚠️ Common Issues

### "No AI provider available"
→ Check `.env` file has at least one API key

### "Module not found"
→ Make sure virtual environment is activated: `source venv/bin/activate`

### "Port already in use"
→ Kill existing process: `sudo lsof -i :8000` then `kill -9 PID`

---

## 📚 Full Documentation

See **SETUP_GUIDE.md** for detailed instructions!


