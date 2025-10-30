export interface MentorshipRequest {
  agent_type: 'skill_coach' | 'career_guide' | 'writing_agent' | 'networking_agent';
  query: string;
  user_id?: string;
  preferred_provider?: 'openai' | 'gemini';
  session_id?: string;
}

export interface MentorshipResponse {
  success: boolean;
  agent_type: string;
  agent_name: string;
  response: string;
  session_id?: string;
  ai_provider?: string;
  metadata?: Record<string, any>;
  resources?: Array<{
    type: string;
    provider: string;
    mentioned: boolean;
  }>;
  opportunities?: Array<{
    type: string;
    program: string;
    mentioned: boolean;
  }>;
  events?: Array<{
    type: string;
    mentioned: boolean;
  }>;
  writing_type?: string;
  error?: string;
}

export interface AgentInfo {
  name: string;
  description: string;
  type: string;
  icon?: string;
}

export const AGENTS: Record<string, AgentInfo> = {
  skill_coach: {
    name: 'Skill Coach',
    description: 'Get personalized course recommendations and learning paths',
    type: 'skill_coach',
    icon: '📚'
  },
  career_guide: {
    name: 'Career Guide',
    description: 'Discover scholarships and international opportunities',
    type: 'career_guide',
    icon: '🎓'
  },
  writing_agent: {
    name: 'Writing Assistant',
    description: 'Improve your academic writing and papers',
    type: 'writing_agent',
    icon: '✍️'
  },
  networking_agent: {
    name: 'Networking Guide',
    description: 'Find conferences and networking opportunities',
    type: 'networking_agent',
    icon: '🤝'
  }
};
