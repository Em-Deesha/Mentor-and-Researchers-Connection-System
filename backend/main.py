from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

from .verify_logic import verify_professor
from .database import init_db, insert_history


class ProfessorRequest(BaseModel):
    name: str = Field(..., min_length=2)
    university: str = Field(..., min_length=2)


class ProfessorResponse(BaseModel):
    verified: bool
    confidence_score: int = Field(ge=0, le=100)
    evidence_links: List[str]
    summary: str


app = FastAPI(title="Trust & Transparency with AI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.post("/verify-professor", response_model=ProfessorResponse)
def post_verify_professor(payload: ProfessorRequest):
    try:
        result = verify_professor(name=payload.name, university=payload.university)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    insert_history(
        name=payload.name,
        university=payload.university,
        verified=result.get("verified", False),
        score=int(result.get("confidence_score", 0)),
    )

    return ProfessorResponse(
        verified=bool(result.get("verified", False)),
        confidence_score=int(result.get("confidence_score", 0)),
        evidence_links=list(result.get("evidence_links", [])),
        summary=str(result.get("summary", "")),
    )


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


