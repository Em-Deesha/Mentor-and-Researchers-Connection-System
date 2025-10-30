interface ProviderSelectorProps {
  selectedProvider: 'openai' | 'gemini';
  onChange: (provider: 'openai' | 'gemini') => void;
}

export function ProviderSelector({ selectedProvider, onChange }: ProviderSelectorProps) {
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
      <span className="text-xs font-medium text-gray-700">AI Provider:</span>
      <div className="flex gap-2">
        <button
          onClick={() => onChange('gemini')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            selectedProvider === 'gemini'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Gemini
        </button>
        <button
          onClick={() => onChange('openai')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
            selectedProvider === 'openai'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          OpenAI
        </button>
      </div>
    </div>
  );
}
