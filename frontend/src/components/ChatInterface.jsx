import React, { useState, useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { SuggestionsBar } from './SuggestionsBar';
import { Send, Sparkles, Trash2, Bot } from 'lucide-react';

export function ChatInterface({
  messages,
  isLoading,
  currentAgent,
  selectedLocation,
  onSendMessage,
  onClearChat
}) {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef(null);

  // Sugestões padrão caso a última mensagem não tenha
  const latestSuggestions = 
    [...messages].reverse().find(m => m.metadata?.suggestions)?.metadata?.suggestions || [
      "Como aplicar lazy loading com React.lazy e Suspense?",
      "Como estruturar um grid responsivo com CSS moderno?",
      "Quais os critérios WCAG para formulários acessíveis?",
      "Como usar Discriminated Unions e Generics no TypeScript?"
    ];

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectSuggestion = (sug) => {
    onSendMessage(sug);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/60 relative">
      
      {/* Sub-header com detalhes do Agente Conectado */}
      <div className="px-6 py-2.5 glass-panel border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-base">
            {currentAgent.avatar || '🤖'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100">
                {currentAgent.title}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[11px] text-slate-400">
              Conectado ao polo {selectedLocation?.city || 'Norte de Minas (Unimontes)'}
            </span>
          </div>
        </div>

        <button
          onClick={onClearChat}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
          title="Limpar histórico do chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Limpar</span>
        </button>
      </div>

      {/* Área das Mensagens com Scroll */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        currentAgent={currentAgent}
        onSelectSuggestion={handleSelectSuggestion}
      />

      {/* Barra de Sugestões Rápidas */}
      <div className="px-4 py-1 bg-slate-950/80 border-t border-slate-900">
        <SuggestionsBar
          suggestions={latestSuggestions}
          onSelect={handleSelectSuggestion}
        />
      </div>

      {/* Input de Mensagem */}
      <div className="p-4 glass-panel border-t border-slate-800/80">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-end gap-2">
          <div className="flex-1 relative rounded-2xl bg-slate-900/90 border border-slate-700/80 focus-within:border-cyan-500/80 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all shadow-inner">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Pergunte algo sobre React, CSS, Performance, Acessibilidade, SEO ou TypeScript...`}
              className="w-full resize-none bg-transparent px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none max-h-32"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold flex items-center justify-center shrink-0 transition-all duration-200 shadow-lg shadow-cyan-500/20 active:scale-95"
            title="Enviar mensagem (Enter)"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-500 mt-2">
          Pressione <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-[9px] text-slate-300">Enter</kbd> para enviar ou <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-[9px] text-slate-300">Shift+Enter</kbd> para nova linha.
        </p>
      </div>

    </div>
  );
}
