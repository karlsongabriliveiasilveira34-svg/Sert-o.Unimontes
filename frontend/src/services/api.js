const API_BASE = '/api';

// ==========================================
// SERVIÇO DE AGENTES MedIA
// ==========================================

export async function fetchSampleCases() {
  const res = await fetch(`${API_BASE}/cases/samples`);
  if (!res.ok) throw new Error('Falha ao buscar casos clínicos modelo');
  return res.json();
}

export async function orchestrateCase(caseData) {
  const res = await fetch(`${API_BASE}/agents/orchestrate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseData)
  });
  if (!res.ok) throw new Error('Falha ao orquestrar análise com agentes');
  return res.json();
}

export async function fetchClinicalExplanation(hypothesisName, probability, caseData) {
  const res = await fetch(`${API_BASE}/agents/explanation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hypothesisName, probability, ...caseData })
  });
  if (!res.ok) throw new Error('Falha ao obter explicação do agente');
  return res.json();
}

// ==========================================
// ROTAS GERAIS & POLOS REGIONAIS
// ==========================================

export async function fetchAgents() {
  const res = await fetch(`${API_BASE}/agents`);
  if (!res.ok) throw new Error('Falha ao carregar agentes');
  return res.json();
}

export async function fetchLocations() {
  const res = await fetch(`${API_BASE}/locations`);
  if (!res.ok) throw new Error('Falha ao carregar polos regionais');
  return res.json();
}

export async function sendMessage({ message, location, sessionId }) {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, location, sessionId })
  });
  if (!res.ok) throw new Error('Falha ao enviar mensagem ao agente');
  return res.json();
}
