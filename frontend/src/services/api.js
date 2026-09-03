/**
 * Sertão.Unimontes — Camada de Serviços e Integração de APIs
 * Conecta o Front-end React/Vite aos endpoints do Django REST Framework.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Função utilitária para tratamento padronizado de requisições e erros de rede
 */
async function handleResponse(res, errorMessage = 'Erro na requisição') {
  if (res.status === 413) {
    throw new Error('O payload enviado ultrapassou o limite máximo de 8 MB permitido pela segurança do servidor (HTTP 413).');
  }
  if (res.status === 429) {
    throw new Error('Limite de taxa de requisições excedido. Por favor, aguarde alguns segundos antes de tentar novamente (HTTP 429).');
  }
  if (!res.ok) {
    let errorDetail = '';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.error || JSON.stringify(errJson);
    } catch {
      errorDetail = res.statusText;
    }
    throw new Error(`${errorMessage} (${res.status}): ${errorDetail}`);
  }
  return res.json();
}

// ==============================================================================
// 1. MONITORAMENTO & SAÚDE DO SERVIÇO (Lucas / Álvaro)
// ==============================================================================

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    return await handleResponse(res, 'Falha no health-check do backend');
  } catch (err) {
    console.warn('Backend Django inacessível no momento:', err.message);
    return { status: 'offline', error: err.message };
  }
}

// ==============================================================================
// 2. AGENTES DE BIODIVERSIDADE & POLOS REGIONAIS (José Vitor / Álvaro)
// ==============================================================================

export async function fetchAgents() {
  const res = await fetch(`${API_BASE}/agents`, {
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(res, 'Falha ao carregar lista de especialistas');
}

export async function fetchLocations() {
  const res = await fetch(`${API_BASE}/locations`, {
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(res, 'Falha ao carregar polos regionais');
}

// ==============================================================================
// 3. CHAT TERRITORIAL & BIODIVERSIDADE (José Vitor / Karlson)
// ==============================================================================

export async function sendMessage({ message, location = {}, sessionId = 'veredas-session' }) {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ message, location, sessionId })
  });
  return handleResponse(res, 'Falha ao processar mensagem no chat territorial');
}

export async function fetchChatHistory(sessionId) {
  const res = await fetch(`${API_BASE}/chat/history/${encodeURIComponent(sessionId)}`, {
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(res, 'Falha ao buscar histórico de mensagens');
}

// ==============================================================================
// 4. PIPELINE AMBIENTAL, LEI DOS COSSENOS & SUDENE-MG (Túlio)
// ==============================================================================

export async function fetchSudeneCities() {
  const res = await fetch(`${API_BASE}/ambiental/sudene`, {
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(res, 'Falha ao carregar universo legal SUDENE-MG (249 cidades)');
}

export async function fetchSample25Cities() {
  const res = await fetch(`${API_BASE}/ambiental/amostra-25`, {
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(res, 'Falha ao carregar amostra das 25 cidades do Norte de Minas');
}

export async function calculateGeodesicDistance(origemIbge, destinoIbge) {
  const res = await fetch(`${API_BASE}/ambiental/distancias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origem_ibge: origemIbge,
      destino_ibge: destinoIbge
    })
  });
  return handleResponse(res, 'Falha ao calcular distância via Lei dos Cossenos Esférica');
}

export async function fetchBiomeTransition() {
  const res = await fetch(`${API_BASE}/ambiental/transicao-biomas`, {
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(res, 'Falha ao obter dados de transição Cerrado-Caatinga');
}

export async function analyzeDegradation(data = {}) {
  const res = await fetch(`${API_BASE}/ambiental/analise-degradacao/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return handleResponse(res, 'Falha ao executar análise de degradação e segmentação Erosion-SAM');
}

export async function segmentErosionImage(formDataOrData) {
  const options = {
    method: 'POST',
    headers: { 'Accept': 'application/json' }
  };

  if (formDataOrData instanceof FormData) {
    options.body = formDataOrData;
  } else {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(formDataOrData || {});
  }

  const res = await fetch(`${API_BASE}/ambiental/segment/`, options);
  return handleResponse(res, 'Falha na inferência Erosion-SAM em CPU Ryzen');
}

// ==============================================================================
// 5. CLIMA, TELEMETRIA & VEREDAS (Lucas)
// ==============================================================================

export async function fetchRecentClimate() {
  const res = await fetch(`${API_BASE}/clima-hidro/clima/recente`, {
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(res, 'Falha ao buscar dados climáticos recentes');
}

export async function fetchVeredas() {
  const res = await fetch(`${API_BASE}/clima-hidro/veredas`, {
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(res, 'Falha ao listar veredas do Cerrado');
}

// ==============================================================================
// 6. MOTOR RAG VETORIAL & ROTEAMENTO SEMÂNTICO (José Vitor)
// ==============================================================================

export async function searchRAG(query, topK = 3) {
  const res = await fetch(`${API_BASE}/ia/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: topK })
  });
  return handleResponse(res, 'Falha ao realizar busca vetorial RAG');
}

export async function routeSemanticIntent(query) {
  const res = await fetch(`${API_BASE}/ia/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return handleResponse(res, 'Falha no roteamento semântico de intenção');
}

export async function fetchRAGStats() {
  const res = await fetch(`${API_BASE}/ia/stats`, {
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(res, 'Falha ao carregar estatísticas do VectorStore');
}
