"""
LangChain-based Multi-Agent Mentorship System
Uses LangGraph for orchestration and supports both OpenAI and Gemini
"""

from typing import Dict, Any, List, Optional, TypedDict, Annotated
try:
    from langchain.agents import AgentExecutor, create_openai_functions_agent
except ImportError:
    try:
        from langchain.agents.agent import AgentExecutor
        from langchain.agents import create_openai_functions_agent
    except ImportError:
        # Fallback - use simple chains without agent executor
        AgentExecutor = None
        create_openai_functions_agent = None
from langchain_openai import ChatOpenAI
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    LANGCHAIN_GEMINI_AVAILABLE = True
except ImportError:
    LANGCHAIN_GEMINI_AVAILABLE = False
    ChatGoogleGenerativeAI = None

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
import google.generativeai as genai
from langchain_core.messages import BaseMessage
from langchain_core.tools import Tool
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.runnables import RunnableConfig
import operator
import json
from config import settings
from database import db
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GraphState(TypedDict):
    """State for LangGraph agent workflow"""
    messages: Annotated[list, add_messages]
    agent_type: str
    query: str
    user_id: Optional[str]
    preferred_provider: Optional[str]
    response: Optional[str]
    metadata: Dict[str, Any]
    error: Optional[str]


class LangChainAgentManager:
    """Manages LangChain agents with multi-provider support"""
    
    def __init__(self):
        self.llm_openai = None
        self.llm_gemini = None
        self._initialize_llms()
    
    def _initialize_llms(self):
        """Initialize LLM instances for both providers"""
        try:
            if settings.OPENAI_API_KEY:
                self.llm_openai = ChatOpenAI(
                    model="gpt-3.5-turbo",
                    temperature=0.7,
                    api_key=settings.OPENAI_API_KEY,
                    max_tokens=2000
                )
                logger.info("OpenAI LLM initialized successfully")
        except Exception as e:
            logger.warning(f"Failed to initialize OpenAI LLM: {e}")
        
        try:
            if settings.GEMINI_API_KEY:
                # Use gemini-1.0-pro which is the stable model name
                self.llm_gemini = ChatGoogleGenerativeAI(
                    model="gemini-1.0-pro",
                    temperature=0.7,
                    google_api_key=settings.GEMINI_API_KEY,
                    max_output_tokens=2000
                )
                logger.info("Gemini LLM initialized successfully")
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini LLM: {e}")
    
    def get_llm(self, provider: Optional[str] = None):
        """Get LLM instance for specified provider with fallback"""
        if provider == "openai" and self.llm_openai:
            return self.llm_openai
        elif provider == "gemini" and self.llm_gemini:
            return self.llm_gemini
        
        # Fallback logic
        if self.llm_gemini:
            return self.llm_gemini
        elif self.llm_openai:
            return self.llm_openai
        else:
            raise ValueError("No LLM provider available. Please configure at least one API key.")
    
    def get_gemini_direct(self):
        """Get direct Gemini model (bypassing LangChain if needed)"""
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            # Try models that work with current API version
            models_to_try = ['models/gemini-1.5-flash-latest', 'models/gemini-1.5-pro-latest', 'models/gemini-1.5-flash', 'models/gemini-1.5-pro']
            for model_name in models_to_try:
                try:
                    model = genai.GenerativeModel(model_name)
                    # Test if it works
                    test_resp = model.generate_content("test")
                    logger.info(f"Using Gemini model: {model_name}")
                    return model
                except Exception as e:
                    logger.debug(f"Model {model_name} failed: {e}")
                    continue
            # Fallback - try without models/ prefix
            try:
                return genai.GenerativeModel('gemini-1.5-flash')
            except:
                return genai.GenerativeModel('gemini-1.5-pro')
        return None
    
    def get_provider_name(self, provider: Optional[str] = None) -> str:
        """Get the actual provider name being used"""
        if provider == "openai" and self.llm_openai:
            return "openai"
        elif provider == "gemini" and self.llm_gemini:
            return "gemini"
        
        if self.llm_gemini:
            return "gemini"
        elif self.llm_openai:
            return "openai"
        else:
            raise ValueError("No provider available")


# Global agent manager
agent_manager = LangChainAgentManager()


# Agent-specific tools and prompts

def get_skill_coach_tools() -> List[Tool]:
    """Tools for Skill Coach Agent"""
    return [
        Tool(
            name="search_courses",
            func=lambda query: f"Searching courses for: {query}",
            description="Search for online courses and learning resources"
        ),
        Tool(
            name="recommend_learning_path",
            func=lambda topic: f"Recommended learning path for: {topic}",
            description="Generate a structured learning path for a topic"
        )
    ]


