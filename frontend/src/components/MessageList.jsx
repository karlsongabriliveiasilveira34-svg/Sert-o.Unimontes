import React, { useEffect, useRef } from 'react';
import { AgentResponse } from './AgentResponse';
import { User, Sparkles } from 'lucide-react';

export function MessageList({ messages, isLoading, currentAgent, onSelectSuggestion }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((msg) => {
        const isUser = msg.role === 'user';

        return (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-4xl mx-auto animate-fade-in ${
              isUser ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm shadow-md ${
                isUser
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'glass-panel border-cyan-500/30 text-lg bg-slate-900'
              }`}
            >
              {isUser ? <User className="w-5 h-5" /> : (msg.metadata?.avatar || currentAgent.avatar || '🤖')}
            </div>

            {/* Balão da Mensagem */}
            <div
              className={`rounded-2xl p-4.5 max-w-[88%] sm:max-w-[80%] transition-all ${
                isUser
                  ? 'bg-gradient-to-tr from-cyan-600 to-cyan-500 text-white shadow-lg shadow-cyan-900/30 rounded-tr-none'
                  : 'glass-panel-glow border-slate-700/80 rounded-tl-none shadow-xl'
              }`}
            >
              {isUser ? (
                <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {msg.content}
                </div>
              ) : (
                <AgentResponse
                  message={msg}
                  onSelectSuggestion={onSelectSuggestion}
                />
              )}

              {/* Timestamp */}
              <div
                className={`text-[10px] mt-2 font-mono ${
                  isUser ? 'text-cyan-100/70 text-right' : 'text-slate-400'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        );
      })}

      {/* Indicador de Digitação / Processamento RAG */}
      {isLoading && (
        <div className="flex items-start gap-3 max-w-4xl mx-auto animate-fade-in">
          <div className="w-9 h-9 rounded-xl glass-panel border-cyan-500/30 flex items-center justify-center text-lg bg-slate-900 shadow-md">
            {currentAgent.avatar || '⚡'}
          </div>
          <div className="glass-panel-glow border-slate-700/80 rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" />
            </div>
            <span className="text-xs text-cyan-300 font-medium animate-pulse">
              Consultando base RAG e roteando para especialista...
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
