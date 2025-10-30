"""
In-Memory Conversation History Manager
Free solution - stores conversation history in memory
"""

from typing import Dict, List, Optional
from datetime import datetime
import uuid
import logging

logger = logging.getLogger(__name__)


class ConversationManager:
    """Manages conversation history in memory (free, no database needed)"""
    
    def __init__(self):
        # Store conversations: {session_id: List[messages]}
        self.conversations: Dict[str, List[Dict]] = {}
        # Store session metadata
        self.session_metadata: Dict[str, Dict] = {}
        # Cleanup old conversations (keep last 100 sessions)
        self.max_sessions = 100
    
    def create_session(self, user_id: Optional[str] = None, agent_type: str = "skill_coach") -> str:
        """Create a new conversation session"""
        session_id = str(uuid.uuid4())
        self.conversations[session_id] = []
        self.session_metadata[session_id] = {
            "user_id": user_id,
            "agent_type": agent_type,
            "created_at": datetime.utcnow().isoformat(),
            "message_count": 0
        }
        
        # Cleanup old sessions if too many
        if len(self.conversations) > self.max_sessions:
            self._cleanup_old_sessions()
        
        logger.info(f"Created new conversation session: {session_id[:8]}")
        return session_id
    
    def add_message(self, session_id: str, role: str, content: str, metadata: Optional[Dict] = None):
        """Add a message to conversation history"""
        if session_id not in self.conversations:
            # Auto-create session if doesn't exist
            self.create_session()
        
        message = {
            "role": role,  # "user" or "assistant"
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": metadata or {}
        }
        
        self.conversations[session_id].append(message)
        self.session_metadata[session_id]["message_count"] = len(self.conversations[session_id])
        
        logger.debug(f"Added {role} message to session {session_id[:8]}")
    
    def get_history(self, session_id: str, limit: int = 20) -> List[Dict]:
        """Get conversation history for a session"""
        if session_id not in self.conversations:
            return []
        
        # Return last N messages
        return self.conversations[session_id][-limit:]
    
    def get_history_for_llm(self, session_id: str, limit: int = 10) -> List[Dict]:
        """Get conversation history formatted for LLM (last N exchanges)"""
        history = self.get_history(session_id, limit * 2)  # Get more to ensure pairs
        
        formatted = []
        for msg in history:
            formatted.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        return formatted
    
    def clear_session(self, session_id: str):
        """Clear conversation history for a session"""
        if session_id in self.conversations:
            self.conversations[session_id] = []
            self.session_metadata[session_id]["message_count"] = 0
            logger.info(f"Cleared session {session_id[:8]}")
    
    def _cleanup_old_sessions(self):
        """Remove oldest sessions if we have too many"""
        if len(self.conversations) <= self.max_sessions:
            return
        
        # Sort by creation time and remove oldest
        sessions_by_time = sorted(
            self.session_metadata.items(),
            key=lambda x: x[1].get("created_at", ""),
            reverse=False
        )
        
        to_remove = len(self.conversations) - self.max_sessions
        for session_id, _ in sessions_by_time[:to_remove]:
            del self.conversations[session_id]
            del self.session_metadata[session_id]
        
        logger.info(f"Cleaned up {to_remove} old sessions")


# Global conversation manager instance
conversation_manager = ConversationManager()

