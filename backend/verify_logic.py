import os
import json
from typing import Dict, List, Tuple, Optional

import requests
from bs4 import BeautifulSoup

from .database import get_professor_from_firestore


def _safe_get_json(url: str, headers: Dict[str, str] | None = None, params: Dict[str, str] | None = None) -> dict:
    try:
        resp = requests.get(url, headers=headers or {}, params=params or {}, timeout=15)
        if resp.status_code == 200:
            return resp.json()
    except Exception:
        return {}
    return {}


def fetch_wikipedia_summary(name: str, university: str) -> Tuple[str, List[str]]:
    query = f"{name} {university}"
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{requests.utils.quote(query)}"
    data = _safe_get_json(url)
    evidence: List[str] = []
    text = ""
    if data.get("extract"):
        text = str(data.get("extract"))
    if data.get("content_urls", {}).get("desktop", {}).get("page"):
        evidence.append(data["content_urls"]["desktop"]["page"])
    return text, evidence


def fetch_semantic_scholar(name: str) -> Tuple[str, List[str]]:
    # Public author search endpoint (rate-limited but free)
    url = "https://api.semanticscholar.org/graph/v1/author/search"
    params = {"query": name, "limit": "5", "fields": "name,affiliations,url"}
    data = _safe_get_json(url, params=params)
    text_parts: List[str] = []
    evidence: List[str] = []
    for item in (data.get("data") or [])[:5]:
        display = item.get("name", "")
        aff = ", ".join(item.get("affiliations") or [])
        if display:
            text_parts.append(f"Author: {display} | Affiliations: {aff}")
        if item.get("url"):
            evidence.append(item["url"])
    return "\n".join(text_parts), evidence


def search_duckduckgo(query: str) -> List[str]:
    # Simple, free HTML search as a stand-in for Google results
    url = "https://duckduckgo.com/html/"
    try:
        resp = requests.post(url, data={"q": query}, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        links: List[str] = []
        for a in soup.select("a.result__a"):
            href = a.get("href")
            if href and href.startswith("http"):
                links.append(href)
        return links[:10]
    except Exception:
        return []


def _call_gemini(prompt: str) -> dict | None:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        res = model.generate_content(prompt)
        text = (res.text or "").strip()
        # Expect JSON in the reply; try to parse
        try:
            return json.loads(text)
        except Exception:
            # Attempt to extract JSON block
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                return json.loads(text[start : end + 1])
            return None
    except Exception:
        return None


def verify_professor(name: str, university: str) -> Dict[str, object]:
    # First, try to get existing professor data from Firestore (if available)
    firestore_professor: Optional[Dict] = get_professor_from_firestore(name, university)
    
    # Gather evidence from external sources
    wiki_text, wiki_links = fetch_wikipedia_summary(name, university)
    s2_text, s2_links = fetch_semantic_scholar(name)
    ddg_links = search_duckduckgo(f"{name} {university} professor publications")

    evidence_links: List[str] = []
    for link in wiki_links + s2_links + ddg_links:
        if link not in evidence_links:
            evidence_links.append(link)

    # Build context including Firestore data if available
    firestore_context = ""
    if firestore_professor:
        firestore_context = (
            f"\nExisting Profile in Database:\n"
            f"Name: {firestore_professor.get('name', name)}\n"
            f"University: {firestore_professor.get('university', university)}\n"
            f"Department: {firestore_professor.get('department', 'N/A')}\n"
            f"Research Area: {firestore_professor.get('researchArea', 'N/A')}\n"
            f"Title: {firestore_professor.get('title', 'N/A')}\n\n"
        )
    
    compiled_context = (
        f"Name: {name}\nUniversity: {university}\n{firestore_context}"
        f"Wikipedia:\n{wiki_text or '[none]'}\n\n"
        f"Semantic Scholar:\n{s2_text or '[none]'}\n\n"
        f"Top Links:\n" + "\n".join(evidence_links)
    )

    instruction = (
        "You are verifying whether a person is a real and active professor. "
        "Use the provided context (Wikipedia, Semantic Scholar, web links). "
        "Return STRICT JSON with keys: verified (bool), confidence_score (0-100), summary (string)."
    )

    prompt = (
        f"{instruction}\n\nCONTEXT\n-----\n{compiled_context}\n\n"
        "JSON ONLY RESPONSE EXAMPLE:\n"
        "{\n  \"verified\": true,\n  \"confidence_score\": 87,\n  \"summary\": \"Professor is active in AI research at MIT with recent publications.\"\n}"
    )

    ai_json = _call_gemini(prompt)

    if ai_json is None:
        # Fallback heuristic
        score = 0
        if wiki_text:
            score += 40
        if s2_text:
            score += 40
        if len(evidence_links) >= 3:
            score += 20
        score = max(0, min(100, score))
        verified = score >= 60
        summary = (
            "Heuristic result (no AI key). "
            + ("Likely professor based on sources." if verified else "Insufficient evidence.")
        )
        return {
            "verified": verified,
            "confidence_score": score,
            "evidence_links": evidence_links[:10],
            "summary": summary,
        }

    verified = bool(ai_json.get("verified", False))
    try:
        score = int(ai_json.get("confidence_score", 0))
    except Exception:
        score = 0
    summary = str(ai_json.get("summary", ""))

    score = max(0, min(100, score))

    return {
        "verified": verified,
        "confidence_score": score,
        "evidence_links": evidence_links[:10],
        "summary": summary,
    }


