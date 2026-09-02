import { BaseAgent } from './base-agent.js';

export class CSSAgent extends BaseAgent {
  constructor() {
    super(
      'css-agent',
      'css',
      'Especialista em CSS, Tailwind & Styling',
      '🎨',
      '#38BDF8',
      'Você é um designer de código especialista em CSS moderno, Tailwind CSS, Animações, Flexbox e Grid.'
    );
  }

  async generateResponse(message, ragContext, location, history) {
    const locPrefix = location ? `[Polo ${location.city || location.state || 'Brasil'}] ` : '';
    const lower = message.toLowerCase();

    if (lower.includes('grid') || lower.includes('flex') || lower.includes('responsiv') || lower.includes('layout')) {
      return {
        text: `${locPrefix}Para criar interfaces modernas e perfeitamente responsivas sem depender de dezenas de media queries, o segredo é aliar **CSS Grid (auto-fit + minmax)** para containers estruturais com **Flexbox** para o alinhamento interno dos elementos!`,
        code: `/* Container de Cards responsivo sem breakpoints manuais */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

/* Card moderno em Glassmorphism */
.glass-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 1.25rem;
  padding: 1.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
  transition: transform 0.25s ease, border-color 0.25s ease;
}

.glass-card:hover {
  transform: translateY(-4px);
  border-color: rgba(56, 189, 248, 0.6);
}`,
        codeLanguage: 'css',
        explanation: 'Com `repeat(auto-fit, minmax(320px, 1fr))`, o browser calcula sozinho quantas colunas de no mínimo 320px cabem no viewport, distribuindo o espaço restante igualmente (1fr).',
        followUpSuggestions: [
          'Como criar efeitos de glow neon em botões no Tailwind?',
          'Como animar a entrada de elementos com CSS puro?',
          'Qual a diferença de performance entre Grid e Flexbox?'
        ]
      };
    }

    if (lower.includes('animat') || lower.includes('efeito') || lower.includes('glass') || lower.includes('dark')) {
      return {
        text: `${locPrefix}Micro-animações bem dosadas transformam a experiência de uso. Recomendo usar aceleração por hardware (GPU) animando preferencialmente as propriedades **transform** e **opacity**.`,
        code: `@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(56, 189, 248, 0.7);
  }
}

.btn-cyber {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #f8fafc;
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-weight: 600;
  animation: pulseGlow 3s infinite ease-in-out;
  transition: filter 0.2s ease;
}

.btn-cyber:hover {
  filter: brightness(1.15);
}`,
        codeLanguage: 'css',
        explanation: 'Animar propriedades que afetam geometria (como width, height ou top) dispara reflows caros no navegador. Usar transform e opacity executa direto na thread de composição.',
        followUpSuggestions: [
          'Como configurar tema dark/light sem piscar a tela (FOUC)?',
          'Como fazer transição de página no React?',
          'Como construir animações baseadas no scroll (Scroll-driven animations)?'
        ]
      };
    }

    return {
      text: `${locPrefix}Posso te ajudar com toda a camada visual: CSS moderno, design tokens, Tailwind CSS, animações avançadas e compatibilidade cross-browser.`,
      code: `/* Exemplo de Utility CSS para tipografia fluida */
.fluid-heading {
  font-size: clamp(1.75rem, 4vw + 1rem, 3.5rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
}`,
      codeLanguage: 'css',
      explanation: 'O `clamp(min, val, max)` permite tipografia responsiva sem necessidade de breakpoints manuais.',
      followUpSuggestions: [
        'Como estruturar variáveis CSS para temas dinâmicos?',
        'Como centralizar um elemento vertical e horizontalmente?',
        'Melhores práticas de Tailwind em monorepos'
      ]
    };
  }
}
