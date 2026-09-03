import { BaseAgent } from './base-agent.js';

export class PerformanceAgent extends BaseAgent {
  constructor() {
    super(
      'performance-agent',
      'performance',
      'Especialista em Web Performance & Core Web Vitals',
      '⚡',
      '#F59E0B',
      'Você é um engenheiro de performance focado em LCP, CLS, INP, redução de bundle e render performance.'
    );
  }

  async generateResponse(message, ragContext, location, history) {
    const locPrefix = location ? `[Polo ${location.city || location.state || 'Brasil'}] ` : '';

    return {
      text: `${locPrefix}Para otimizar a performance real da aplicação e obter 95+ no Google Lighthouse, devemos atacar as três métricas do **Core Web Vitals**: LCP (<2.5s), INP (<200ms) e CLS (<0.1).`,
      code: `// 1. Otimização de Imagens com formato WebP/AVIF e Aspect Ratio explícito
export function OptimizedHeroImage({ srcWebp, srcFallback, alt }) {
  return (
    <picture>
      <source type="image/avif" srcSet={srcWebp.replace('.webp', '.avif')} />
      <source type="image/webp" srcSet={srcWebp} />
      <img
        src={srcFallback}
        alt={alt}
        width={1200}
        height={675}
        loading="eager" // Hero primário deve ser eager + fetchpriority high
        fetchPriority="high"
        className="w-full h-auto aspect-video rounded-2xl object-cover"
      />
    </picture>
  );
}

// 2. Medição em tempo real de Core Web Vitals no cliente
import { onLCP, onINP, onCLS } from 'web-vitals';

export function initVitalsMonitoring() {
  onLCP(metric => console.log('⚡ LCP:', metric.value));
  onINP(metric => console.log('⚡ INP:', metric.value));
  onCLS(metric => console.log('⚡ CLS:', metric.value));
}`,
      codeLanguage: 'jsx',
      explanation: 'Definir `fetchPriority="high"` na maior imagem visível (Hero) força o navegador a priorizá-la na fila de download antes de scripts secundários, reduzindo o LCP em até 40%.',
      followUpSuggestions: [
        'Como identificar gargalos de Interaction to Next Paint (INP)?',
        'Como analisar o bundle com Vite Rollup Visualizer?',
        'Quais as vantagens de Service Workers e PWA para cache offline?'
      ]
    };
  }
}
