import { ReactAgent } from './react-agent.js';
import { CSSAgent } from './css-agent.js';
import { A11yAgent } from './a11y-agent.js';
import { PerformanceAgent } from './performance-agent.js';
import { SEOAgent } from './seo-agent.js';
import { UIUXAgent } from './ui-ux-agent.js';
import { TypeScriptAgent } from './ts-agent.js';
import { semanticSearch } from '../rag/semantic-search.js';

export class AgentRouter {
  constructor() {
    this.agents = {
      react: new ReactAgent(),
      css: new CSSAgent(),
      a11y: new A11yAgent(),
      performance: new PerformanceAgent(),
      seo: new SEOAgent(),
      'ui-ux': new UIUXAgent(),
      ts: new TypeScriptAgent()
    };

    this.specialtyKeywords = {
      react: ['react', 'hook', 'useeffect', 'usestate', 'usememo', 'usecallback', 'zustand', 'redux', 'next.js', 'nextjs', 'jsx', 'component', 'props', 'context', 'suspense'],
      css: ['css', 'flex', 'flexbox', 'grid', 'tailwind', 'sass', 'estilo', 'style', 'responsiv', 'media query', 'glassmorphism', 'animac', 'transic', 'gradiente', 'layout'],
      a11y: ['acessib', 'a11y', 'wcag', 'aria', 'leitor de tela', 'screen reader', 'teclado', 'contraste', 'foco', 'focus', 'alt text'],
      performance: ['performance', 'desempenho', 'lcp', 'fid', 'inp', 'cls', 'web vitals', 'bundle', 'lazy', 'code splitting', 'lighthouse', 'otimiz', 'waterfall', 'prefetch'],
      seo: ['seo', 'google', 'index', 'meta tag', 'open graph', 'sitemap', 'robots', 'crawler', 'ranking', 'schema.org', 'json-ld', 'rich snippet'],
      'ui-ux': ['ui', 'ux', 'design', 'interface', 'usabilidade', 'figma', 'design system', 'micro-interac', 'dark mode', 'paleta', 'feedback visual', 'experiencia'],
      ts: ['typescript', 'ts', 'tipo', 'type', 'interface', 'generic', 'generics', 'union', 'tsconfig', 'tipagem', 'any', 'unknown']
    };
  }

  async routeMessage(userMessage, userLocation = null, chatHistory = []) {
    // 1. Análise Semântica de Intenção e Especialidade
    const intent = this.analyzeIntent(userMessage);
    const specialty = this.detectSpecialty(userMessage, chatHistory);
    
    // 2. RAG: Buscar contexto relevante na base de conhecimento vetorial
    const ragContext = await semanticSearch(userMessage, specialty, 3);

    // 3. Determinar Agente Primário e Secundário
    const primaryAgent = this.agents[specialty] || this.agents.react;
    const secondaryAgent = this.selectSecondaryAgent(intent, specialty);

    // 4. Executar processamento do agente primário
    const result = await primaryAgent.process({
      message: userMessage,
      context: ragContext,
      location: userLocation,
      history: chatHistory
    });

    return {
      ...result,
      intent,
      detectedSpecialty: specialty,
      secondaryAgent: secondaryAgent ? {
        name: secondaryAgent.name,
        specialty: secondaryAgent.specialty,
        title: secondaryAgent.title,
        avatar: secondaryAgent.avatar
      } : null,
      ragSources: ragContext.map(r => ({
        source: r.source,
        score: r.score,
        specialty: r.specialty
      }))
    };
  }

  analyzeIntent(message) {
    const text = message.toLowerCase();
    if (text.includes('como') || text.includes('o que é') || text.includes('aprender') || text.includes('guia')) {
      return 'learning';
    }
    if (text.includes('otimiz') || text.includes('rapido') || text.includes('lento') || text.includes('melhorar')) {
      return 'optimization';
    }
    if (text.includes('erro') || text.includes('bug') || text.includes('nao funciona') || text.includes('quebrou') || text.includes('falha')) {
      return 'bug-fix';
    }
    if (text.includes('arquitetura') || text.includes('estrutura') || text.includes('padrao') || text.includes('pattern')) {
      return 'architecture';
    }
    return 'general-consultation';
  }

  detectSpecialty(message, chatHistory = []) {
    const text = message.toLowerCase();
    const scores = {};

    for (const [spec, keywords] of Object.entries(this.specialtyKeywords)) {
      scores[spec] = 0;
      for (const kw of keywords) {
        if (text.includes(kw)) {
          scores[spec] += 2;
        }
      }
    }

    // Levar em conta o contexto das últimas 2 mensagens
    if (chatHistory.length > 0) {
      const recent = chatHistory.slice(-2).map(m => m.content || '').join(' ').toLowerCase();
      for (const [spec, keywords] of Object.entries(this.specialtyKeywords)) {
        for (const kw of keywords) {
          if (recent.includes(kw)) {
            scores[spec] += 0.5;
          }
        }
      }
    }

    let bestSpec = 'react';
    let highestScore = 0;
    for (const [spec, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        bestSpec = spec;
      }
    }

    return bestSpec;
  }

  selectSecondaryAgent(intent, specialty) {
    if (specialty === 'react' && intent === 'optimization') return this.agents.performance;
    if (specialty === 'css' && intent === 'learning') return this.agents['ui-ux'];
    if (specialty === 'react' && intent === 'architecture') return this.agents.ts;
    if (specialty === 'ui-ux') return this.agents.a11y;
    return null;
  }

  getAllAgents() {
    return Object.values(this.agents).map(a => ({
      name: a.name,
      specialty: a.specialty,
      title: a.title,
      avatar: a.avatar,
      accentColor: a.accentColor
    }));
  }
}

export const agentRouter = new AgentRouter();
