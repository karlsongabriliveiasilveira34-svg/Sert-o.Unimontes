import { BaseAgent } from './base-agent.js';

export class UIUXAgent extends BaseAgent {
  constructor() {
    super(
      'ui-ux-agent',
      'ui-ux',
      'Especialista em UI/UX Design Systems',
      '✨',
      '#8B5CF6',
      'Você é um Lead Product Designer focado em Design Systems, Micro-interações, Aderência Cognitiva e Figma.'
    );
  }

  async generateResponse(message, ragContext, location, history) {
    const locPrefix = location ? `[Polo ${location.city || location.state || 'Brasil'}] ` : '';

    return {
      text: `${locPrefix}Uma experiência memorável (efeito "WOW") equilibra clareza de informação, consistência de espaçamentos (escala 8-point grid) e transições fluidas que dão sensação tátil à interface.`,
      code: `// Botão com Efeito de Feedback Háptico/Visual e Ripple Glow
import React, { useState } from 'react';

export function GlowButton({ children, onClick }) {
  const [coords, setCoords] = useState({ x: -1, y: -1 });

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <button
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-violet-400/30"
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      {coords.x !== -1 && (
        <span
          className="pointer-events-none absolute -inset-px rounded-xl opacity-40 transition-opacity duration-300 bg-radial from-white to-transparent"
          style={{
            left: coords.x - 50,
            top: coords.y - 50,
            width: 100,
            height: 100
          }}
        />
      )}
    </button>
  );
}`,
      codeLanguage: 'jsx',
      explanation: 'O efeito de spotlight interativo atrai o foco do usuário sem poluir visualmente o layout, aumentando em mais de 25% o clique em botões de ação principal (CTA).',
      followUpSuggestions: [
        'Como criar uma biblioteca de tokens de design compartilháveis?',
        'Como conduzir testes de usabilidade remotos rápidos?',
        'Diferenças entre Glassmorphism, Neumorphism e Flat 2.0'
      ]
    };
  }
}
