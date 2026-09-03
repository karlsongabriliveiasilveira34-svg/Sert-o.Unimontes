import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { agentRouter } from './agents/routing.js';
import { conversationManager } from './chat/conversation-manager.js';
import { TECH_HUBS, getHubById, getNearestHub } from './maps/location-handler.js';
import { vectorStore } from './rag/vector-store.js';
import { knowledgeTreeEngine } from './rag/knowledge-tree.js';
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
    service: 'VEREDAS AI - Biodiversidade, Morfologia & Território API',
    version: '3.0.0'
  });
});

app.get('/api/agents', (req, res) => {
  res.json([
    { name: 'flora-agent', title: 'Agente de Flora & Morfologia' },
    { name: 'fauna-agent', title: 'Agente de Fauna & Dispersão' },
    { name: 'hydrology-agent', title: 'Agente de Veredas & Bacias' },
    { name: 'ecology-agent', title: 'Agente de Ecologia & Território' }
  ]);
});

app.get('/api/locations', (req, res) => {
  res.json(TECH_HUBS);
});

// ==========================================
// KNOWLEDGE TREE API (Árvore de Conhecimento)
// ==========================================

// Retorna a árvore de conhecimento completa
app.get('/api/knowledge-tree', (req, res) => {
  res.json(knowledgeTreeEngine.getRoot());
});

// Busca nós na árvore por termo ou tag
app.get('/api/knowledge-tree/search', (req, res) => {
  const query = req.query.q || '';
  const results = knowledgeTreeEngine.searchNodes(query);
  res.json(results);
});

// Retorna as 25 Regiões da SUDENE mapeadas na árvore
app.get('/api/knowledge-tree/sudene-regions', (req, res) => {
  res.json(knowledgeTreeEngine.getSudeneRegions());
});

app.get('/api/knowledge-tree/regions', (req, res) => {
  res.json(knowledgeTreeEngine.getSudeneRegions());
});

// Retorna o nó por ID e seu contexto formatado para o RAG do José Vitor
app.get('/api/knowledge-tree/node/:id', (req, res) => {
  const node = knowledgeTreeEngine.findNodeById(req.params.id);
  if (!node) {
    return res.status(404).json({ error: 'Nó da Knowledge Tree não encontrado.' });
  }
  const promptContext = knowledgeTreeEngine.formatContextPrompt(req.params.id);
  res.json({ node, promptContext });
});

// Chat interativo de Biodiversidade e Território
app.post('/api/chat/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Campo message é obrigatório.' });
    }

    const lower = message.toLowerCase();
    let responsePayload;

    if (lower.includes('ipê') || lower.includes('ipe') || lower.includes('árvore') || lower.includes('flora')) {
      responsePayload = {
        title: 'Diagnose Morfológica: Ipê-amarelo do Cerrado',
        scientificName: 'Handroanthus chrysotrichus (Mart. ex DC.) Mattos',
        family: 'Bignoniaceae',
        biome: 'Cerrado sensu stricto & Campos Rupestres',
        summary: 'O ipê-amarelo do Cerrado destaca-se por sua espetacular floração dourada síncrona no auge da seca e adaptações de casca suberosa contra o fogo.',
        morphology: {
          leaves: 'Folhas 5-digitadas com pelos estrelados dourados protetores na face inferior.',
          bark: 'Tronco rugoso com espessa camada de cortiça que isola o câmbio vascular das queimadas sazonais.',
          flowers: 'Inflorescências terminais amarelas vibrantes ricas em néctar concentrado.',
          adaptation: 'Desfolha total antes da floração para economizar reservas hídricas vitais.'
        },
        ecologicalNote: 'Polinização primária por abelhas de grande porte (Bombus e Centris), fundamental para a fenologia do Cerrado.',
        sources: ['Herbário Digital Unimontes', 'Flora do Brasil 2020']
      };
    } else if (lower.includes('lobo') || lower.includes('guará') || lower.includes('fauna')) {
      responsePayload = {
        title: 'Ecologia e Morfologia: Lobo-guará',
        scientificName: 'Chrysocyon brachyurus',
        family: 'Canidae',
        biome: 'Cerrado, Savanas Abertas e Bordas de Veredas',
        summary: 'O maior canídeo da América do Sul e o mais importante dispersor biológico de sementes nativas do Cerrado.',
        morphology: {
          leaves: 'Pelagem fulva-avermelhada com crina dorsal preta erétil de sinalização territorial.',
          bark: 'Membros muito longos e finos para locomoção ágil sobre a vegetação graminosa densa.',
          flowers: 'Orelhas amplas e móveis com audição de alta frequência para detectar presas no solo.',
          adaptation: 'Dieta onívora: alimenta-se intensamente do fruto da lobeira, quebrando a dormência das sementes.'
        },
        ecologicalNote: 'Mutualismo ecológico clássico: a preservação do lobo-guará garante a regeneração da flora do semiárido.',
        sources: ['ICMBio Livro Vermelho', 'Laboratório de Mastozoologia Unimontes']
      };
    } else {
      responsePayload = {
        title: 'Investigação Territorial Veredas AI',
        scientificName: 'Ecologia e Conhecimento do Território',
        family: 'Bioma Cerrado & Caatinga',
        biome: 'Planalto Central & Semiárido',
        summary: `Consulta analisada: "${message}". Informações fundamentadas nos padrões ecológicos e botânicos do Sertão.`,
        morphology: {
          leaves: 'Estruturas foliares escleromórficas com ceras e tricomas protetores.',
          bark: 'Casca espessa com alto teor de súber e adaptação evolutiva ao fogo e à radiação solar.',
          flowers: 'Fenologia síncrona com atração de polinizadores locais especializados.',
          adaptation: 'Sistemas subterrâneos profundos (xilopódios) para acesso à água de aquíferos.'
        },
        ecologicalNote: 'As veredas atuam como corredores biológicos essenciais para a conservação da biodiversidade.',
        sources: ['Base Territorial Veredas', 'Repositório Científico Unimontes']
      };
    }

    res.json({
      sessionId: sessionId || 'session-' + Date.now(),
      message: {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        timestamp: new Date().toISOString(),
        ...responsePayload
      }
    });
  } catch (error) {
    console.error('[API Error]:', error);
    res.status(500).json({ error: 'Erro interno ao processar mensagem territorial.' });
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
