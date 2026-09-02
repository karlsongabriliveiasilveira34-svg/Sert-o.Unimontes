import React from 'react';
import { Sparkles } from 'lucide-react';

export function SuggestionsBar({ suggestions, onSelect }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 no-scrollbar">
      <div className="flex items-center gap-1 text-xs text-cyan-400 font-semibold shrink-0 pl-1">
        <Sparkles className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sugestões:</span>
      </div>
      {suggestions.map((sug, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(sug)}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-200 transition-all duration-200 shadow-sm"
        >
          {sug}
        </button>
      ))}
    </div>
  );
}