def get_career_guide_tools() -> List[Tool]:
    """Tools for Career Guide Agent"""
    return [
        Tool(
            name="find_scholarships",
            func=lambda query: f"Searching scholarships for: {query}",
            description="Find relevant scholarships and funding opportunities"
        ),
        Tool(
            name="get_international_opportunities",
            func=lambda query: f"Searching international opportunities: {query}",
            description="Find study abroad and international programs"
        )
    ]


def get_writing_agent_tools() -> List[Tool]:
    """Tools for Writing Agent"""
    return [
        Tool(
            name="analyze_structure",
            func=lambda text: f"Analyzing structure of: {text[:50]}...",
            description="Analyze the structure of academic writing"
        ),
        Tool(
            name="suggest_improvements",
            func=lambda text: f"Suggesting improvements for: {text[:50]}...",
            description="Suggest improvements for academic writing"
        )
    ]


def get_networking_agent_tools() -> List[Tool]:
    """Tools for Networking Agent"""
    return [
        Tool(
            name="find_conferences",
            func=lambda query: f"Searching conferences for: {query}",
            description="Find academic conferences and events"
        ),
        Tool(
            name="recommend_networking_platforms",
            func=lambda field: f"Recommending platforms for: {field}",
            description="Recommend professional networking platforms"
        )
    ]


