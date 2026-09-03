import React from 'react';

/**
 * VeredasSymbol - Identidade Visual VEREDAS AI
 * Conceito: Silhueta botânica orgânica (folha e semente) onde a nervura central
 * é o curso meandrárico de uma vereda d'água, entrecortada por curvas de nível topográficas
 * e pontos nodais de biodiversidade.
 * Paleta: Terracota (#c4602c), Verde Cerrado (#526644) e Areia Quente (#e4ceaa).
 */
export function VeredasSymbol({ 
  size = 'md', 
  isPulsing = true, 
  isThinking = false, 
  className = '',
  showAura = true 
}) {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-9 h-9',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    '2xl': 'w-40 h-40 sm:w-48 sm:h-48',
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div 
      className={`relative flex items-center justify-center select-none ${currentSize} ${className}`}
      aria-label="Símbolo Veredas AI - Folha, Vereda e Linhas Topográficas"
      role="img"
    >
      {/* Halo de luz natural quente (Aura) */}
      {showAura && (
        <div 
          className={`absolute inset-0 rounded-full bg-gradient-to-tr from-[#c4602c]/20 via-[#526644]/15 to-transparent blur-xl pointer-events-none transition-all duration-700 ${
            isThinking ? 'scale-125 opacity-90' : isPulsing ? 'animate-pulse-slow' : 'opacity-30'
          }`} 
        />
      )}

      {/* Vetor SVG do Símbolo */}
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 transition-transform duration-500"
      >
        <defs>
          {/* Gradiente da Vereda (Curso d'água hídrico) */}
          <linearGradient id="veredaStream" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#e4ceaa" />
            <stop offset="45%" stopColor="#748d61" />
            <stop offset="85%" stopColor="#c4602c" />
            <stop offset="100%" stopColor="#e06e36" />
          </linearGradient>

          {/* Gradiente Terracota Folha */}
          <linearGradient id="terracottaLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e06e36" />
            <stop offset="60%" stopColor="#c4602c" />
            <stop offset="100%" stopColor="#8b4513" />
          </linearGradient>

          {/* Gradiente Verde Cerrado */}
          <linearGradient id="verdeCerradoGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#526644" />
            <stop offset="100%" stopColor="#748d61" />
          </linearGradient>

          <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Contorno externo elegante em gota / folha botânica do Cerrado */}
        <path 
          d="M 50 10 C 68 28 82 50 78 72 C 75 86 64 92 50 92 C 36 92 25 86 22 72 C 18 50 32 28 50 10 Z" 
          stroke="url(#terracottaLeaf)" 
          strokeWidth="1.8" 
          strokeLinecap="round"
          strokeOpacity="0.85"
          className={isPulsing ? 'animate-shimmer' : ''}
        />

        {/* 2. Curvas de nível topográficas que compõem as nervuras vegetais */}
        {/* Nervuras esquerdas */}
        <path 
          d="M 50 32 C 40 36 32 44 28 54" 
          stroke="url(#verdeCerradoGrad)" 
          strokeWidth="1.2" 
          strokeLinecap="round"
          strokeOpacity="0.75"
        />
        <path 
          d="M 50 48 C 38 53 30 63 26 73" 
          stroke="url(#verdeCerradoGrad)" 
          strokeWidth="1.2" 
          strokeLinecap="round"
          strokeOpacity="0.65"
        />
        <path 
          d="M 50 64 C 41 68 35 76 32 83" 
          stroke="url(#verdeCerradoGrad)" 
          strokeWidth="1.2" 
          strokeLinecap="round"
          strokeOpacity="0.5"
        />

        {/* Nervuras direitas */}
        <path 
          d="M 50 25 C 60 30 68 40 72 50" 
          stroke="#e4ceaa" 
          strokeWidth="1.2" 
          strokeLinecap="round"
          strokeOpacity="0.65"
        />
        <path 
          d="M 50 41 C 62 46 70 56 74 67" 
          stroke="#e4ceaa" 
          strokeWidth="1.2" 
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        <path 
          d="M 50 57 C 59 62 65 71 68 79" 
          stroke="#e4ceaa" 
          strokeWidth="1.2" 
          strokeLinecap="round"
          strokeOpacity="0.5"
        />

        {/* 3. O Curso Meandrárico da VEREDA (Eixo Central Hídrico) */}
        <path 
          d="M 50 12 C 53 26 46 38 52 50 C 58 62 46 76 50 90" 
          stroke="url(#veredaStream)" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          filter="url(#subtleGlow)"
        />

        {/* 4. Nós de Sementes / Pontos de Biodiversidade */}
        <circle cx="50" cy="12" r="2.5" fill="#f7ebd9" />
        <circle cx="52" cy="50" r="3" fill="#c4602c" className={isPulsing ? 'animate-pulse' : ''} />
        <circle cx="50" cy="90" r="2.5" fill="#748d61" />

        {/* Pequenos satélites de pólen / sementes flutuando */}
        <circle cx="74" cy="38" r="1.5" fill="#e4ceaa" opacity="0.8" />
        <circle cx="26" cy="62" r="1.5" fill="#e06e36" opacity="0.8" />
      </svg>
    </div>
  );
}

export default VeredasSymbol;
