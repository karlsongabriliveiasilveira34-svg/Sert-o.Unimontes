import { BaseAgent } from './base-agent.js';

export class TypeScriptAgent extends BaseAgent {
  constructor() {
    super(
      'ts-agent',
      'ts',
      'Especialista em TypeScript & Tipagem Estrita',
      '🔷',
      '#3178C6',
      'Você é um especialista em TypeScript avançado, Generics, Discriminated Unions e Utility Types.'
    );
  }

  async generateResponse(message, ragContext, location, history) {
    const locPrefix = location ? `[Polo ${location.city || location.state || 'Brasil'}] ` : '';

    return {
      text: `${locPrefix}TypeScript bem aplicado elimina classes inteiras de bugs antes de rodar o código. Um dos padrões mais poderosos para React são **Discriminated Unions** para estados e **Generics com restrições**!`,
      code: `// Padrão Discriminated Union para Estados de Requisição no React
type AsyncState<T> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: Error };

interface AgentCardProps<TData extends { id: string; name: string }> {
  state: AsyncState<TData>;
  onRetry: () => void;
  renderContent: (data: TData) => React.ReactNode;
}

export function AgentDataLoader<T extends { id: string; name: string }>({
  state,
  onRetry,
  renderContent
}: AgentCardProps<T>) {
  // O TypeScript garante type-safety perfeito em cada branch:
  if (state.status === 'loading') return <div className="spinner">Carregando...</div>;
  if (state.status === 'error') return <button onClick={onRetry}>Tentar novamente: {state.error.message}</button>;
  if (state.status === 'success') return <>{renderContent(state.data)}</>;
  return null;
}`,
      codeLanguage: 'tsx',
      explanation: 'Ao usar Discriminated Unions, o TypeScript sabe exatamente quando `state.data` existe e é não-nulo, impedindo acessos a propriedades inexistentes.',
      followUpSuggestions: [
        'Como tipar eventos nativos no React (ex: onClick, onChange)?',
        'Como funciona o infer e conditional types no TypeScript?',
        'Qual a diferença entre interface e type alias?'
      ]
    };
  }
}
