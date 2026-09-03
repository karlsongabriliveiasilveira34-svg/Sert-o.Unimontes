import React from 'react';
import { Sparkles, MapPin, Radio, Layers, Home, ArrowLeft } from 'lucide-react';
import { VeredasSymbol } from './VeredasSymbol';

export function Header({ currentAgent, selectedLocation, onToggleMap, isMapOpen, onGoHome }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-[#c4602c]/30 px-4 py-3 bg-[#0d0a07]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo & Marca */}
        <div className="flex items-center gap-3">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="p-2 rounded-xl bg-[#16110c] hover:bg-[#1f1812] border border-[#c4602c]/30 text-[#e4ceaa] hover:text-white transition shadow-sm"
              title="Voltar para a página inicial Veredas"
            >
              <ArrowLeft className="w-4 h-4 text-[#c4602c]" />
            </button>
          )}

          <VeredasSymbol size="sm" isPulsing={true} showAura={false} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-[#f7ebd9]">
                VEREDAS<span className="text-[#c4602c]">.AI</span>
              </h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[#16110c] text-[#e4ceaa] border border-[#c4602c]/40 font-mono">
                MedIA Multiagente
              </span>
            </div>
            <p className="text-xs text-[#a89279]">
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
