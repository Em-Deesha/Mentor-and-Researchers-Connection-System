# 🎯 EXACTLY What to Add in .env - Simple Explanation

## ✅ GOOD NEWS: You Only Need ONE Thing!

You ONLY need to add **ONE API key** (Gemini OR OpenAI). Everything else is **OPTIONAL**.

---

## 📋 What Each Line Means

### 🔴 REQUIRED (Choose ONE):
```bash
GEMINI_API_KEY=your_actual_key_here
# OR
OPENAI_API_KEY=your_actual_key_here
```
**You MUST add at least ONE of these for the app to work!**

### 🟡 OPTIONAL (Can Leave Empty):
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```
**You can LEAVE these empty!** They're only for saving chat history to a database.

---

## 📝 What is Supabase?

**Supabase** = A database service (like a digital filing cabinet)

**Do you need it?**
- ❌ **NO** - The app works perfectly without it!
- ✅ **Optional** - Only needed if you want to save chat history

**What happens without Supabase?**
- ✅ App works normally
- ✅ You can chat with agents
- ✅ You get responses
- ❌ Chat history won't be saved (but that's fine!)

---

## 🎯 SIMPLE: Minimum Configuration

**Just do this:**

```bash
cd /home/eman-aslam/MA/backend
nano .env
```

**Edit to look like this:**

```bash
# Get free Gemini key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=AIzaSyC_your_actual_key_paste_here

# Leave these empty - not needed!
SUPABASE_URL=
SUPABASE_KEY=

# Leave this as is
AI_PROVIDER=gemini

# Leave this empty if you don't have OpenAI
OPENAI_API_KEY=
```

**OR if you prefer OpenAI:**

```bash
# Get OpenAI key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_actual_key_paste_here

# Leave these empty - not needed!
SUPABASE_URL=
SUPABASE_KEY=

# Change to openai if using OpenAI
AI_PROVIDER=openai

# Leave this empty if you don't have Gemini
GEMINI_API_KEY=
```

---

## ✅ What You Actually Need

### Option 1: Gemini Only (Easiest - FREE)
```bash
GEMINI_API_KEY=your_actual_gemini_key_here
AI_PROVIDER=gemini
```
Leave everything else empty!

### Option 2: OpenAI Only
```bash
OPENAI_API_KEY=your_actual_openai_key_here
AI_PROVIDER=openai
```
Leave everything else empty!

---

## 🚫 What You Can IGNORE

**These are OPTIONAL - leave them empty:**
- `SUPABASE_URL=` ← Leave empty, not needed!
- `SUPABASE_KEY=` ← Leave empty, not needed!

**You don't need:**
- ❌ A Supabase account (unless you want database features)
- ❌ Both API keys (one is enough!)
- ❌ Database setup

---

## 📍 Step-by-Step: What to Add

### Step 1: Open the file
```bash
cd /home/eman-aslam/MA/backend
nano .env
```

### Step 2: Get Gemini API Key (Free)
1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

### Step 3: Paste It
Find this line:
```
GEMINI_API_KEY=your_gemini_api_key
```

Replace with:
```
GEMINI_API_KEY=AIzaSyC_your_copied_key_here
```

### Step 4: Leave Supabase Lines Empty
Just make them empty like this:
```
SUPABASE_URL=
SUPABASE_KEY=
```

### Step 5: Save
- `Ctrl+X`, then `Y`, then `Enter`

---

## 🎯 Summary

**Required:**
- ✅ ONE API key (Gemini OR OpenAI)

**Optional:**
- ⭕ Supabase (only if you want database features)

**You can use the app with JUST:**
```bash
GEMINI_API_KEY=your_key
AI_PROVIDER=gemini
```

Everything else can be empty! 🎉

---

## ✅ Quick Test

After adding your key, test:
```bash
cd /home/eman-aslam/MA/backend
source venv/bin/activate
python main.py
```

If it shows "healthy" status, you're good! ✅

