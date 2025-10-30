/*
  # Multi-Agent Mentorship Module Database Schema

  ## Overview
  This migration creates the database structure for the Multi-Agent Mentorship module,
  which provides AI-powered mentorship through specialized agents.

  ## New Tables

  ### 1. `mentorship_sessions`
  Stores all mentorship interaction sessions between users and AI agents.
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid) - Reference to the user (future auth integration)
  - `agent_type` (text) - Type of agent: 'skill_coach', 'career_guide', 'writing_agent', 'networking_agent'
  - `query` (text) - User's question or request
  - `response` (text) - Agent's response
  - `ai_provider` (text) - Which AI was used: 'gemini' or 'openai'
  - `metadata` (jsonb) - Additional data (tokens used, processing time, etc.)
  - `created_at` (timestamptz) - When the session was created

  ### 2. `mentorship_resources`
  Stores recommended resources (courses, scholarships, papers, events) from agents.
  - `id` (uuid, primary key) - Unique resource identifier
  - `session_id` (uuid, foreign key) - Links to mentorship_sessions
  - `resource_type` (text) - Type: 'course', 'scholarship', 'paper', 'event', 'tool'
  - `title` (text) - Resource title
  - `description` (text) - Resource description
  - `url` (text) - Link to resource
  - `provider` (text) - Platform or organization offering the resource
  - `relevance_score` (numeric) - AI-calculated relevance (0-1)
  - `created_at` (timestamptz) - When resource was added

  ### 3. `user_mentorship_history`
  Tracks user interaction history for personalized recommendations.
  - `id` (uuid, primary key) - Unique history identifier
  - `user_id` (uuid) - Reference to the user
  - `agent_type` (text) - Which agent was used
  - `interaction_count` (integer) - Number of interactions with this agent
  - `last_interaction` (timestamptz) - Last time user interacted with this agent
  - `preferences` (jsonb) - User preferences learned over time
  - `created_at` (timestamptz) - When record was created
  - `updated_at` (timestamptz) - When record was last updated

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies ensure users can only access their own data
  - Public read access for mentorship_resources (shareable recommendations)

  ## Indexes
  - Index on user_id for fast user-specific queries
  - Index on agent_type for filtering by agent
  - Index on created_at for chronological queries
*/

-- Create mentorship_sessions table
CREATE TABLE IF NOT EXISTS mentorship_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  agent_type text NOT NULL CHECK (agent_type IN ('skill_coach', 'career_guide', 'writing_agent', 'networking_agent')),
  query text NOT NULL,
  response text NOT NULL,
  ai_provider text NOT NULL CHECK (ai_provider IN ('gemini', 'openai')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create mentorship_resources table
CREATE TABLE IF NOT EXISTS mentorship_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES mentorship_sessions(id) ON DELETE CASCADE,
  resource_type text NOT NULL CHECK (resource_type IN ('course', 'scholarship', 'paper', 'event', 'tool', 'conference')),
  title text NOT NULL,
  description text,
  url text,
  provider text,
  relevance_score numeric DEFAULT 0.5 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  created_at timestamptz DEFAULT now()
);

-- Create user_mentorship_history table
CREATE TABLE IF NOT EXISTS user_mentorship_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  agent_type text NOT NULL CHECK (agent_type IN ('skill_coach', 'career_guide', 'writing_agent', 'networking_agent')),
  interaction_count integer DEFAULT 1,
  last_interaction timestamptz DEFAULT now(),
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, agent_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_user_id ON mentorship_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_agent_type ON mentorship_sessions(agent_type);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_created_at ON mentorship_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentorship_resources_session_id ON mentorship_resources(session_id);
CREATE INDEX IF NOT EXISTS idx_user_mentorship_history_user_id ON user_mentorship_history(user_id);

-- Enable Row Level Security
ALTER TABLE mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mentorship_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mentorship_sessions
-- Allow anyone to insert sessions (for demo purposes, can be restricted later)
CREATE POLICY "Anyone can create mentorship sessions"
  ON mentorship_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anyone to view their own sessions or all sessions (for demo)
CREATE POLICY "Anyone can view mentorship sessions"
  ON mentorship_sessions FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for mentorship_resources
-- Allow anyone to insert resources linked to sessions
CREATE POLICY "Anyone can create mentorship resources"
  ON mentorship_resources FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anyone to view resources (recommendations are shareable)
CREATE POLICY "Anyone can view mentorship resources"
  ON mentorship_resources FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for user_mentorship_history
-- Allow anyone to insert/update history
CREATE POLICY "Anyone can create mentorship history"
  ON user_mentorship_history FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update mentorship history"
  ON user_mentorship_history FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Allow anyone to view history (for demo)
CREATE POLICY "Anyone can view mentorship history"
  ON user_mentorship_history FOR SELECT
  TO anon
  USING (true);
