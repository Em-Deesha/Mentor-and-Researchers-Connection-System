"""
FastAPI Main Application
Multi-Agent Mentorship API with LangChain integration
"""

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from datetime import datetime
from typing import Dict
import logging
import traceback

from models import MentorshipRequest, MentorshipResponse, AgentInfo, HealthResponse
from agents import AgentFactory
from config import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Multi-Agent Mentorship API",
    description="AI-powered mentorship system with specialized LangChain agents",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors"""
    logger.warning(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation error",
            "details": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )


# Startup Event
@app.on_event("startup")
async def startup_event():
    """Initialize on startup"""
    logger.info("Starting Multi-Agent Mentorship API")
    logger.info(f"Available agents: {list(AgentFactory._agents.keys())}")
    logger.info(f"Configured AI providers: {settings.get_available_providers()}")
    
    # Validate configuration
    try:
        settings.validate()
    except ValueError as e:
        logger.warning(f"Configuration warning: {e}")


# Health Check Endpoint
@app.get("/", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        available_agents=list(AgentFactory._agents.keys()),
        ai_providers_configured=settings.get_available_providers()
    )


# Get All Agents
@app.get("/agents", response_model=Dict[str, AgentInfo], tags=["Agents"])
async def get_agents():
    """Get information about all available agents"""
    try:
        return AgentFactory.get_all_agents()
    except Exception as e:
        logger.error(f"Error getting agents: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# Mentorship Endpoint
@app.post("/mentorship", response_model=MentorshipResponse, tags=["Mentorship"])
async def get_mentorship(request: MentorshipRequest):
    """Get mentorship response from specified agent"""
    try:
        # Validate agent type
        if request.agent_type not in AgentFactory._agents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid agent type: {request.agent_type}. Available: {list(AgentFactory._agents.keys())}"
            )
        
        # Validate query
        if not request.query or not request.query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query cannot be empty"
            )
        
        # Validate provider if specified
        if request.preferred_provider and request.preferred_provider not in settings.get_available_providers():
            logger.warning(f"Unavailable provider '{request.preferred_provider}' requested. Will use fallback.")
        
        logger.info(f"Processing request: agent={request.agent_type}, provider={request.preferred_provider}")
        
        # Get agent and generate response with conversation history
        agent = AgentFactory.get_agent(request.agent_type)
        result = await agent.generate_response(
            query=request.query,
            user_id=request.user_id,
            preferred_provider=request.preferred_provider,
            session_id=request.session_id
        )
        
        # Validate result
        if not isinstance(result, dict):
            raise ValueError("Agent returned invalid result format")
        
        return MentorshipResponse(**result)
        
    except ValueError as e:
        logger.error(f"Value error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in mentorship endpoint: {e}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}" if settings.DEBUG else "An error occurred while processing your request"
        )


# Agent-specific Mentorship Endpoint
@app.post("/mentorship/{agent_type}", response_model=MentorshipResponse, tags=["Mentorship"])
async def get_mentorship_by_agent(agent_type: str, request: MentorshipRequest):
    """Get mentorship response from specific agent type (agent type in URL)"""
    try:
        # Override agent type from URL
        request.agent_type = agent_type
        
        # Validate agent type
        if agent_type not in AgentFactory._agents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid agent type: {agent_type}. Available: {list(AgentFactory._agents.keys())}"
            )
        
        # Use the main mentorship endpoint logic
        return await get_mentorship(request)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in agent-specific endpoint: {e}\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e) if settings.DEBUG else "An error occurred"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.API_HOST,
        port=settings.API_PORT,
        log_level=settings.LOG_LEVEL.lower()
    )
