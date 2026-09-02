import { BaseAgent } from './base-agent.js';

export class ReactAgent extends BaseAgent {
  constructor() {
    super(
      'react-agent',
      'react',
      'Especialista em React & Next.js',
      '⚛️',
      '#61DAFB',
      'Você é um arquiteto especialista em React 18/19, Server Components, Custom Hooks e Gestão de Estado.'
    );
  }

  async generateResponse(message, ragContext, location, history) {
    const locPrefix = location ? `[Polo ${location.city || location.state || 'Brasil'}] ` : '';
    const lower = message.toLowerCase();

    if (lower.includes('lazy') || lower.includes('code splitting') || lower.includes('suspense')) {
      return {
        text: `${locPrefix}Excelente questão! O uso de **React.lazy** associado ao **Suspense** permite desmembrar o bundle em chunks sob demanda, reduzindo drasticamente o tempo de carregamento inicial (LCP).`,
        code: `import React, { lazy, Suspense } from 'react';

// 1. Carregamento assíncrono do módulo pesado
const HeavyChart = lazy(() => import('./components/HeavyChart'));

export default function AnalyticsView() {
  return (
    <div className="analytics-card p-6 bg-slate-900 border border-cyan-500/20 rounded-2xl">
      <h2 className="text-xl font-bold text-cyan-400 mb-4">Relatório do Sertão</h2>
      
      {/* 2. Suspense boundary isolado com fallback amigável */}
      <Suspense fallback={
        <div className="flex items-center justify-center h-48 bg-slate-800/60 rounded-xl animate-pulse text-cyan-300/70">
          Carregando dados cartográficos e climáticos...
        </div>
      }>
        <HeavyChart region="Norte de Minas" />
      </Suspense>
    </div>
  );
}`,
        codeLanguage: 'jsx',
        explanation: 'Ao encapsular componentes com React.lazy, o Vite ou Webpack cria automaticamente um chunk isolado. Dica de ouro: adicione preload sob eventos de hover no menu para transições com 0ms de atraso perceptível!',
        followUpSuggestions: [
          'Como implementar prefetch dinâmico ao passar o mouse?',
          'Como tratar erros de rede no chunk com ErrorBoundary?',
          'Qual a diferença entre React.lazy e Dynamic Imports no Next.js?'
        ]
      };
    }

    if (lower.includes('hook') || lower.includes('state') || lower.includes('zustand') || lower.includes('redux')) {
      return {
        text: `${locPrefix}Para gerenciamento de estado moderno, a recomendação atual é separar **estado de servidor** (com TanStack Query) de **estado de cliente global** (com Zustand ou Context API para estados leves).`,
        code: `import { create } from 'zustand';

// Store Zustand leve e performático sem boilerplate
export const useFilterStore = create((set) => ({
  selectedRegion: 'Montes Claros - Unimontes',
  biomeFilter: 'Cerrado/Caatinga',
  setRegion: (region) => set({ selectedRegion: region }),
  setBiome: (biome) => set({ biomeFilter: biome })
}));`,
        codeLanguage: 'javascript',
        explanation: 'Zustand não força re-renderizações desnecessárias em componentes que não utilizam as fatias modificadas, ao contrário do Context padrão sem memoização granular.',
        followUpSuggestions: [
          'Quando devo migrar de Context API para Zustand?',
          'Como criar um Custom Hook reutilizável?',
          'Como integrar React Query com cache otimista?'
        ]
      };
    }

    // Resposta padrão especializada com RAG
    return {
      text: `${locPrefix}Como especialista em ecossistema React, posso te apoiar na arquitetura de componentes, ciclo de renderização, criação de Custom Hooks e integração com o backend.`,
      code: `// Exemplo: Custom Hook com AbortController para cancelamento seguro
import { useState, useEffect } from 'react';

export function useFetchWithAbort(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(err => { if (err.name !== 'AbortError') console.error(err); });

    return () => controller.abort();
  }, [url]);

  return { data, loading };
}`,
      codeLanguage: 'jsx',
      explanation: ragContext ? `Baseado no conhecimento catalogado:\n${ragContext.slice(0, 200)}...` : 'Lembre-se de sempre manter os hooks puros e sem efeitos colaterais fora do useEffect.',
      followUpSuggestions: [
        'Como otimizar re-renders em listas grandes?',
        'Qual a melhor estrutura de pastas para uma SPA React?',
        'Como funciona o novo compilador do React 19?'
      ]
    };
  }
}
