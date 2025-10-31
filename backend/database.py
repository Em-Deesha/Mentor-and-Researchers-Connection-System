import os
import sqlite3
from datetime import datetime
from typing import Optional, Dict, Any, List

# Try to import Firestore (optional dependency)
try:
    from google.cloud import firestore
    from google.oauth2 import service_account
    FIRESTORE_AVAILABLE = True
except ImportError:
    FIRESTORE_AVAILABLE = False

# SQLite fallback
DB_PATH = os.path.join(os.path.dirname(__file__), "data.db")

# Firestore configuration (optional)
FIRESTORE_ENABLED = os.getenv("FIRESTORE_ENABLED", "false").lower() == "true"
FIRESTORE_CREDENTIALS_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
FIRESTORE_PROJECT_ID = os.getenv("FIRESTORE_PROJECT_ID", "academic-matchmaker-prod")

# Initialize Firestore client (if enabled and available)
_firestore_client: Optional[Any] = None


def _init_firestore() -> Optional[Any]:
    """Initialize Firestore client if credentials are available."""
    if not FIRESTORE_ENABLED or not FIRESTORE_AVAILABLE:
        return None
    
    try:
        if FIRESTORE_CREDENTIALS_PATH and os.path.exists(FIRESTORE_CREDENTIALS_PATH):
            credentials = service_account.Credentials.from_service_account_file(
                FIRESTORE_CREDENTIALS_PATH
            )
            return firestore.Client(project=FIRESTORE_PROJECT_ID, credentials=credentials)
        else:
            # Try default credentials (for local development with gcloud auth)
            return firestore.Client(project=FIRESTORE_PROJECT_ID)
    except Exception as e:
        print(f"⚠️ Firestore initialization failed: {e}. Falling back to SQLite.")
        return None


def _get_firestore_client():
    """Get or initialize Firestore client."""
    global _firestore_client
    if _firestore_client is None:
        _firestore_client = _init_firestore()
    return _firestore_client


def _get_conn() -> sqlite3.Connection:
    """Get SQLite connection (fallback)."""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize database (SQLite and/or Firestore)."""
    # Always initialize SQLite as fallback
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = _get_conn()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS verify_history (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              university TEXT NOT NULL,
              verified INTEGER NOT NULL,
              score INTEGER NOT NULL,
              date TEXT NOT NULL
            )
            """
        )
        conn.commit()
    finally:
        conn.close()
    
    # Try to initialize Firestore if enabled
    if FIRESTORE_ENABLED:
        client = _get_firestore_client()
        if client:
            print("✅ Firestore initialized successfully")
        else:
            print("⚠️ Firestore not available, using SQLite only")


def insert_history(name: str, university: str, verified: bool, score: int) -> None:
    """Insert verification history into database (Firestore preferred, SQLite fallback)."""
    timestamp = datetime.utcnow()
    
    # Try Firestore first if enabled
    firestore_client = _get_firestore_client()
    if firestore_client:
        try:
            # Store in Firestore collection: verify_history
            doc_ref = firestore_client.collection("verify_history").document()
            doc_ref.set({
                "name": name,
                "university": university,
                "verified": verified,
                "score": int(score),
                "date": timestamp,
                "timestamp": timestamp
            })
            return  # Successfully saved to Firestore
        except Exception as e:
            print(f"⚠️ Firestore save failed: {e}. Falling back to SQLite.")
    
    # Fallback to SQLite
    conn = _get_conn()
    try:
        conn.execute(
            "INSERT INTO verify_history (name, university, verified, score, date) VALUES (?, ?, ?, ?, ?)",
            (name, university, 1 if verified else 0, int(score), timestamp.isoformat()),
        )
        conn.commit()
    finally:
        conn.close()


def get_professor_from_firestore(name: str, university: str) -> Optional[Dict[str, Any]]:
    """Try to get professor data from Firestore if available.
    
    Searches in collections:
    - professors
    - artifacts/academic-match-production/public/data/professors
    - artifacts/academic-matchmaker-prod/public/data/professors
    - users (where userType == 'professor')
    
    Returns first matching professor document or None.
    """
    firestore_client = _get_firestore_client()
    if not firestore_client:
        return None
    
    # Possible collection paths (from existing codebase pattern)
    collection_paths = [
        "professors",
        "artifacts/academic-match-production/public/data/professors",
        "artifacts/academic-matchmaker-prod/public/data/professors",
    ]
    
    # Search in professor collections
    for collection_path in collection_paths:
        try:
            # Handle nested collection path (e.g., "artifacts/app_id/public/data/professors")
            if "/" in collection_path:
                path_parts = collection_path.split("/")
                # Navigate through nested collections: collection -> doc -> collection -> doc -> ...
                ref = firestore_client.collection(path_parts[0])
                for i in range(1, len(path_parts) - 1, 2):
                    if i + 1 < len(path_parts):
                        ref = ref.document(path_parts[i]).collection(path_parts[i + 1])
                    else:
                        break
                # Last part is the final collection name
                if len(path_parts) % 2 == 0:
                    ref = ref.document(path_parts[-2]).collection(path_parts[-1])
                else:
                    ref = ref.collection(path_parts[-1])
            else:
                # Simple collection path
                ref = firestore_client.collection(collection_path)
            
            # Query by name and university
            # Note: Firestore queries are case-sensitive, so exact matches are required
            query = ref.where("name", "==", name).where("university", "==", university).limit(1)
            docs = list(query.stream())
            
            if docs:
                doc = docs[0]
                return {"id": doc.id, **doc.to_dict()}
        except Exception as e:
            # Skip this path and try next
            continue
    
    # Fallback: search in users collection
    try:
        users_ref = firestore_client.collection("users")
        query = users_ref.where("userType", "==", "professor").where("name", "==", name).where("university", "==", university).limit(1)
        for doc in query.stream():
            return {"id": doc.id, **doc.to_dict()}
    except Exception:
        pass
    
    return None


