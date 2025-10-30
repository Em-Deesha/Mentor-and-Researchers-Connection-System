# 🎯 ADD YOUR API KEY NOW - Simple Instructions

## ✅ File Created!

The `.env` file has been created at:
```
/home/eman-aslam/MA/backend/.env
```

---

## 📝 Step 1: Edit the File

```bash
cd /home/eman-aslam/MA/backend
nano .env
```

---

## 🔑 Step 2: Add Your API Key

### Option A: Gemini API Key (FREE - Recommended)

1. **Get your free API key:**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key

2. **Add to .env file:**
   Find this line:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ```
   
   Replace with your actual key:
   ```
   GEMINI_API_KEY=AIzaSyC_your_actual_key_here
   ```

### Option B: OpenAI API Key (Has Free Tier)

1. **Get your API key:**
   - Go to: https://platform.openai.com/api-keys
   - Sign in/Sign up
   - Click "Create new secret key"
   - Copy the key

2. **Add to .env file:**
   Find this line:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```
   
   Replace with your actual key:
   ```
   OPENAI_API_KEY=sk-your_actual_key_here
   ```

---

## 💾 Step 3: Save

1. Press `Ctrl+X`
2. Press `Y` (to confirm)
3. Press `Enter` (to save)

---

## ✅ Step 4: Verify

```bash
cd /home/eman-aslam/MA/backend
cat .env | grep API_KEY
```

You should see your key (partially visible).

---

## 🚀 You're Done!

Now your app will work! Start it with:
```bash
cd /home/eman-aslam/MA/backend
source venv/bin/activate
python main.py
```

---

## 📍 Quick Reference

**File Location:** `/home/eman-aslam/MA/backend/.env`

**Minimum Required:**
- Either `GEMINI_API_KEY=your-key` OR
- `OPENAI_API_KEY=your-key`

**Both Optional:**
- `SUPABASE_URL=` (can leave empty)
- `SUPABASE_KEY=` (can leave empty)

**That's it!** Just add ONE API key and you're ready to go! 🎉

