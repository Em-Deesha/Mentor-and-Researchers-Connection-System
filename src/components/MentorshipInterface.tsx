import { useState, useRef, useEffect } from 'react';
import { AGENTS } from '../types/mentorship';
import { mentorshipService } from '../services/mentorshipService';
import { AgentCard } from './AgentCard';
import { ChatMessage } from './ChatMessage';
import { ProviderSelector } from './ProviderSelector';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  type: 'user' | 'agent';
  content: string;
  response?: any;
}

export function MentorshipInterface() {
  const [selectedAgent, setSelectedAgent] = useState<string>('skill_coach');
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({});
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState<'openai' | 'gemini'>('gemini');
  const [sessionIds, setSessionIds] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get messages for current agent
  const messages = allMessages[selectedAgent] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      type: 'user',
      content: inputValue,
    };

    // Add user message to current agent's messages
    setAllMessages(prev => ({
      ...prev,
      [selectedAgent]: [...(prev[selectedAgent] || []), userMessage]
    }));
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await mentorshipService.getMentorship({
        agent_type: selectedAgent as any,
        query: inputValue,
        preferred_provider: aiProvider,
        session_id: sessionIds[selectedAgent] || undefined,
      });

      // Store session ID per agent from response
      if (response.session_id && !sessionIds[selectedAgent]) {
        setSessionIds(prev => ({ ...prev, [selectedAgent]: response.session_id }));
      }

      const agentMessage: Message = {
        type: 'agent',
        content: response.response,
        response: response,
      };

      // Add agent message to current agent's messages
      setAllMessages(prev => ({
        ...prev,
        [selectedAgent]: [...(prev[selectedAgent] || []), agentMessage]
      }));
    } catch (error) {
      const errorMessage: Message = {
        type: 'agent',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
      };
      // Add error message to current agent's messages
      setAllMessages(prev => ({
        ...prev,
        [selectedAgent]: [...(prev[selectedAgent] || []), errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAgentChange = (agentType: string) => {
    setSelectedAgent(agentType);
    // Don't clear messages - they're preserved in allMessages per agent
  };

  const agentsList = Object.values(AGENTS);

  function getExampleQuestions(agentType: string): string[] {
    const questions: Record<string, string[]> = {
      skill_coach: [
        "I want to learn machine learning from scratch, where should I start?",
        "Recommend the best Python courses for beginners",
        "What certifications are valuable for data science careers?",
        "I'm interested in web development, suggest a learning path"
      ],
      career_guide: [
        "What scholarships are available for Pakistani students studying abroad?",
        "Tell me about Fulbright scholarship requirements and application process",
        "How can I find research opportunities in Europe?",
        "What are good fellowship programs for PhD students in Computer Science?"
      ],
      writing_agent: [
        "Help me write an abstract for my research paper on artificial intelligence",
        "Review my CV and suggest improvements for academic positions",
        "How should I structure a research proposal for a grant application?",
        "I need help improving the introduction section of my research paper"
      ],
      networking_agent: [
        "What are the best AI and machine learning conferences to attend this year?",
        "Suggest networking opportunities for computer science students in Pakistan",
        "What professional organizations should I join as a researcher?",
        "Recommend online communities and platforms for data science networking"
      ]
    };
    return questions[agentType] || ["How can I help you today?"];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Multi-Agent Mentorship
          </h1>
          <p className="text-gray-600">
            Choose an AI mentor to guide your academic and career journey
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Select Your Mentor
              </h2>
              <div className="space-y-3">
                {agentsList.map((agent) => (
                  <AgentCard
                    key={agent.type}
                    agent={agent}
                    isSelected={selectedAgent === agent.type}
                    onSelect={() => handleAgentChange(agent.type)}
                  />
                ))}
              </div>
            </div>

            <ProviderSelector
              selectedProvider={aiProvider}
              onChange={setAiProvider}
            />
          </aside>

          <main className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {AGENTS[selectedAgent]?.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {AGENTS[selectedAgent]?.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {AGENTS[selectedAgent]?.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center text-gray-500 max-w-md">
                      <p className="text-lg font-semibold mb-4 text-gray-700">
                        👋 Start a conversation with {AGENTS[selectedAgent]?.name}
                      </p>
                      <p className="text-sm mb-6">
                        {AGENTS[selectedAgent]?.description}
                      </p>
                      <div className="space-y-2 text-left">
                        <p className="text-xs font-semibold text-gray-600 mb-2">💡 Example questions:</p>
                        {getExampleQuestions(selectedAgent).map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => setInputValue(question)}
                            className="w-full text-left text-xs bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg px-3 py-2 text-gray-700 hover:text-blue-700 transition-colors"
                          >
                            "{question}"
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
                      <p className="text-sm text-gray-600">Thinking...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 px-6 py-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e as any);
                      }
                    }}
                    placeholder={messages.length === 0 ? `Ask ${AGENTS[selectedAgent]?.name} anything...` : "Continue the conversation..."}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
