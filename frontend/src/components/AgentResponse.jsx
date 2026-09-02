import React from 'react';
import { AgentBadge } from './AgentBadge';
import { CodeBlock } from './CodeBlock';
import { BookOpen, Users } from 'lucide-react';

export function AgentResponse({ message, onSelectSuggestion }) {
  const meta = message.metadata || {};

  return (
    <div className="space-y-3">
      {/* Header do Agente */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <AgentBadge
          specialty={meta.specialty || 'react'}
          title={meta.title || message.agent}
          avatar={meta.avatar}
        />

        {/* Agente Secundário Colaborativo (se houver) */}
        {meta.secondaryAgent && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-800">
            <Users className="w-3 h-3 text-cyan-400" />
            <span>Colaboração:</span>
            <span className="text-cyan-300 font-medium">
              {meta.secondaryAgent.avatar} {meta.secondaryAgent.title}
            </span>
          </div>
        )}
      </div>

      {/* Texto principal da resposta */}
      <div className="text-sm md:text-base leading-relaxed text-slate-200 whitespace-pre-line">
        {message.content}
      </div>

      {/* Bloco de Código executável */}
      {meta.code && (
        <CodeBlock code={meta.code} language={meta.codeLanguage || 'jsx'} />
      )}

      {/* Explicação complementar */}
      {meta.explanation && (
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-xs text-slate-300 leading-normal">
          <span className="font-semibold text-cyan-300 block mb-1">💡 Dica de Especialista:</span>
          {meta.explanation}
        </div>
      )}

      {/* Fontes consultadas no RAG */}
      {meta.sources && meta.sources.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <BookOpen className="w-3 h-3 text-cyan-400" /> Base RAG:
          </span>
          {meta.sources.map((src, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400"
            >
              {src}
            </span>
          ))}
        </div>
      )}

      {/* Sugestões de Follow-up */}
      {meta.suggestions && meta.suggestions.length > 0 && (
        <div className="pt-2">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
            Perguntas Relacionadas:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {meta.suggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => onSelectSuggestion && onSelectSuggestion(sug)}
                className="text-left text-xs px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-200 transition"
              >
                • {sug}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
