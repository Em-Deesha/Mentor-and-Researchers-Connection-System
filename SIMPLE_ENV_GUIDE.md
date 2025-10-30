# 🎯 SUPER SIMPLE: What to Add in .env

## ✅ ONLY ONE THING REQUIRED!

**You ONLY need to add ONE API key.** Everything else is optional!

---

## 📝 What I Updated

I just updated your `.env` file with clear comments. Now it looks like this:

```bash
# 🔴 REQUIRED: Get FREE Gemini key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# 🟡 OPTIONAL: Leave empty
OPENAI_API_KEY=

# ✅ Keep this as is
AI_PROVIDER=gemini

# 🟡 OPTIONAL: Leave empty (not needed!)
SUPABASE_URL=
SUPABASE_KEY=
```

---

## 🎯 What Supabase Is (You Don't Need It!)

**Supabase** = A database (storage for chat history)

**Do you need it?**
- ❌ **NO!** Leave it empty!
- The app works perfectly without it

**What it does:**
- Saves your chat history (optional feature)
- Without it: App still works, you just can't save chats (that's fine!)

**Bottom line:** Just leave `SUPABASE_URL=` and `SUPABASE_KEY=` empty!

---

## ✏️ What You Need to Do

### Step 1: Get Gemini API Key (Free - 2 minutes)
1. Go to: **https://makersuite.google.com/app/apikey**
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

### Step 2: Edit .env File
```bash
cd /home/eman-aslam/MA/backend
nano .env
```

### Step 3: Replace ONE Line

Find this line:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Change to (paste your actual key):
```
GEMINI_API_KEY=AIzaSyC_your_actual_copied_key_here
```

**That's it!** Leave everything else as-is!

### Step 4: Save
- Press `Ctrl+X`
- Press `Y`
- Press `Enter`

---

## ✅ Final .env File Should Look Like

```bash
GEMINI_API_KEY=AIzaSyC_abcd1234efgh5678ijkl  # ← Your actual key here
OPENAI_API_KEY=                              # ← Leave empty
AI_PROVIDER=gemini                            # ← Keep as is
SUPABASE_URL=                                 # ← Leave empty
SUPABASE_KEY=                                 # ← Leave empty
```

---

## 🚀 Then Start the App

```bash
cd /home/eman-aslam/MA/backend
source venv/bin/activate
python main.py
```

If you see "healthy" status, you're done! ✅

---

## 📋 Summary

| Item | Required? | What to Do |
|------|-----------|------------|
| `GEMINI_API_KEY` | ✅ **YES** | Add your key |
| `OPENAI_API_KEY` | ❌ Optional | Leave empty |
| `AI_PROVIDER` | ✅ Yes | Keep as "gemini" |
| `SUPABASE_URL` | ❌ Optional | Leave empty |
| `SUPABASE_KEY` | ❌ Optional | Leave empty |

**Just add the Gemini API key and you're done!** 🎉

