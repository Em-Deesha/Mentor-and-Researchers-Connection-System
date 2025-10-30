from supabase import create_client, Client
from config import settings
from typing import Optional, Dict, Any, List
from datetime import datetime

class DatabaseManager:
    def __init__(self):
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            self.enabled = True
        else:
            self.client = None
            self.enabled = False
            import logging
            logger = logging.getLogger(__name__)
            logger.warning("Supabase not configured. Database features disabled.")

    async def create_session(
        self,
        user_id: Optional[str],
        agent_type: str,
        query: str,
        response: str,
        ai_provider: str,
        metadata: Dict[str, Any]
    ) -> str:
        if not self.enabled:
            return "no-db-" + str(hash(f"{user_id}{agent_type}{query}") % 1000000)
        result = self.client.table("mentorship_sessions").insert({
            "user_id": user_id,
            "agent_type": agent_type,
            "query": query,
            "response": response,
            "ai_provider": ai_provider,
            "metadata": metadata
        }).execute()
        return result.data[0]["id"]

    async def create_resource(
        self,
        session_id: str,
        resource_type: str,
        title: str,
        description: Optional[str],
        url: Optional[str],
        provider: Optional[str],
        relevance_score: float
    ):
        if not self.enabled:
            return
        self.client.table("mentorship_resources").insert({
            "session_id": session_id,
            "resource_type": resource_type,
            "title": title,
            "description": description,
            "url": url,
            "provider": provider,
            "relevance_score": relevance_score
        }).execute()

    async def update_user_history(
        self,
        user_id: str,
        agent_type: str,
        preferences: Optional[Dict[str, Any]] = None
    ):
        if not self.enabled:
            return
        existing = self.client.table("user_mentorship_history")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("agent_type", agent_type)\
            .maybe_single()\
            .execute()

        if existing.data:
            self.client.table("user_mentorship_history")\
                .update({
                    "interaction_count": existing.data["interaction_count"] + 1,
                    "last_interaction": datetime.utcnow().isoformat(),
                    "preferences": preferences or existing.data["preferences"],
                    "updated_at": datetime.utcnow().isoformat()
                })\
                .eq("id", existing.data["id"])\
                .execute()
        else:
            self.client.table("user_mentorship_history").insert({
                "user_id": user_id,
                "agent_type": agent_type,
                "interaction_count": 1,
                "preferences": preferences or {}
            }).execute()

    async def get_user_sessions(self, user_id: str, agent_type: Optional[str] = None) -> List[Dict[str, Any]]:
        query = self.client.table("mentorship_sessions").select("*").eq("user_id", user_id)
        if agent_type:
            query = query.eq("agent_type", agent_type)
        result = query.order("created_at", desc=True).limit(10).execute()
        return result.data

    async def get_session_resources(self, session_id: str) -> List[Dict[str, Any]]:
        result = self.client.table("mentorship_resources")\
            .select("*")\
            .eq("session_id", session_id)\
            .order("relevance_score", desc=True)\
            .execute()
        return result.data

db = DatabaseManager()
