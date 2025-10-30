# Multi-Agent Mentorship Module

A complete AI-powered mentorship system featuring specialized agents for academic and career guidance. Built with FastAPI, React, and integrated with both OpenAI and Gemini AI providers.

## Overview

This module provides four specialized AI mentors:

1. **Skill Coach** - Recommends online courses and learning resources
2. **Career Guide** - Advises on scholarships and international opportunities
3. **Writing Assistant** - Helps with abstracts, CVs, research papers
4. **Networking Guide** - Suggests conferences and networking events

## Features

- **Dual AI Provider Support**: Seamless switching between OpenAI and Gemini with automatic fallback
- **Real-time Chat Interface**: Interactive conversation with specialized AI agents
- **Session Tracking**: All interactions stored in Supabase for analytics
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript**: Fully typed for better development experience

## Architecture

### Frontend (React + TypeScript + Vite)
- Modern React with hooks
- TypeScript for type safety
- Tailwind CSS for styling
- Lucide React for icons

### Backend (FastAPI + Python)
- RESTful API with FastAPI
- Multi-agent system with specialized prompts
- Dual AI provider integration (OpenAI + Gemini)
- Automatic fallback mechanism

### Database (Supabase)
- Session tracking
- Resource recommendations storage
- User interaction history

### Edge Function (Deno)
- API proxy to backend
- CORS handling
- Request routing

## Project Structure

```
project/
├── backend/                    # FastAPI backend
│   ├── main.py                # API endpoints
│   ├── agents.py              # AI agent implementations
│   ├── ai_provider.py         # OpenAI/Gemini integration
│   ├── database.py            # Supabase operations
│   ├── config.py              # Configuration
│   ├── models.py              # Pydantic models
│   ├── requirements.txt       # Python dependencies
│   └── README.md              # Backend documentation
├── src/
│   ├── components/            # React components
│   │   ├── AgentCard.tsx      # Agent selection card
│   │   ├── ChatMessage.tsx    # Chat message display
│   │   ├── MentorshipInterface.tsx  # Main interface
│   │   └── ProviderSelector.tsx     # AI provider selector
│   ├── lib/
│   │   └── supabase.ts        # Supabase client
│   ├── services/
│   │   └── mentorshipService.ts  # API service
│   ├── types/
│   │   └── mentorship.ts      # TypeScript types
│   └── App.tsx                # Root component
└── supabase/
    └── functions/
        └── mentorship-api/    # Edge Function

```

## Setup Instructions

### Prerequisites

- Node.js 18+
- Python 3.9+
- Supabase account
- OpenAI API key OR Gemini API key (or both)

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Environment is already configured in .env
# The frontend will work once the backend is running
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# SUPABASE_URL=your_supabase_url
# SUPABASE_KEY=your_supabase_anon_key
# OPENAI_API_KEY=your_openai_key (optional)
# GEMINI_API_KEY=your_gemini_key (optional)
# AI_PROVIDER=gemini (or openai)
```

### 3. Database Setup

Database schema is already created in Supabase with the following tables:
- `mentorship_sessions` - Stores all mentorship conversations
- `mentorship_resources` - Stores recommended resources
- `user_mentorship_history` - Tracks user interaction patterns

### 4. Running the Application

#### Start Backend
```bash
cd backend
python main.py
```
Backend runs on `http://localhost:8000`

#### Start Frontend
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

## Usage

### Using the Interface

1. **Select an Agent**: Choose from Skill Coach, Career Guide, Writing Assistant, or Networking Guide
2. **Choose AI Provider**: Toggle between Gemini and OpenAI
3. **Ask Questions**: Type your question and press Send
4. **View Responses**: Get detailed, personalized guidance from your chosen mentor

### Example Queries

**Skill Coach:**
- "I want to learn machine learning, where should I start?"
- "Recommend courses for web development"
- "What certifications are valuable for data science?"

