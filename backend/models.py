from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class MentorshipRequest(BaseModel):
    agent_type: str = Field(..., description="Type of agent: skill_coach, career_guide, writing_agent, networking_agent")
    query: str = Field(..., description="User's question or request")
    user_id: Optional[str] = Field(None, description="Optional user ID for tracking")
    preferred_provider: Optional[str] = Field(None, description="Preferred AI provider: openai or gemini")
    session_id: Optional[str] = Field(None, description="Conversation session ID for chat history")

class MentorshipResponse(BaseModel):
    success: bool
    agent_type: str
    agent_name: str
    response: str
    session_id: Optional[str] = None
    ai_provider: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    resources: Optional[List[Dict[str, Any]]] = None
    opportunities: Optional[List[Dict[str, Any]]] = None
    events: Optional[List[Dict[str, Any]]] = None
    writing_type: Optional[str] = None
    error: Optional[str] = None

class AgentInfo(BaseModel):
    name: str
    description: str
    type: str

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    available_agents: List[str]
    ai_providers_configured: List[str]
