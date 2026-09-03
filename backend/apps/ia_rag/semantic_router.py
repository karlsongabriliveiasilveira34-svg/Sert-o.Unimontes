"""
Roteador Semântico de Intenções e Seleção de Agentes Especialistas.
Responsável: José Vitor (Inteligência Artificial e RAG)
"""

from typing import Dict, List, Any, Optional


class SemanticRouter:
    """
    Classifica a intenção da mensagem e mapeia para os agentes primário e secundário.
    """

    SPECIALTY_KEYWORDS = {
        "react": [
            "react", "hook", "useeffect", "usestate", "usememo", "usecallback",
            "zustand", "redux", "next.js", "nextjs", "jsx", "component", "props",
            "context", "suspense",
        ],
        "css": [
            "css", "flex", "flexbox", "grid", "tailwind", "sass", "estilo", "style",
            "responsiv", "media query", "glassmorphism", "animac", "transic", "gradiente", "layout",
        ],
        "a11y": [
            "acessib", "a11y", "wcag", "aria", "leitor de tela", "screen reader",
            "teclado", "contraste", "foco", "focus", "alt text",
        ],
        "performance": [
            "performance", "desempenho", "lcp", "fid", "inp", "cls", "web vitals",
            "bundle", "lazy", "code splitting", "lighthouse", "otimiz", "waterfall", "prefetch",
        ],
        "seo": [
            "seo", "google", "index", "meta tag", "open graph", "sitemap", "robots",
            "crawler", "ranking", "schema.org", "json-ld", "rich snippet",
        ],
        "ui-ux": [
            "ui", "ux", "design", "interface", "usabilidade", "figma", "design system",
            "micro-interac", "dark mode", "paleta", "feedback visual", "experiencia",
        ],
        "ts": [
            "typescript", "ts", "tipo", "type", "interface", "generic", "generics",
            "union", "tsconfig", "tipagem", "any", "unknown",
        ],
    }

    AGENTS_METADATA = {
        "react": {"name": "react-agent", "title": "Agente Especialista React", "specialty": "react"},
        "css": {"name": "css-agent", "title": "Agente Especialista CSS & Estilos", "specialty": "css"},
        "a11y": {"name": "a11y-agent", "title": "Agente de Acessibilidade (WCAG)", "specialty": "a11y"},
        "performance": {"name": "performance-agent", "title": "Agente de Performance Web", "specialty": "performance"},
        "seo": {"name": "seo-agent", "title": "Agente de SEO & Indexação", "specialty": "seo"},
        "ui-ux": {"name": "ui-ux-agent", "title": "Agente de UI/UX & Design System", "specialty": "ui-ux"},
        "ts": {"name": "ts-agent", "title": "Agente de Tipagem TypeScript", "specialty": "ts"},
    }

    def analyze_intent(self, message: str) -> str:
        """Classifica a intenção da mensagem."""
        text = message.lower()
        if any(term in text for term in ["erro", "bug", "nao funciona", "quebrou", "falha", "exception"]):
            return "bug-fix"
        if any(term in text for term in ["otimiz", "rapido", "lento", "melhorar", "gargalo"]):
            return "optimization"
        if any(term in text for term in ["arquitetura", "estrutura", "padrao", "pattern", "clean"]):
            return "architecture"
        if any(term in text for term in ["como", "o que é", "aprender", "guia", "exemplo"]):
            return "learning"
        return "general-consultation"

    def detect_specialty(self, message: str, chat_history: Optional[List[Dict[str, Any]]] = None) -> str:
        """Identifica a especialidade técnica dominante pelo vocabulário."""
        text = message.lower()
        scores: Dict[str, float] = {spec: 0.0 for spec in self.SPECIALTY_KEYWORDS}

        for spec, keywords in self.SPECIALTY_KEYWORDS.items():
            for kw in keywords:
                if kw in text:
                    scores[spec] += 2.0

        # Considera contexto das últimas 2 mensagens do histórico se houver
        if chat_history:
            recent_texts = " ".join(
                str(msg.get("content", "")) for msg in chat_history[-2:]
            ).lower()
            for spec, keywords in self.SPECIALTY_KEYWORDS.items():
                for kw in keywords:
                    if kw in recent_texts:
                        scores[spec] += 0.5

        best_spec = "react"
        highest = 0.0
        for spec, score in scores.items():
            if score > highest:
                highest = score
                best_spec = spec

        return best_spec

    def select_secondary_agent(self, intent: str, specialty: str) -> Optional[Dict[str, str]]:
        """Seleciona um agente secundário colaborativo para enriquecer a resposta."""
        sec_spec: Optional[str] = None

        if specialty == "react" and intent == "optimization":
            sec_spec = "performance"
        elif specialty == "css" and intent == "learning":
            sec_spec = "ui-ux"
        elif specialty == "react" and intent == "architecture":
            sec_spec = "ts"
        elif specialty == "ui-ux":
            sec_spec = "a11y"

        if sec_spec and sec_spec in self.AGENTS_METADATA:
            return self.AGENTS_METADATA[sec_spec]
        return None

    def route(self, message: str, chat_history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Executa a análise completa de roteamento."""
        intent = self.analyze_intent(message)
        primary_specialty = self.detect_specialty(message, chat_history)
        primary_agent = self.AGENTS_METADATA.get(primary_specialty, self.AGENTS_METADATA["react"])
        secondary_agent = self.select_secondary_agent(intent, primary_specialty)

        return {
            "intent": intent,
            "detected_specialty": primary_specialty,
            "primary_agent": primary_agent,
            "secondary_agent": secondary_agent,
        }


# Instância singleton do roteador semântico
default_semantic_router = SemanticRouter()
