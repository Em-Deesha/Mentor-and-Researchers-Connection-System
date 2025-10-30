"""
Configuration management with validation and security
"""
import os
from dotenv import load_dotenv
import logging

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


class Settings:
    """Application settings with validation"""
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # AI Provider Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini").lower()
    
    # Application Configuration
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))
    
    # Logging Configuration
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Rate Limiting (for future use)
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    # Timeouts
    REQUEST_TIMEOUT: int = int(os.getenv("REQUEST_TIMEOUT", "30"))

    @classmethod
    def validate(cls):
        """Validate required configuration"""
        errors = []
        
        # Supabase is optional but recommended
        if not cls.SUPABASE_URL or not cls.SUPABASE_KEY:
            logger.warning("Supabase credentials not configured. Database features will be disabled.")
        
        # At least one AI provider is required
        if not cls.OPENAI_API_KEY and not cls.GEMINI_API_KEY:
            errors.append("At least one AI provider API key (OPENAI_API_KEY or GEMINI_API_KEY) is required")
        
        # Validate AI provider name
        if cls.AI_PROVIDER not in ["openai", "gemini"]:
            logger.warning(f"Invalid AI_PROVIDER '{cls.AI_PROVIDER}'. Using 'gemini' as default.")
            cls.AI_PROVIDER = "gemini"
        
        if errors:
            raise ValueError("Configuration errors:\n" + "\n".join(f"- {e}" for e in errors))
        
        logger.info(f"Configuration validated. AI Provider: {cls.AI_PROVIDER}")
        if cls.OPENAI_API_KEY:
            logger.info("OpenAI API key configured")
        if cls.GEMINI_API_KEY:
            logger.info("Gemini API key configured")
    
    @classmethod
    def get_available_providers(cls):
        """Get list of configured AI providers"""
        providers = []
        if cls.OPENAI_API_KEY:
            providers.append("openai")
        if cls.GEMINI_API_KEY:
            providers.append("gemini")
        return providers


# Create settings instance
settings = Settings()

# Validate on import (will raise if invalid)
try:
    settings.validate()
except ValueError as e:
    logger.error(f"Configuration validation failed: {e}")
    # Don't raise in production - allow runtime configuration
