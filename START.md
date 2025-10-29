# 🚀 QUICK START GUIDE

## ⚠️ IMPORTANT: Start BOTH Servers!

This project needs **TWO servers** running at the same time.

---

## Step 1: Start Backend Server

**Option A - Using npm script:**
```bash
npm run start:backend
```

**Option B - Manual:**
```bash
cd rag-backend
npm start
```

**✅ Success looks like:**
```
🚀 Production RAG Backend (Fallback) running on port 3003
📡 Smart matching endpoint: http://localhost:3003/smart-match
💚 Health check: http://localhost:3003/health
```

---

## Step 2: Start Frontend Server

**In a NEW terminal:**
```bash
npm run dev
```

**✅ Success looks like:**
```
➜  Local:   http://localhost:3000/
```

---

## Step 3: Open Browser

Go to: **http://localhost:3000**

---

## 🔧 Quick Troubleshooting

### Error: "Backend server is not responding"
**Fix:** Run Step 1 first! Backend must be running before frontend.

### Check if backend is running:
```bash
curl http://localhost:3003/health
```
If you see JSON, backend is running ✅

---

## 🎯 One Command to Start Both (Advanced)

```bash
npm run start:all
```

This starts both servers together. Requires `concurrently` package.

---

## 📝 Notes

- Backend runs on port **3003**
- Frontend runs on port **3000** (or next available)
- Both must be running for the app to work
- Keep both terminals open while developing

