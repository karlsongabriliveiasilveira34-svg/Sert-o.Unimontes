import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { agentRouter } from './agents/routing.js';
import { conversationManager } from './chat/conversation-manager.js';
import { TECH_HUBS, getHubById, getNearestHub } from './maps/location-handler.js';
import { vectorStore } from './rag/vector-store.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Inicializa a base de conhecimento RAG
await vectorStore.init();

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Frontend AI Agents API',
    version: '1.0.0'
  });
});

// 2. Obter todos os agentes disponíveis
app.get('/api/agents', (req, res) => {
  res.json(agentRouter.getAllAgents());
});

// 3. Obter polos tecnológicos no mapa
app.get('/api/locations', (req, res) => {
  res.json(TECH_HUBS);
});

// 4. Enviar mensagem para o chat com roteamento inteligente e RAG
app.post('/api/chat/message', async (req, res) => {
  try {
    const { message, location, sessionId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Campo message é obrigatório.' });
    }

    const conversation = conversationManager.getOrCreateConversation(sessionId, location);
    const history = conversationManager.getHistory(conversation.id, 8);

    // Registra a mensagem do usuário
    conversationManager.addMessage(conversation.id, {
      role: 'user',
      content: message
    });

    // Executa roteador inteligente com RAG
    const routerResponse = await agentRouter.routeMessage(message, location || conversation.location, history);

    // Registra a resposta do agente na conversa
    const agentMsg = conversationManager.addMessage(conversation.id, {
      role: 'agent',
      content: routerResponse.text,
      agent: routerResponse.agent,
      metadata: {
        specialty: routerResponse.specialty,
        code: routerResponse.code,
        codeLanguage: routerResponse.codeLanguage,
        explanation: routerResponse.explanation,
        sources: routerResponse.sources,
        suggestions: routerResponse.suggestions,
        secondaryAgent: routerResponse.secondaryAgent,
        ragSources: routerResponse.ragSources
      }
    });

    res.json({
      sessionId: conversation.id,
      message: agentMsg,
      router: {
        intent: routerResponse.intent,
        detectedSpecialty: routerResponse.detectedSpecialty,
        secondaryAgent: routerResponse.secondaryAgent
      }
    });
  } catch (error) {
    console.error('[API Error]:', error);
    res.status(500).json({ error: 'Erro interno ao processar mensagem com agente.' });
  }
});

// 5. Histórico da conversa
app.get('/api/chat/history/:sessionId', (req, res) => {
  const history = conversationManager.getHistory(req.params.sessionId, 30);
  res.json(history);
});

// 6. Atualizar polo/localização do usuário
app.post('/api/chat/location', (req, res) => {
  const { sessionId, location } = req.body;
  const updated = conversationManager.updateLocation(sessionId, location);
  res.json({ success: true, location: updated.location });
});

app.listen(PORT, () => {
  console.log(`🚀 [Backend] Servidor de Agentes IA rodando na porta ${PORT}`);
  console.log(`📍 Polos mapeados: ${TECH_HUBS.length} | Agentes ativos: ${agentRouter.getAllAgents().length}`);
});
