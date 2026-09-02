const API_BASE = '/api';

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

export async function updateLocation(sessionId, location) {
  const res = await fetch(`${API_BASE}/chat/location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, location })
  });
  if (!res.ok) throw new Error('Falha ao atualizar localização');
  return res.json();
}
