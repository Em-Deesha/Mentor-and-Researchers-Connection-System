# Mentor-and-Researchers-Connection-System

## Trust & Transparency with AI Module

A standalone sub-project module that verifies whether a professor profile is real and active using free data sources and Gemini (free tier) for summarization.

### Structure

```
TT with AI/
├── backend/
│   ├── main.py
│   ├── verify_logic.py
│   ├── database.py
│   ├── requirements.txt
│   └── README.md
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── README.md
```

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

# Optional (recommended): Gemini free API key
set GEMINI_API_KEY=your_api_key_here

uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (React + Vite)

```bash
cd frontend
npm install

# Optional: point to backend (default http://localhost:8000)
echo VITE_BACKEND_URL=http://localhost:8000 > .env

npm run dev
```

### Usage

1. Open the frontend dev server (usually http://localhost:5173)
2. Enter Professor Name and University
3. Click Verify to see verification status, confidence score, and evidence links

### APIs and Data Sources

- Wikipedia REST Summary
- Semantic Scholar Author Search
- DuckDuckGo HTML results (as a free alternative for general web evidence)
- Gemini `gemini-1.5-flash` for summarization (free tier key)

### Database

**Firestore Integration (Recommended):**
This module integrates with the main project's Firestore database for professors:
- Reads existing professor profiles from Firestore collections
- Stores verification history in Firestore (collection: `verify_history`)
- Searches collections: `professors`, `artifacts/*/public/data/professors`, or `users` where `userType == 'professor'`

**Setup Firestore (Optional):**
```bash
set FIRESTORE_ENABLED=true
set FIRESTORE_PROJECT_ID=academic-matchmaker-prod
set GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

**SQLite Fallback:**
If Firestore is not configured, the system automatically uses SQLite. File `backend/data.db` with table `verify_history(id, name, university, verified, score, date)` is created on first run.

### Notes

- No paid APIs are used. If `GEMINI_API_KEY` is not set, a heuristic fallback gives a best-effort score.
- CORS is enabled for local development.

### Contributed by

**Afsheen-se** (@Afsheen-se)
