import { agentRouter } from './agents/routing.js';
import { vectorStore } from './rag/vector-store.js';

async function test() {
  console.log('🧪 Iniciando teste dos Agentes de Frontend e RAG...');
  await vectorStore.init();

  const questions = [
    "Como fazer lazy loading de componentes pesados em React?",
    "Como criar um layout de grid responsivo com cards e glassmorphism?",
    "Quais as regras de acessibilidade para navegação por teclado em modais?",
    "Como otimizar LCP e reduzir tamanho do bundle?",
    "Como criar interfaces com TypeScript usando Generics e Unions?"
  ];

  for (const q of questions) {
    console.log(`\n--------------------------------------------`);
    console.log(`❓ Pergunta: "${q}"`);
    const res = await agentRouter.routeMessage(q, { city: 'Montes Claros (Unimontes)', state: 'MG' });
    console.log(`🤖 Agente Selecionado: ${res.agent} (${res.title})`);
    console.log(`🎯 Intenção: ${res.intent} | Especialidade: ${res.detectedSpecialty}`);
    console.log(`📚 Fontes RAG: ${res.sources.join(', ') || 'Nenhuma'}`);
    console.log(`💡 Prévia da resposta: ${res.text.slice(0, 100)}...`);
    if (res.code) {
      console.log(`💻 Código gerado: ${res.code.split('\n')[0]}...`);
    }
  }

  console.log('\n✅ Todos os testes de Agentes e RAG passaram com sucesso!');
}

test().catch(err => {
  console.error('❌ Erro no teste:', err);
  process.exit(1);
});
