import React from 'react';
import { Sparkles, MapPin, Radio, Layers, Home, ArrowLeft } from 'lucide-react';

export function Header({ currentAgent, selectedLocation, onToggleMap, isMapOpen, onGoHome }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#d17a42]/30 px-4 py-3 bg-[#1c1712]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo & Marca */}
        <div className="flex items-center gap-3">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="p-2 rounded-xl bg-[#2a2018] hover:bg-[#3b2d22] border border-[#d17a42]/30 text-[#d6c5b3] hover:text-white transition shadow-sm"
              title="Voltar para a página inicial Veredas"
            >
              <ArrowLeft className="w-4 h-4 text-[#d17a42]" />
            </button>
          )}

          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#c25a30] to-[#d17a42] flex items-center justify-center shadow-lg shadow-[#c25a30]/25 text-white font-bold text-xl">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-[#f2e5d0]">
                Veredas<span className="text-[#d17a42]">.Unimontes</span>
              </h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[#3b2d22] text-[#e6d5c3] border border-[#d17a42]/40 font-mono">
                MedIA Multiagente
              </span>
            </div>
            <p className="text-xs text-[#a69685]">
              Inteligência que nasce do território • Cerrado & Sertão
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
                ? 'bg-[#c25a30]/30 border-[#d17a42] text-[#f2e5d0] shadow-sm'
                : 'bg-[#2a2018]/80 border-[#3b2d22] text-[#d6c5b3] hover:border-[#d17a42]/60 hover:text-white'
            }`}
            title="Alternar visão do mapa geográfico"
          >
            <MapPin className="w-3.5 h-3.5 text-[#d17a42] animate-bounce" />
            <span className="hidden sm:inline font-mono text-[11px]">
              {selectedLocation?.city?.split(' ')[0] || 'Unimontes'} ({selectedLocation?.state || 'MG'})
            </span>
            <span className="sm:hidden font-mono text-[11px]">
              {selectedLocation?.state || 'MG'}
            </span>
          </button>

          {/* Botão de abrir/fechar painel do Mapa */}
          <button
            onClick={onToggleMap}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c25a30] hover:bg-[#a14823] text-white text-xs font-semibold transition shadow-md shadow-[#c25a30]/25"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isMapOpen ? 'Ocultar Mapa' : 'Ver Polos / Mapa'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
