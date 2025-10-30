# 🔑 STEP-BY-STEP: Add Your Gemini API Key

## ⚠️ ERROR: "API key not valid"

Your `.env` file still has a placeholder key. Here's how to fix it:

---

## 📝 STEP 1: Get Your FREE Gemini API Key

1. **Open your browser** and go to:
   ```
   https://makersuite.google.com/app/apikey
   ```

2. **Sign in** with your Google account

3. **Click "Create API Key"** button

4. **Copy the key** (it will look like: `AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz`)

---

## ✏️ STEP 2: Add Key to Your .env File

### Open Terminal and run:
```bash
cd /home/eman-aslam/MA/backend
nano .env
```

### Find this line:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### Replace it with your actual key:
```
GEMINI_API_KEY=AIzaSyC_paste_your_real_key_here
```

**Important:**
- Paste your ACTUAL key (starts with `AIzaSy`)
- No spaces around the `=` sign
- No quotes around the key

### Save the file:
- Press `Ctrl+X`
- Press `Y` (to confirm)
- Press `Enter` (to save)

---

## 🔄 STEP 3: Restart Backend

**In the terminal where backend is running:**

1. **Stop the backend:**
   - Press `Ctrl+C`

2. **Start it again:**
   ```bash
   cd /home/eman-aslam/MA/backend
   source venv/bin/activate
   python main.py
   ```

3. **You should see:**
   ```
   INFO: Gemini LLM initialized successfully
   INFO: Application startup complete.
   ```

---

## ✅ STEP 4: Test It

1. **Go to:** http://localhost:5173
2. **Refresh the page** (F5)
3. **Select Skill Coach**
4. **Type:** "I want to learn generative AI guide me step by step what resources i follow"
5. **Click Send**

**It should work now!** 🎉

---

## 🔍 Verify Your Key Was Added

After editing `.env`, verify:
```bash
cd /home/eman-aslam/MA/backend
cat .env | grep GEMINI_API_KEY
```

You should see your actual key (partially visible is OK).

---

## ❌ Common Mistakes

1. **Copying placeholder text instead of real key** ❌
   - Make sure you copied the KEY from Google, not `your_gemini_api_key_here`

2. **Extra spaces** ❌
   - Wrong: `GEMINI_API_KEY = AIzaSy...`
   - Right: `GEMINI_API_KEY=AIzaSy...`

3. **Quotes around key** ❌
   - Wrong: `GEMINI_API_KEY="AIzaSy..."`
   - Right: `GEMINI_API_KEY=AIzaSy...`

4. **Not restarting backend** ❌
   - Backend loads keys on startup, must restart after changing `.env`

---

## 🚀 Quick Checklist

- [ ] Got API key from https://makersuite.google.com/app/apikey
- [ ] Opened `/home/eman-aslam/MA/backend/.env`
- [ ] Replaced `your_gemini_api_key_here` with real key
- [ ] Saved file (Ctrl+X, Y, Enter)
- [ ] Restarted backend (Ctrl+C, then `python main.py`)
- [ ] Tested in browser

**Do these steps and it will work!** ✅

