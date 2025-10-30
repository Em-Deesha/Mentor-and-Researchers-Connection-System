import React, { useEffect, useMemo, useRef, useState } from 'react';

const ChatAssistant = ({ profileId, profileType, context }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState('');
	const [isSending, setIsSending] = useState(false);
	const panelRef = useRef(null);

	useEffect(() => {
		console.log('[ChatAssistant] mounted with', { profileId, profileType, context });
	}, [profileId, profileType, context]);

	const suggestions = useMemo(() => {
		if (profileType === 'student') {
			return [
				"Summarize this student’s research interests",
				"List this student’s skills",
				"What projects align with this student’s interests?"
			];
		}
		return [
			"Summarize this professor’s research areas",
			"List main publications",
			"What student profiles would fit this professor’s lab?"
		];
	}, [profileType]);

	const handleSend = async (text) => {
		const query = (text || input).trim();
		if (!query) return;
		setIsSending(true);
		const userMsg = { role: 'user', content: query, id: `m_${Date.now()}` };
		setMessages(prev => [...prev, userMsg]);
		setInput('');
		try {
			const resp = await fetch(`${import.meta.env.VITE_CHAT_ASSISTANT_API || 'http://localhost:3003'}/api/chat-assistant/query`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ profileId, profileType, query })
			});
			if (!resp.ok) {
				throw new Error(`Request failed with status ${resp.status}`);
			}
			const data = await resp.json();
			const botMsg = { role: 'assistant', content: data?.answer || 'No response', id: `b_${Date.now()}` };
			setMessages(prev => [...prev, botMsg]);
		} catch (err) {
			console.error('[ChatAssistant] Error sending query', err);
			setMessages(prev => [...prev, { role: 'assistant', content: 'Error fetching response. Check backend availability.', id: `e_${Date.now()}` }]);
		} finally {
			setIsSending(false);
		}
	};

	useEffect(() => {
		const handler = (e) => {
			if (panelRef.current && !panelRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		if (isOpen) document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [isOpen]);

	return (
		<>
			{/* Floating button */}
			<button
				onClick={() => setIsOpen(v => !v)}
				className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center justify-center transition-transform active:scale-95"
				aria-label="Open chat assistant"
			>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
					<path d="M7.5 3.75A3.75 3.75 0 0 0 3.75 7.5v5.25a3.75 3.75 0 0 0 3.75 3.75h2.136a.75.75 0 0 1 .53.22l3.284 3.284A1.5 1.5 0 0 0 18 22.5v-2.25h.75A3.75 3.75 0 0 0 22.5 16.5V7.5a3.75 3.75 0 0 0-3.75-3.75h-11.25Z" />
				</svg>
			</button>

			{/* Panel */}
			<div className={`fixed bottom-24 right-6 z-40 w-[min(92vw,380px)] max-h-[70vh] bg-white border border-gray-200 rounded-2xl shadow-2xl transition-all ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'}`} ref={panelRef}>
				<div className="p-4 border-b border-gray-100 flex items-center justify-between">
					<div>
						<p className="text-sm font-semibold text-gray-900">Context-Aware Assistant</p>
						<p className="text-xs text-gray-500">{profileType === 'student' ? 'Student profile context' : 'Professor profile context'}</p>
					</div>
					<button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
						<span className="sr-only">Close</span>×
					</button>
				</div>
				<div className="p-3 flex gap-2 flex-wrap border-b border-gray-100">
					{suggestions.map((s) => (
						<button key={s} onClick={() => handleSend(s)} className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition">
							{s}
						</button>
					))}
				</div>
				<div className="p-4 space-y-3 overflow-y-auto max-h-[44vh]">
					{messages.length === 0 && (
						<p className="text-xs text-gray-500">Ask anything about this {profileType}. I will use the profile context to answer.</p>
					)}
					{messages.map(m => (
						<div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
							<div className={`${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'} px-3 py-2 rounded-2xl max-w-[85%] text-sm whitespace-pre-wrap`}>
								{m.content}
							</div>
						</div>
					))}
				</div>
				<div className="p-3 border-t border-gray-100">
					<form onSubmit={(e) => { e.preventDefault(); if (!isSending) handleSend(); }} className="flex items-center gap-2">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask a question..."
							className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
						<button
							type="submit"
							disabled={isSending}
							className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
						>
							{isSending ? 'Sending...' : 'Send'}
						</button>
					</form>
				</div>
			</div>
		</>
	);
};

export default ChatAssistant;


