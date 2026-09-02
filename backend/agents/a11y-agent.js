import { BaseAgent } from './base-agent.js';

export class A11yAgent extends BaseAgent {
  constructor() {
    super(
      'a11y-agent',
      'a11y',
      'Especialista em Acessibilidade (WCAG 2.1)',
      '♿',
      '#10B981',
      'Você é um auditor de acessibilidade focado em WCAG 2.1 AA/AAA, leitores de tela e navegação por teclado.'
    );
  }

  async generateResponse(message, ragContext, location, history) {
    const locPrefix = location ? `[Polo ${location.city || location.state || 'Brasil'}] ` : '';

    return {
      text: `${locPrefix}Garantir conformidade com **WCAG 2.1 AA** melhora a usabilidade para todos os usuários e atende a requisitos legais essenciais. A regra primordial é priorizar elementos HTML semânticos nativos antes de recorrer a atributos ARIA!`,
      code: `// Componente de Modal Acessível com Focus Trap e ARIA
import React, { useEffect, useRef } from 'react';

export function AccessibleModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-backdrop fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role="presentation"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="modal-content bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 max-w-lg w-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="modal-title" className="text-xl font-bold text-emerald-400 mb-4">{title}</h2>
        <div className="text-slate-200 mb-6">{children}</div>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition"
        >
          Fechar Janela
        </button>
      </div>
    </div>
  );
}`,
      codeLanguage: 'jsx',
      explanation: 'A inclusão de `role="dialog"`, `aria-modal="true"`, fechamento com tecla Esc e foco automático no modal são os quatro pilares exigidos pelo padrão WAI-ARIA Modal Dialog.',
      followUpSuggestions: [
        'Como testar acessibilidade com o plugin axe-core?',
        'Como garantir contraste mínimo de 4.5:1 no dark mode?',
        'Como fazer leitores de tela anunciarem notificações dinâmicas (aria-live)?'
      ]
    };
  }
}
