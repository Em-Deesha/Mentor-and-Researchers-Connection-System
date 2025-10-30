import { AgentInfo } from '../types/mentorship';

interface AgentCardProps {
  agent: AgentInfo;
  isSelected: boolean;
  onSelect: () => void;
}

export function AgentCard({ agent, isSelected, onSelect }: AgentCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-6 rounded-xl text-left transition-all duration-200 ${
        isSelected
          ? 'bg-blue-50 border-2 border-blue-500 shadow-lg'
          : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{agent.icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {agent.name}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {agent.description}
          </p>
        </div>
      </div>
    </button>
  );
}
