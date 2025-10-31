Trust & Transparency with AI — Backend
======================================

Tech: FastAPI, Requests, BeautifulSoup, Google Gemini API, Firestore (with SQLite fallback)

Quick start
-----------

1) Create and activate a virtual environment

```bash
python -m venv .venv
.\.venv\Scripts\activate
```

2) Install dependencies

```bash
pip install -r requirements.txt
```

3) Set your Gemini API key (optional but recommended)

```bash
set GEMINI_API_KEY=your_api_key_here
```

If no key is set, the service still works with a heuristic fallback.

4) (Optional) Enable Firestore integration

To use Firestore (matching the main project's database), set these environment variables:

```bash
set FIRESTORE_ENABLED=true
set FIRESTORE_PROJECT_ID=academic-matchmaker-prod
set GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

If Firestore is not configured, the system automatically uses SQLite.

5) Run the server

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

API
---

- POST `/verify-professor`

Request body

```json
{ "name": "John Doe", "university": "MIT" }
```

Response body

```json
{
  "verified": true,
  "confidence_score": 87,
  "evidence_links": ["https://..."],
  "summary": "Professor is active in AI research at MIT with recent publications."
}
```

Database & Storage
-------------------

**Storage Options:**
1. **Firestore (Preferred)** - When enabled via `FIRESTORE_ENABLED=true`, verification history and professor lookup use Firestore collections matching the main project structure.
2. **SQLite (Fallback)** - Local SQLite file `data.db` with table `verify_history(id, name, university, verified, score, date)`.

**Professor Data Lookup:**
- Automatically searches Firestore collections: `professors`, `artifacts/*/public/data/professors`, or `users` (where `userType == 'professor'`)
- Uses existing professor profiles from Firestore to enhance verification accuracy
- Falls back gracefully if Firestore is not available

**Data Sources:**
- Wikipedia summary, Semantic Scholar author search, and DuckDuckGo HTML results provide evidence links.
- Gemini model `gemini-1.5-flash` is used for summarization when `GEMINI_API_KEY` is present.


