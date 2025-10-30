import { MentorshipResponse } from '../types/mentorship';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: {
    type: 'user' | 'agent';
    content: string;
    response?: MentorshipResponse;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.type === 'user') {
    return (
      <div className="flex gap-3 justify-end">
        <div className="bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-2xl">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-2xl shadow-sm">
        {message.response && (
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-600">
              {message.response.agent_name}
            </span>
            {message.response.ai_provider && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {message.response.ai_provider}
              </span>
            )}
          </div>
        )}
        <div className="prose prose-sm max-w-none">
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {message.response?.resources && message.response.resources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Mentioned Platforms:</p>
            <div className="flex flex-wrap gap-2">
              {message.response.resources.map((resource, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                >
                  {resource.provider}
                </span>
              ))}
            </div>
          </div>
        )}

        {message.response?.opportunities && message.response.opportunities.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Opportunities Mentioned:</p>
            <div className="flex flex-wrap gap-2">
              {message.response.opportunities.map((opp, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded"
                >
                  {opp.program}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
