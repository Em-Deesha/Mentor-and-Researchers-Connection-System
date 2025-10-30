# Multi-Agent Mentorship Backend

FastAPI-based backend for the Multi-Agent Mentorship system with specialized AI agents.

## Features

- **4 Specialized AI Agents**:
  - Skill Coach: Recommends courses and learning resources
  - Career Guide: Advises on scholarships and opportunities
  - Writing Assistant: Helps with academic writing
  - Networking Guide: Suggests conferences and events

- **Dual AI Provider Support**: OpenAI and Gemini with automatic fallback
- **Database Integration**: Supabase for session tracking and analytics
- **RESTful API**: Clean, documented endpoints

## Setup

### Prerequisites
- Python 3.9+
- Supabase account
- OpenAI API key and/or Gemini API key

### Installation

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
AI_PROVIDER=gemini
```

### Running the Server

```bash
python main.py
```

Server runs on `http://localhost:8000`

API documentation available at `http://localhost:8000/docs`

## API Endpoints

### Health Check
```
GET /
```
Returns system health and available agents.

### List Agents
```
GET /agents
```
Returns information about all available agents.

### Get Mentorship
```
POST /mentorship
```

Request body:
```json
{
  "agent_type": "skill_coach",
  "query": "I want to learn machine learning",
  "user_id": "optional_user_id",
  "preferred_provider": "gemini"
}
```

### Get Mentorship by Agent
```
POST /mentorship/{agent_type}
```

Available agent types:
- `skill_coach`
- `career_guide`
- `writing_agent`
- `networking_agent`

## Architecture

### Components

1. **agents.py**: AI agent implementations with specialized prompts
2. **ai_provider.py**: OpenAI and Gemini integration with fallback
3. **database.py**: Supabase database operations
4. **models.py**: Pydantic models for API validation
5. **config.py**: Configuration management
6. **main.py**: FastAPI application

### Agent System Prompts

Each agent has a specialized system prompt that defines:
- Role and expertise
- Response format
- Specific guidance style
- Output structure

### AI Provider Fallback

The system automatically tries:
1. Preferred provider (if specified)
2. Configured default provider
3. Alternative provider

This ensures high availability even if one provider fails.

## Database Schema

### mentorship_sessions
Stores all mentorship interactions.

### mentorship_resources
Stores recommended resources from agents.

### user_mentorship_history
Tracks user interaction patterns.

## Error Handling

- 400: Bad request (invalid agent type, missing fields)
- 500: Internal server error (AI provider failure, database error)

All errors return detailed messages for debugging.

## Development

### Adding a New Agent

1. Create agent class in `agents.py` extending `BaseAgent`
2. Implement `get_system_prompt()` and `process_query()`
3. Register in `AgentFactory._agents`

### Testing

```bash
# Test health endpoint
curl http://localhost:8000/

# Test mentorship
curl -X POST http://localhost:8000/mentorship \
  -H "Content-Type: application/json" \
  -d '{"agent_type": "skill_coach", "query": "I want to learn Python"}'
```

## Production Deployment

For production, use:
- Gunicorn with Uvicorn workers
- Environment variable management
- Rate limiting
- API authentication
- Monitoring and logging

## License

MIT
