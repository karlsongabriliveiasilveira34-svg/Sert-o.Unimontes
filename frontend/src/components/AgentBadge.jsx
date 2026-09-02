import React from 'react';

const AGENT_THEMES = {
  react: { border: 'border-cyan-500/40', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  css: { border: 'border-sky-500/40', text: 'text-sky-400', bg: 'bg-sky-500/10' },
  a11y: { border: 'border-emerald-500/40', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  performance: { border: 'border-amber-500/40', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  seo: { border: 'border-pink-500/40', text: 'text-pink-400', bg: 'bg-pink-500/10' },
  'ui-ux': { border: 'border-violet-500/40', text: 'text-violet-400', bg: 'bg-violet-500/10' },
  ts: { border: 'border-blue-500/40', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  default: { border: 'border-cyan-500/40', text: 'text-cyan-400', bg: 'bg-cyan-500/10' }
};

export function AgentBadge({ specialty, title, avatar }) {
  const theme = AGENT_THEMES[specialty] || AGENT_THEMES.default;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${theme.border} ${theme.bg} ${theme.text} text-xs font-semibold shadow-sm`}>
      <span className="text-sm">{avatar || '🤖'}</span>
      <span>{title || specialty?.toUpperCase()}</span>
    </div>
  );
}