def get_system_prompt(agent_type: str) -> str:
    """Get system prompt for each agent type with detailed instructions"""
    prompts = {
        "skill_coach": """You are an EXPERT Skill Coach AI agent specializing in recommending online courses and learning resources. Provide COMPREHENSIVE, DETAILED responses like ChatGPT or Claude AI.

RESPONSE GUIDELINES:
- Be thorough and detailed (300-500 words for comprehensive questions)
- Provide SPECIFIC resource names, platforms, and links when possible
- Explain WHY each resource is recommended
- Structure responses clearly with sections and bullet points
- Include prerequisites, timelines, and next steps
- Offer multiple options when relevant
- Be encouraging and supportive

When recommending resources, ALWAYS include:
1. Specific platform/course names
2. Why they're recommended
3. What makes them effective
4. Prerequisites needed
5. Estimated time to complete
6. Concrete next steps

SPECIALIZATION: Online courses and learning resources for students and researchers.

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

Be encouraging, practical, and specific. Prioritize quality resources from reputable platforms.""",

        "career_guide": """You are an expert Career Guide AI agent specializing in scholarships, fellowships, and international academic opportunities for students and researchers.

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

Be realistic, encouraging, and provide actionable advice. Emphasize opportunities suitable for Pakistani students when relevant.""",

        "writing_agent": """You are an expert Writing Assistant AI agent specializing in academic and professional writing for students and researchers.

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

Be constructive, specific, and educational. Explain WHY certain changes improve the writing.""",

        "networking_agent": """You are an expert Networking Guide AI agent specializing in helping students and researchers build their professional network and find relevant events.

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
    }
    return prompts.get(agent_type, "You are a helpful AI assistant.")


def create_agent_chain(agent_type: str, provider: Optional[str] = None):
    """Create a LangChain agent chain for specific agent type"""
    try:
        provider_name = agent_manager.get_provider_name(provider)
        
        # For Gemini, use direct API instead of LangChain (more reliable)
        if provider_name == "gemini":
            logger.info(f"Using direct Gemini API for {agent_type}")
            return "direct_gemini"  # Special marker for direct API
        
        # For OpenAI, use LangChain
        llm = agent_manager.get_llm(provider)
        
        # Get tools for agent type
        tools_map = {
            "skill_coach": get_skill_coach_tools(),
            "career_guide": get_career_guide_tools(),
            "writing_agent": get_writing_agent_tools(),
            "networking_agent": get_networking_agent_tools()
        }
        
        tools = tools_map.get(agent_type, [])
        
        # Create prompt template
        system_prompt = get_system_prompt(agent_type)
        
        # Simplified prompt for better compatibility
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}")
        ])
        
        # Create agent chain
        # Try OpenAI functions agent if using OpenAI
        if provider_name == "openai" and tools and create_openai_functions_agent:
            try:
                # Create messages placeholder version for function calling
                prompt_with_tools = ChatPromptTemplate.from_messages([
                    ("system", system_prompt),
                    MessagesPlaceholder(variable_name="chat_history"),
                    ("human", "{input}"),
                    MessagesPlaceholder(variable_name="agent_scratchpad")
                ])
                agent = create_openai_functions_agent(llm, tools, prompt_with_tools)
                agent_executor = AgentExecutor(
                    agent=agent,
                    tools=tools,
                    verbose=False,
                    handle_parsing_errors=True,
                    max_iterations=3
                )
                logger.info(f"Created OpenAI functions agent for {agent_type}")
                return agent_executor
            except Exception as e:
                logger.warning(f"Failed to create OpenAI functions agent: {e}. Using simple chain.")
        
        # Fallback: Simple chain (works with OpenAI)
        chain = prompt | llm
        logger.info(f"Created simple chain for {agent_type} using {provider_name}")
        return chain
        
    except Exception as e:
        logger.error(f"Error creating agent chain: {e}", exc_info=True)
        raise


async def run_agent_workflow(
    agent_type: str,
    query: str,
    user_id: Optional[str] = None,
    preferred_provider: Optional[str] = None,
    session_id: Optional[str] = None,
    conversation_history: Optional[List[Dict]] = None
) -> Dict[str, Any]:
    """
    Run agent workflow using LangGraph for orchestration
    Supports conversation history for context
    """
    try:
        # Build context from conversation history
        context_prompt = ""
        if conversation_history and len(conversation_history) > 0:
            # Include last few exchanges for context
            recent_history = conversation_history[-6:]  # Last 3 exchanges (user + assistant pairs)
            context_lines = []
            for msg in recent_history:
                role = msg.get("role", "")
                content = msg.get("content", "")
                if role == "user":
                    context_lines.append(f"User: {content}")
                elif role == "assistant":
                    context_lines.append(f"Assistant: {content}")
            
            if context_lines:
                context_prompt = "\n\nPrevious conversation:\n" + "\n".join(context_lines) + "\n\nCurrent question:"
        
        # Initialize state
        initial_state: GraphState = {
            "messages": [HumanMessage(content=query)],
            "agent_type": agent_type,
            "query": query,
            "user_id": user_id,
            "preferred_provider": preferred_provider,
            "response": None,
            "metadata": {},
            "error": None
        }
        
        # Determine provider being used
        provider_used = agent_manager.get_provider_name(preferred_provider)
        
        # For Gemini, use REST API directly (most reliable)
        if provider_used == "gemini":
            try:
                import httpx
                import asyncio
                system_prompt = get_system_prompt(agent_type)
                
                # Include conversation history in prompt if available
                if conversation_history and len(conversation_history) > 0:
                    history_text = "\n\nPrevious conversation:\n"
                    recent = conversation_history[-6:]  # Last 3 exchanges
                    for msg in recent:
                        role = msg.get("role", "")
                        content = msg.get("content", "")
                        if role == "user":
                            history_text += f"User: {content}\n"
                        elif role == "assistant":
                            history_text += f"Assistant: {content}\n"
                    
                    full_prompt = f"{system_prompt}{history_text}\n\nCurrent question: {query}\n\nPlease provide a helpful response based on the conversation context."
                else:
                    full_prompt = f"{system_prompt}\n\nUser question: {query}\n\nPlease provide a helpful response."
                
                # Use REST API directly - try models available for this API key
                api_key = settings.GEMINI_API_KEY
                models_to_try = [
                    'gemini-2.5-flash',      # Latest available
                    'gemini-2.5-pro',
                    'gemini-2.0-flash',
                    'gemini-1.5-flash',
                    'gemini-1.5-pro'
                ]
                
                response_text = None
                last_error = None
                
                for model_name in models_to_try:
                    try:
                        url = f'https://generativelanguage.googleapis.com/v1/models/{model_name}:generateContent?key={api_key}'
                        data = {
                            "contents": [{
                                "parts": [{"text": full_prompt}]
                            }],
                            "generationConfig": {
                                "temperature": 0.7,
                                "maxOutputTokens": 2000,  # Balanced for speed and quality
                                "topP": 0.95,
                                "topK": 40
                            }
                        }
                        
                        async with httpx.AsyncClient(timeout=30.0) as client:
                            response = await client.post(url, json=data)
                            if response.status_code == 200:
                                result = response.json()
                                response_text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
                                if response_text:
                                    logger.info(f"Successfully used Gemini REST API with model: {model_name}")
                                    break
                            else:
                                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
                                error_msg = error_data.get('error', {}).get('message', response.text[:100])
                                logger.debug(f"Model {model_name} failed: {error_msg}")
                                last_error = f"{model_name}: {error_msg}"
                                continue
                    except Exception as e:
                        logger.debug(f"Model {model_name} exception: {e}")
                        last_error = f"{model_name}: {str(e)}"
                        continue
                
                if not response_text:
                    raise Exception(f"All Gemini models failed. Last error: {last_error}. Please check your API key has access to Gemini models.")
            except Exception as gemini_error:
                logger.error(f"Gemini REST API failed: {gemini_error}")
                raise
        else:
            # For OpenAI, use LangChain
            chain = create_agent_chain(agent_type, preferred_provider)
            try:
                if AgentExecutor and isinstance(chain, AgentExecutor):
                    # Agent executor returns dict with 'output' key
                    result = await chain.ainvoke({"input": query, "chat_history": []})
                    response_text = result.get("output", str(result))
                else:
                    # Simple chain returns message object
                    result = await chain.ainvoke({"input": query})
                    if hasattr(result, 'content'):
                        response_text = result.content
                    elif isinstance(result, str):
                        response_text = result
                    else:
                        response_text = str(result)
            except Exception as chain_error:
                logger.error(f"LangChain chain failed: {chain_error}")
                raise
        
        # Extract metadata
        metadata = {
            "query_length": len(query),
            "response_length": len(response_text),
            "provider": provider_used,
            "agent_type": agent_type
        }
        
        # Process response based on agent type
        processed_response = process_agent_response(agent_type, response_text)
        
        return {
            "success": True,
            "agent_type": agent_type,
            "agent_name": get_agent_name(agent_type),
            "response": response_text,
            "ai_provider": provider_used,
            "metadata": {**metadata, **processed_response.get("metadata", {})},
            **processed_response
        }
        
    except Exception as e:
        logger.error(f"Error in agent workflow: {e}", exc_info=True)
        return {
            "success": False,
            "agent_type": agent_type,
            "agent_name": get_agent_name(agent_type),
            "error": str(e),
            "response": f"I apologize, but I encountered an error processing your request: {str(e)}"
        }


def process_agent_response(agent_type: str, response: str) -> Dict[str, Any]:
    """Process and extract structured data from agent response"""
    result = {"metadata": {}}
    
    if agent_type == "skill_coach":
        resources = extract_resources(response)
        result["resources"] = resources
        result["metadata"]["resource_count"] = len(resources)
    elif agent_type == "career_guide":
        opportunities = extract_opportunities(response)
        result["opportunities"] = opportunities
        result["metadata"]["opportunity_count"] = len(opportunities)
    elif agent_type == "writing_agent":
        writing_type = detect_writing_type(response)
        result["writing_type"] = writing_type
        result["metadata"]["detected_type"] = writing_type
    elif agent_type == "networking_agent":
        events = extract_events(response)
        result["events"] = events
        result["metadata"]["event_count"] = len(events)
    
    return result


def extract_resources(response: str) -> List[Dict[str, Any]]:
    """Extract course/platform mentions from response"""
    resources = []
    platforms = ["Coursera", "Udemy", "edX", "YouTube", "Khan Academy", "Pluralsight",
                "LinkedIn Learning", "Skillshare", "FreeCodeCamp", "Codecademy", 
                "MIT OpenCourseWare", "Stanford Online", "FutureLearn"]
    
    for platform in platforms:
        if platform.lower() in response.lower():
            resources.append({
                "type": "course",
                "provider": platform,
                "mentioned": True
            })
    
    return resources


def extract_opportunities(response: str) -> List[Dict[str, Any]]:
    """Extract scholarship/opportunity mentions"""
    opportunities = []
    keywords = {
        "scholarship": ["Fulbright", "Chevening", "DAAD", "Commonwealth", "Erasmus", 
                       "Rhodes", "Gates", "Schwarzman"],
        "fellowship": ["Rhodes", "Gates", "Schwarzman", "Fulbright", "Humboldt"],
        "grant": ["NSF", "NIH", "research grant", "Marie Curie"]
    }
    
    for opp_type, programs in keywords.items():
        for program in programs:
            if program.lower() in response.lower():
                opportunities.append({
                    "type": opp_type,
                    "program": program,
                    "mentioned": True
                })
    
    return opportunities


def detect_writing_type(response: str) -> str:
    """Detect writing type from response"""
    response_lower = response.lower()
    if any(word in response_lower for word in ["abstract", "summary"]):
        return "abstract"
    elif any(word in response_lower for word in ["cv", "resume", "curriculum vitae"]):
        return "cv"
    elif any(word in response_lower for word in ["proposal", "grant"]):
        return "proposal"
    elif any(word in response_lower for word in ["paper", "manuscript", "article"]):
        return "paper"
    else:
        return "general"


def extract_events(response: str) -> List[Dict[str, Any]]:
    """Extract event/conference mentions"""
    events = []
    event_types = ["conference", "workshop", "seminar", "webinar", "symposium", "summit"]
    
    for event_type in event_types:
        if event_type in response.lower():
            events.append({
                "type": event_type,
                "mentioned": True
            })
    
    return events


def get_agent_name(agent_type: str) -> str:
    """Get human-readable agent name"""
    names = {
        "skill_coach": "Skill Coach",
        "career_guide": "Career Guide",
        "writing_agent": "Writing Assistant",
        "networking_agent": "Networking Guide"
    }
    return names.get(agent_type, "Assistant")