**Career Guide:**
- "What scholarships are available for Pakistani students?"
- "Tell me about Fulbright scholarship"
- "How can I study abroad for my Masters?"

**Writing Assistant:**
- "Help me write an abstract for my research on AI"
- "Review my CV for a PhD application"
- "How do I structure a research proposal?"

**Networking Guide:**
- "What conferences should I attend for machine learning?"
- "Suggest networking opportunities for computer science students"
- "Professional organizations for researchers in Pakistan"

## API Documentation

Once the backend is running, visit:
- Interactive API docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### Key Endpoints

- `GET /` - Health check
- `GET /agents` - List all available agents
- `POST /mentorship` - Get mentorship response
- `POST /mentorship/{agent_type}` - Get mentorship from specific agent

## Configuration

### AI Provider Selection

The system supports both OpenAI and Gemini. Configure in `backend/.env`:

```env
AI_PROVIDER=gemini  # or openai
```

The system automatically falls back to the alternative provider if the primary fails.

### Frontend Configuration

Frontend environment variables in `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Features in Detail

### Multi-Agent System

Each agent has:
- Specialized system prompts
- Domain-specific knowledge
- Unique response formatting
- Resource extraction capabilities

### Automatic Fallback

If the preferred AI provider fails:
1. Tries configured default provider
2. Falls back to alternative provider
3. Returns informative error if all fail

### Session Tracking

All conversations are stored with:
- Query and response
- Agent type used
- AI provider used
- Metadata (tokens, timing)
- Session ID for retrieval

### Security

- Row Level Security (RLS) enabled on all tables
- Environment variables for sensitive data
- CORS properly configured
- API key validation

## Development

### Adding a New Agent

1. Create agent class in `backend/agents.py`
2. Extend `BaseAgent`
3. Implement system prompt and query processing
4. Register in `AgentFactory`
5. Add to frontend `AGENTS` object in `src/types/mentorship.ts`

### Customizing Prompts

Edit system prompts in each agent class's `get_system_prompt()` method.

### Styling

The interface uses Tailwind CSS. Customize in component files or `tailwind.config.js`.

## Troubleshooting

### Backend Issues

**"No AI provider available"**
- Ensure at least one API key (OpenAI or Gemini) is configured in `.env`

**"Supabase credentials required"**
- Check SUPABASE_URL and SUPABASE_KEY in backend `.env`

**"Connection refused"**
- Ensure FastAPI backend is running on port 8000

### Frontend Issues

**"Request failed"**
- Verify backend is running
- Check browser console for CORS errors
- Confirm environment variables are set

**"Build errors"**
- Run `npm install` to ensure dependencies are installed
- Check TypeScript errors with `npm run typecheck`

## Production Deployment

### Backend Deployment

Recommended platforms:
- Railway
- Render
- Heroku
- DigitalOcean App Platform

Configure environment variables in your platform's dashboard.

### Frontend Deployment

Already configured for deployment:
- Edge Function is deployed to Supabase
- Frontend can be deployed to Vercel, Netlify, or similar

Build command: `npm run build`
Output directory: `dist`

## Integration with Other Modules

This module is designed to work standalone but can be integrated with:

1. **Authentication Module** - Add user authentication to track sessions per user
2. **Professor Matching Module** - Use Writing Agent to prepare documents for applications
3. **Research Assistant Module** - Leverage agents for research guidance
4. **Collaboration Workflow** - Integrate mentorship into automated workflows

### Integration Points

- `user_id` field in API accepts external user IDs
- Session tracking can be queried via Supabase
- Agents can be extended with custom logic
- Frontend components are reusable

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation at `/docs`
3. Check backend logs for detailed errors
4. Verify all environment variables are set correctly

## Future Enhancements

Potential improvements:
- Voice input/output
- Multi-language support
- PDF document upload for analysis
- Calendar integration for event tracking
- Email notifications for new opportunities
- Advanced analytics dashboard
- Mobile app version
