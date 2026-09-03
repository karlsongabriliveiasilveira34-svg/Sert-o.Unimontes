export class BaseAgent {
  constructor(name, specialty, title, avatar, accentColor, systemPrompt) {
    this.name = name;
    this.specialty = specialty;
    this.title = title;
    this.avatar = avatar;
    this.accentColor = accentColor;
    this.systemPrompt = systemPrompt;
  }

  async process({ message, context, location, history }) {
    // 1. Enriquecer contexto com dados recuperados do RAG
    const ragContext = context && context.length > 0 
      ? context.map(c => `[Fonte: ${c.source}]\n${c.snippet}`).join('\n\n')
      : '';

    // 2. Gerar resposta especializada
    const response = await this.generateResponse(message, ragContext, location, history);

    return {
      agent: this.name,
      specialty: this.specialty,
      title: this.title,
      avatar: this.avatar,
      accentColor: this.accentColor,
      text: response.text,
      code: response.code || null,
      codeLanguage: response.codeLanguage || 'jsx',
      explanation: response.explanation || null,
      sources: (context || []).map(c => c.source),
      suggestions: response.followUpSuggestions || this.getDefaultSuggestions()
    };
  }

  async generateResponse(message, ragContext, location, history) {
    // Implementado pelas classes derivadas
    throw new Error('generateResponse deve ser implementado pelo agente.');
  }

  getDefaultSuggestions() {
    return [
      "Quais são as melhores práticas para esse caso?",
      "Como testar esse comportamento?",
      "Pode me dar outro exemplo prático?"
    ];
  }
}
