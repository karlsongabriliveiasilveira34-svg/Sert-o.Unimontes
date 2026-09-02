import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { agentRouter } from './agents/routing.js';
import { conversationManager } from './chat/conversation-manager.js';
import { TECH_HUBS, getHubById, getNearestHub } from './maps/location-handler.js';
import { vectorStore } from './rag/vector-store.js';
import {
  SAMPLE_CASES,
  runClinicalAgent,
  runDifferentialAgent,
  runExamsAgent,
  runProbabilityAgent,
  runSafetyAgent,
  runExplanationAgent,
  runReportAgent,
  orchestrateClinicalCase
} from './services/clinical-pipeline.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Inicializa a base de conhecimento RAG
await vectorStore.init();

// ==========================================
// 1. ROTAS GERAIS & SISTEMA FRONTEND
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Sertão.Unimontes MedIA & Front-End AI Agents API',
    version: '2.0.0'
  });
});

app.get('/api/agents', (req, res) => {
  res.json(agentRouter.getAllAgents());
});

app.get('/api/locations', (req, res) => {
  res.json(TECH_HUBS);
});

// Chat interativo para dúvidas técnicas
app.post('/api/chat/message', async (req, res) => {
  try {
    const { message, location, sessionId } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Campo message é obrigatório.' });
    }

    const conversation = conversationManager.getOrCreateConversation(sessionId, location);
    const history = conversationManager.getHistory(conversation.id, 8);

    conversationManager.addMessage(conversation.id, {
      role: 'user',
      content: message
    });

    const routerResponse = await agentRouter.routeMessage(message, location || conversation.location, history);

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

app.get('/api/chat/history/:sessionId', (req, res) => {
  const history = conversationManager.getHistory(req.params.sessionId, 30);
  res.json(history);
});

app.post('/api/chat/location', (req, res) => {
  const { sessionId, location } = req.body;
  const updated = conversationManager.updateLocation(sessionId, location);
  res.json({ success: true, location: updated.location });
});

// ==========================================
// 2. ROTAS DOS AGENTES MedIA (CONTRATOS JSON)
// ==========================================

// Lista de casos clínicos modelo
app.get('/api/cases/samples', (req, res) => {
  res.json(SAMPLE_CASES);
});

// Agente Clínico individual
app.post('/api/agents/clinical', (req, res) => {
  const result = runClinicalAgent(req.body);
  res.json(result);
});

// Agente Diagnóstico Diferencial individual
app.post('/api/agents/differential', (req, res) => {
  const clinical = runClinicalAgent(req.body);
  const result = runDifferentialAgent(clinical, req.body);
  res.json(result);
});

// Agente de Exames individual
app.post('/api/agents/exams', (req, res) => {
  const result = runExamsAgent(req.body.exames, req.body.differential || {});
  res.json(result);
});

// Agente de Probabilidade Clínica individual
app.post('/api/agents/probability', (req, res) => {
  const clinical = runClinicalAgent(req.body);
  const differential = runDifferentialAgent(clinical, req.body);
  const exams = runExamsAgent(req.body.exames, differential);
  const result = runProbabilityAgent(clinical, differential, exams);
  res.json(result);
});

// Agente de Segurança Clínica individual (Guardrail)
app.post('/api/agents/safety', (req, res) => {
  const differential = runDifferentialAgent(null, req.body);
  const exams = runExamsAgent(req.body.exames, differential);
  const result = runSafetyAgent(req.body, differential, exams);
  res.json(result);
});

// Agente de Explicação individual
app.post('/api/agents/explanation', (req, res) => {
  const { hypothesisName, probability } = req.body;
  const result = runExplanationAgent(hypothesisName, probability, req.body);
  res.json(result);
});

// Agente de Relatório individual
app.post('/api/agents/report', (req, res) => {
  const clinical = runClinicalAgent(req.body);
  const differential = runDifferentialAgent(clinical, req.body);
  const exams = runExamsAgent(req.body.exames, differential);
  const probability = runProbabilityAgent(clinical, differential, exams);
  const safety = runSafetyAgent(req.body, differential, exams);
  const result = runReportAgent(clinical, differential, exams, probability, safety);
  res.json(result);
});

// Orquestrador Central MedIA (Executa todos e retorna JSON consolidado)
app.post('/api/agents/orchestrate', (req, res) => {
  try {
    const result = orchestrateClinicalCase(req.body);
    res.json(result);
  } catch (error) {
    console.error('[Orchestration Error]:', error);
    res.status(500).json({ error: 'Erro ao orquestrar caso clínico com agentes MedIA.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [Backend] Servidor rodando na porta ${PORT}`);
  console.log(`🩺 MedIA Agent Service ativo com 8 Skills padronizadas.`);
  console.log(`📍 Polos de Inovação: ${TECH_HUBS.length} polos ativos.`);
});
