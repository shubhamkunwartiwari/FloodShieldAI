import React, { useState } from 'react';
import { SystemStateSnapshot } from '../types/flood';
import { Bot, Send, Sparkles, X } from 'lucide-react';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  systemState: SystemStateSnapshot;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelTag?: string;
}

const SUGGESTED_QUESTIONS = [
  'Which areas are most at risk?',
  'Why is Zone 4 classified as extreme?',
  'How many people may need evacuation?',
  'Which hospital is safest?',
  'Which roads should responders avoid?',
  'What happens if rainfall increases by 30%?',
  'Where should emergency shelters be established?',
];

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  isOpen,
  onClose,
  systemState,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `FloodShield Copilot initialized. I am grounded strictly in the live telemetry of the command center (${systemState.scenarioTitle}). Ask me about zone risk explanations, evacuation counts, hospital accessibility, safe routes, or rainfall sensitivity.`,
      modelTag: 'Grounded Telemetry Mode',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const askQuestion = async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          systemState,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content:
            data.answer ||
            'Unable to retrieve response from telemetry copilot.',
          modelTag: data.modelUsed || 'gemini-3.8-flash',
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: `Network error contacting Copilot endpoint. Current top priority zone is ${systemState.zones[0]?.zoneName} (${systemState.zones[0]?.severity}, ${systemState.zones[0]?.prob6h}% 6h probability).`,
          modelTag: 'Local Emergency Fallback',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#0B0E17] border-l border-slate-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Bot className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-sm font-bold text-white">
              FloodShield Copilot
            </div>
            <div className="text-[11px] font-mono text-cyan-400">
              AI Disaster Decision-Support Assistant
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close FloodShield Copilot"
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Active Telemetry Context Bar */}
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span>
          Context: Rain {systemState.currentRainfallMmHr}mm/h · River{' '}
          {systemState.riverWaterLevelM}m
        </span>
        <span className="text-cyan-400">
          Risk: {systemState.overallRisk} ({systemState.overallConfidencePct}%)
        </span>
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="p-3 border-b border-slate-800 bg-[#07090E]">
        <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>TACTICAL QUERIES (CLICK TO ASK):</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => askQuestion(q)}
              disabled={isLoading}
              className="px-2.5 py-1 text-[11px] bg-[#0F172A] hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 rounded transition-colors text-left cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-3.5 text-xs leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-100'
                  : 'bg-[#0F172A] border border-slate-800 text-slate-200'
              }`}
            >
              {m.content}
            </div>
            {m.modelTag && (
              <span className="text-[10px] font-mono text-slate-500 mt-1 px-1">
                Source: {m.modelTag}
              </span>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="p-3 bg-[#0F172A] border border-slate-800 rounded-lg text-xs font-mono text-cyan-400 animate-pulse">
            Synthesizing live catchment telemetry &amp; route statuses...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          askQuestion(input);
        }}
        className="p-3 border-t border-slate-800 bg-[#0F172A] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about zones, routes, hospitals, or +30% rain..."
          className="flex-1 bg-[#07090E] border border-slate-700 rounded px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-3.5 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-slate-950 font-semibold text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Send className="w-3.5 h-3.5" />
          Ask
        </button>
      </form>
    </div>
  );
};
