import React from 'react';
import { Sparkles, MapPin, Radio, Layers } from 'lucide-react';

export function Header({ currentAgent, selectedLocation, onToggleMap, isMapOpen }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo & Marca */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-xl">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                Sertão<span className="text-cyan-400">.Unimontes</span>
              </h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                Front-End AI RAG
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Rede de Agentes Especialistas com Roteamento Semântico
            </p>
          </div>
        </div>

        {/* Status do Agente Conectado & Polo */}
        <div className="flex items-center gap-3">
          {/* Badge Polo Geográfico */}
          <button
            onClick={onToggleMap}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              isMapOpen
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/30'
                : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:border-slate-500 hover:text-white'
            }`}
            title="Alternar visão do mapa geográfico"
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span className="hidden sm:inline font-mono text-[11px]">
              {selectedLocation?.city?.split(' ')[0] || 'Unimontes'} ({selectedLocation?.state || 'MG'})
            </span>
            <span className="sm:hidden font-mono text-[11px]">
              {selectedLocation?.state || 'MG'}
            </span>
          </button>

          {/* Agente Ativo Atual */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs">
            <span className="text-base">{currentAgent.avatar || '🤖'}</span>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Agente Ativo
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {currentAgent.title?.split(' ')[0] || 'React'}
              </span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
          </div>

          {/* Botão de abrir/fechar painel do Mapa */}
          <button
            onClick={onToggleMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition shadow-md shadow-cyan-600/30"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isMapOpen ? 'Ocultar Mapa' : 'Ver Polos / Mapa'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
