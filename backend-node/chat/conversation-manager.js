import crypto from 'crypto';

export class ConversationManager {
  constructor() {
    this.conversations = new Map();
  }

  getOrCreateConversation(sessionId, location = null) {
    const id = sessionId || crypto.randomUUID();
    if (!this.conversations.has(id)) {
      this.conversations.set(id, {
        id,
        createdAt: new Date(),
        location: location || { state: 'MG', city: 'Montes Claros (Unimontes)' },
        messages: [],
        agentsInvolved: new Set(),
        tags: new Set(['frontend', 'sertao-unimontes'])
      });
    }
    return this.conversations.get(id);
  }

  addMessage(sessionId, { role, content, agent = null, metadata = {} }) {
    const conv = this.getOrCreateConversation(sessionId);
    const msg = {
      id: crypto.randomUUID(),
      role,
      content,
      agent,
      timestamp: new Date(),
      metadata
    };
    conv.messages.push(msg);
    if (agent) {
      conv.agentsInvolved.add(agent);
    }
    return msg;
  }

  getHistory(sessionId, limit = 10) {
    const conv = this.conversations.get(sessionId);
    if (!conv) return [];
    return conv.messages.slice(-limit);
  }

  updateLocation(sessionId, location) {
    const conv = this.getOrCreateConversation(sessionId);
    conv.location = location;
    return conv;
  }
}

export const conversationManager = new ConversationManager();
