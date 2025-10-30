"""
Updated Agent System using LangChain for multi-agent orchestration
This maintains backward compatibility while adding LangChain capabilities
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from database import db
from langchain_agents import run_agent_workflow, get_agent_name
import logging
import traceback

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Base agent class - now uses LangChain backend"""
    def __init__(self, agent_type: str, name: str, description: str):
        self.agent_type = agent_type
        self.name = name
        self.description = description

    @abstractmethod
    def get_system_prompt(self) -> str:
        """Get system prompt for the agent"""
        pass

    async def process_query(self, query: str, user_id: Optional[str] = None, preferred_provider: Optional[str] = None, session_id: Optional[str] = None, conversation_history: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """Process query using LangChain workflow with conversation history"""
        try:
            result = await run_agent_workflow(
                agent_type=self.agent_type,
                query=query,
                user_id=user_id,
                preferred_provider=preferred_provider,
                session_id=session_id,
                conversation_history=conversation_history
            )
            return result
        except Exception as e:
            logger.error(f"Error in process_query for {self.agent_type}: {e}", exc_info=True)
            raise

    async def generate_response(self, query: str, user_id: Optional[str] = None, preferred_provider: Optional[str] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate response with conversation history and database logging"""
        try:
            from conversation_manager import conversation_manager
            
            # Get or create session
            if not session_id:
                session_id = conversation_manager.create_session(user_id, self.agent_type)
            else:
                # Ensure session exists
                if session_id not in conversation_manager.conversations:
                    conversation_manager.create_session(user_id, self.agent_type)
                    # Use existing session_id but reset if needed
            
            # Get conversation history
            conversation_history = conversation_manager.get_history_for_llm(session_id, limit=10)
            
            # Add user message to history
            conversation_manager.add_message(session_id, "user", query)
            
            # Get response from LangChain workflow with history
            result = await self.process_query(
                query=query,
                user_id=user_id,
                preferred_provider=preferred_provider,
                session_id=session_id,
                conversation_history=conversation_history
            )
            
            if not result.get("success", False):
                return result

            # Add assistant response to history
            if result.get("response"):
                conversation_manager.add_message(
                    session_id,
                    "assistant",
                    result.get("response", ""),
                    metadata={"agent_type": self.agent_type, "ai_provider": result.get("ai_provider")}
                )

            # Save to database (optional)
            try:
                db_session_id = await db.create_session(
                    user_id=user_id,
                    agent_type=self.agent_type,
                    query=query,
                    response=result.get("response", ""),
                    ai_provider=result.get("ai_provider", "unknown"),
                    metadata=result.get("metadata", {})
                )
                # Use conversation session_id
                result["session_id"] = session_id
            except Exception as db_error:
                logger.warning(f"Database error (non-fatal): {db_error}")
                result["session_id"] = session_id  # Use conversation session_id anyway

            # Update user history
            if user_id:
                try:
                    await db.update_user_history(user_id, self.agent_type)
                except Exception as history_error:
                    logger.warning(f"History update error (non-fatal): {history_error}")

            return result

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Error in generate_response for {self.agent_type}: {error_msg}\n{traceback.format_exc()}")
            return {
                "success": False,
                "error": error_msg,
                "agent_type": self.agent_type,
                "agent_name": self.name,
                "response": f"I apologize, but I encountered an error: {error_msg}. Please try again."
            }


class SkillCoachAgent(BaseAgent):
    """Skill Coach Agent - Recommends courses and learning resources"""
    def __init__(self):
        super().__init__(
            agent_type="skill_coach",
            name="Skill Coach",
            description="Recommends online courses, tutorials, and learning resources"
        )

    def get_system_prompt(self) -> str:
        return """You are an expert Skill Coach AI agent specializing in recommending online courses and learning resources for students and researchers.

Your role:
- Analyze the user's learning goals and current skill level
- Recommend specific online courses, tutorials, certifications, and learning platforms
- Suggest a learning path with beginner to advanced resources
- Provide practical advice on skill development
- Include both free and paid resources with clear distinctions

Format your response as:
1. Brief analysis of their learning needs
2. Recommended resources (3-5 specific courses/platforms)
3. Learning path suggestion
4. Practical tips for effective learning

For each resource, mention:
- Platform name (Coursera, Udemy, edX, YouTube, etc.)
- Course/resource title
- Difficulty level
- Estimated time commitment
- Whether it's free or paid
- Why it's relevant to their goal

Be encouraging, practical, and specific. Prioritize quality resources from reputable platforms."""


class CareerGuideAgent(BaseAgent):
    """Career Guide Agent - Advises on scholarships and opportunities"""
    def __init__(self):
        super().__init__(
            agent_type="career_guide",
            name="Career Guide",
            description="Advises on scholarships, fellowships, and international opportunities"
        )

    def get_system_prompt(self) -> str:
        return """You are an expert Career Guide AI agent specializing in scholarships, fellowships, and international academic opportunities for students and researchers.

Your role:
- Guide students on scholarship opportunities (both local and international)
- Advise on fellowship programs and research grants
- Provide information on international opportunities and study abroad programs
- Help with career planning in academia and research
- Suggest networking strategies and professional development

Format your response as:
1. Understanding of their career goals and background
2. Relevant scholarship/fellowship opportunities (3-5 specific programs)
3. Eligibility requirements and application tips
4. Timeline and deadlines awareness
5. Additional career advancement strategies

For each opportunity, mention:
- Program name and organization
- Target audience (undergrad, grad, postdoc, etc.)
- Geographic scope (Pakistan, regional, international)
- Funding amount/benefits (if known)
- Key eligibility criteria
- Application period (if known)
- Website or how to apply

Be realistic, encouraging, and provide actionable advice. Emphasize opportunities suitable for Pakistani students when relevant."""


class WritingAgent(BaseAgent):
    """Writing Agent - Helps with academic writing"""
    def __init__(self):
        super().__init__(
            agent_type="writing_agent",
            name="Writing Assistant",
            description="Helps with abstracts, CVs, research papers, and academic writing"
        )

    def get_system_prompt(self) -> str:
        return """You are an expert Writing Assistant AI agent specializing in academic and professional writing for students and researchers.

Your role:
- Help write and improve research paper abstracts
- Assist with CV/resume writing for academic positions
- Guide on writing research proposals and papers
- Provide feedback on structure, clarity, and academic style
- Suggest improvements for grammar, flow, and impact

Format your response based on the request:

For ABSTRACTS:
1. Analyze the provided content or topic
2. Suggest structure (Background, Methods, Results, Conclusion)
3. Provide a draft or improvements
4. Highlight key points to emphasize

For CVs/RESUMES:
1. Assess the content provided
2. Suggest optimal structure and sections
3. Recommend how to highlight achievements
4. Provide specific wording improvements

For RESEARCH PAPERS:
1. Discuss structure and organization
2. Suggest improvements for clarity and flow
3. Recommend relevant sections to strengthen
4. Provide writing tips for academic style

For PROPOSALS:
1. Help structure the proposal logically
2. Suggest how to make the case compelling
3. Provide tips on addressing requirements
4. Offer language improvements

Be constructive, specific, and educational. Explain WHY certain changes improve the writing."""


class NetworkingAgent(BaseAgent):
    """Networking Agent - Suggests conferences and events"""
    def __init__(self):
        super().__init__(
            agent_type="networking_agent",
            name="Networking Guide",
            description="Suggests conferences, events, and networking opportunities"
        )

    def get_system_prompt(self) -> str:
        return """You are an expert Networking Guide AI agent specializing in helping students and researchers build their professional network and find relevant events.

Your role:
- Recommend academic conferences in their field
- Suggest workshops, seminars, and webinars
- Advise on networking strategies for early-career researchers
- Guide on professional societies and organizations to join
- Suggest online communities and platforms for their field

Format your response as:
1. Understanding of their research area and career stage
2. Recommended conferences and events (3-5 specific ones)
3. Professional organizations to join
4. Online communities and platforms
5. Networking tips and strategies

For each event/conference, mention:
- Event name and type
- Field/discipline
- Typical location (virtual, regional, international)
- Frequency (annual, biennial, etc.)
- Target audience (students welcome, etc.)
- Approximate timing or season
- Why it's relevant for them

For organizations:
- Name and focus area
- Benefits of membership
- Student membership availability
- How to join

Be encouraging about networking, provide realistic opportunities, and include both in-person and virtual options. Consider opportunities accessible to Pakistani students."""


class AgentFactory:
    _agents = {
        "skill_coach": SkillCoachAgent(),
        "career_guide": CareerGuideAgent(),
        "writing_agent": WritingAgent(),
        "networking_agent": NetworkingAgent()
    }

    @classmethod
    def get_agent(cls, agent_type: str) -> BaseAgent:
        agent = cls._agents.get(agent_type)
        if not agent:
            raise ValueError(f"Unknown agent type: {agent_type}")
        return agent

    @classmethod
    def get_all_agents(cls) -> Dict[str, Dict[str, str]]:
        return {
            agent_type: {
                "name": agent.name,
                "description": agent.description,
                "type": agent.agent_type
            }
            for agent_type, agent in cls._agents.items()
        }
