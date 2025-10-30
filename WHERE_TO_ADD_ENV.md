# 📍 Where to Add .env File - Step by Step

## 📂 Exact Location

**File Path:** `/home/eman-aslam/MA/backend/.env`

**Directory Structure:**
```
/home/eman-aslam/MA/
├── backend/
│   ├── .env          ← CREATE THIS FILE HERE (if it doesn't exist)
│   ├── .env.example  ← Already exists (use as template)
│   ├── main.py
│   ├── agents.py
│   └── ...
├── src/
└── ...
```

---

## 🚀 Quick Steps to Create .env

### Option 1: Copy from Example (Easiest)
```bash
cd /home/eman-aslam/MA/backend
cp .env.example .env
nano .env
```

### Option 2: Create Manually
```bash
cd /home/eman-aslam/MA/backend
nano .env
```

Then paste this content:
```
# AI Provider - You need at least ONE of these:
GEMINI_API_KEY=your-gemini-api-key-here
# OR
OPENAI_API_KEY=your-openai-api-key-here

# Default provider (gemini or openai)
AI_PROVIDER=gemini

# Optional: Supabase (for database features)
SUPABASE_URL=
SUPABASE_KEY=
```

---

## ✏️ How to Edit .env File

### Step 1: Navigate to backend folder
```bash
cd /home/eman-aslam/MA/backend
```

### Step 2: Open the file
```bash
nano .env
```

### Step 3: Add your API key

**For Gemini (Recommended - FREE):**
1. Get key from: https://makersuite.google.com/app/apikey
2. Replace `your-gemini-api-key-here` with your actual key

**Example:**
```
GEMINI_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
```

**For OpenAI (Paid):**
1. Get key from: https://platform.openai.com/api-keys
2. Replace `your-openai-api-key-here` with your actual key

**Example:**
```
OPENAI_API_KEY=sk-1234567890abcdefghijklmnopqrstuvwxyz
```

### Step 4: Save and Exit
- Press `Ctrl+X`
- Press `Y` to confirm
- Press `Enter` to save

---

## ✅ Verify It Worked

```bash
cd /home/eman-aslam/MA/backend
cat .env | grep API_KEY
```

You should see your API key (partially hidden is normal for security).

---

## 📝 Complete .env File Example

```bash
# Copy this into your .env file and replace with your actual keys

# GEMINI API Key (Get free from: https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=AIzaSyC_your_actual_key_here

# OR OpenAI API Key (Get from: https://platform.openai.com/api-keys)
# OPENAI_API_KEY=sk-your_actual_key_here

# Which AI to use by default
AI_PROVIDER=gemini

# Optional: Supabase for database features
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your-supabase-key-here
```

---

## ⚠️ Important Notes

1. **File Location:** Must be in `/home/eman-aslam/MA/backend/` folder
2. **File Name:** Must be exactly `.env` (not `.env.txt` or `env`)
3. **No Spaces:** Around the `=` sign: `GEMINI_API_KEY=value` (not `GEMINI_API_KEY = value`)
4. **At Least One:** You need either `GEMINI_API_KEY` OR `OPENAI_API_KEY` (both is fine too)
5. **No Quotes:** Don't put quotes around the key value

---

## 🔍 Check Current Directory

Always make sure you're in the right folder:
```bash
pwd
# Should show: /home/eman-aslam/MA/backend
```

If you're in wrong folder:
```bash
cd /home/eman-aslam/MA/backend
```

