# Especificação dos Agentes Especialistas de Front-End com IA

## 📌 Visão Geral
Este documento define as especificações, habilidades e comportamento de cada agente do ecossistema Sertão.Unimontes.

| Agente | Especialidade | Avatar | Foco Principal |
| :--- | :--- | :---: | :--- |
| **ReactAgent** | `react` | ⚛️ | Hooks, State Management (Zustand/Query), Next.js, Suspense, Server Components |
| **CSSAgent** | `css` | 🎨 | Flexbox, Grid auto-fit, Tailwind CSS, Glassmorphism, Micro-animações GPU |
| **A11yAgent** | `a11y` | ♿ | WCAG 2.1 AA/AAA, ARIA Roles, Navegação por Teclado, Contraste de Cores |
| **PerformanceAgent** | `performance` | ⚡ | Core Web Vitals (LCP, INP, CLS), Code Splitting, Bundle Size, Caching |
| **SEOAgent** | `seo` | 🔍 | Open Graph, JSON-LD Structured Data, SSR/SSG, Metatags Dinâmicas |
| **UIUXAgent** | `ui-ux` | ✨ | Design Systems, Hierarquia Visual 8-point, Efeito WOW, Usabilidade |
| **TypeScriptAgent** | `ts` | 🔷 | Generics, Discriminated Unions, Utility Types, Tipagem Estrita |

---

## 🗺️ Polos Tecnológicos Vinculados
- **Montes Claros / Unimontes (MG)**: Foco em soluções de impacto regional, performance e acessibilidade.
- **Belo Horizonte (MG)**: Startups escaláveis, ecossistema San Pedro Valley.
- **São Paulo (SP)**: Fintechs, arquitetura de alta escala e Core Web Vitals.
- **Rio de Janeiro (RJ)**: Economia criativa, design systems e UI/UX.
- **Recife (PE)**: Porto Digital, sistemas distribuídos e TypeScript.
- **Florianópolis (SC)**: SaaS e usabilidade refinada.

---

## 🧠 Arquitetura RAG Local
- Processamento vetorial em memória com cálculo de TF-IDF e Similaridade de Cossenos.
- Respostas fundamentadas em documentações markdown locais sem risco de alucinações.
- Fallback autônomo com suporte a integração de APIs externas (Claude, Gemini, OpenAI).
