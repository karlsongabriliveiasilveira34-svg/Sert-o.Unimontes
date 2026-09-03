"""
Motor Vetorial RAG com TF-IDF e Similaridade de Cossenos em Python.
Responsável: José Vitor (Inteligência Artificial e RAG)
"""

import os
import re
import math
import unicodedata
from typing import List, Dict, Any, Optional, Set


class DocumentChunk:
    def __init__(
        self,
        chunk_id: str,
        source: str,
        specialty: str,
        content: str,
        tokens: List[str],
    ):
        self.id = chunk_id
        self.source = source
        self.specialty = specialty.lower()
        self.content = content
        self.tokens = tokens
        self.vector: Optional[Dict[int, float]] = None
        self.norm: float = 1.0


class VectorStore:
    """
    Índice vetorial em memória para RAG local baseado em TF-IDF e Similaridade de Cossenos.
    """

    def __init__(self, docs_directory: Optional[str] = None) -> None:
        self.docs_directory = docs_directory or os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "docs"
        )
        self.documents: List[DocumentChunk] = []
        self.vocabulary: Dict[str, int] = {}
        self.doc_frequencies: Dict[str, int] = {}
        self.initialized: bool = False

    def initialize(self) -> None:
        """Carrega os arquivos Markdown, divide em chunks, constrói vocabulário e vetoriza."""
        if self.initialized:
            return

        self.documents.clear()
        self.vocabulary.clear()
        self.doc_frequencies.clear()

        if os.path.exists(self.docs_directory):
            self._load_directory(self.docs_directory)
            self._build_vocabulary()
            self._compute_embeddings()

        self.initialized = True

    def _load_directory(self, base_dir: str, current_specialty: str = "") -> None:
        for entry in os.scandir(base_dir):
            if entry.is_dir():
                self._load_directory(entry.path, entry.name)
            elif entry.is_file() and entry.name.endswith(".md"):
                specialty = current_specialty or os.path.basename(os.path.dirname(entry.path))
                try:
                    with open(entry.path, "r", encoding="utf-8") as f:
                        content = f.read()
                    self._chunk_and_store(content, entry.name, specialty)
                except Exception as err:
                    print(f"[VectorStore Error reading {entry.path}]: {err}")

    def _chunk_and_store(self, content: str, filename: str, specialty: str) -> None:
        # Divide por cabeçalhos ## de seção markdown
        sections = re.split(r"(?=^##\s+)", content, flags=re.MULTILINE)
        for idx, section in enumerate(sections):
            trimmed = section.strip()
            if len(trimmed) > 30:
                tokens = self.tokenize(trimmed)
                if tokens:
                    chunk_id = f"{filename}-{len(self.documents)}"
                    self.documents.append(
                        DocumentChunk(
                            chunk_id=chunk_id,
                            source=filename,
                            specialty=specialty,
                            content=trimmed,
                            tokens=tokens,
                        )
                    )

    @staticmethod
    def tokenize(text: str) -> List[str]:
        """
        Normaliza texto: converte para minúsculas, remove acentos via decomposição NFKD,
        substitui pontuação por espaços e extrai palavras com mais de 2 caracteres.
        """
        nfkd = unicodedata.normalize("NFD", text.lower())
        no_accents = "".join(c for c in nfkd if unicodedata.category(c) != "Mn")
        cleaned = re.sub(r"[^\w\s]", " ", no_accents)
        tokens = [w for w in cleaned.split() if len(w) > 2]
        return tokens

    def _build_vocabulary(self) -> None:
        for doc in self.documents:
            unique_tokens: Set[str] = set(doc.tokens)
            for token in unique_tokens:
                if token not in self.vocabulary:
                    self.vocabulary[token] = len(self.vocabulary)
                self.doc_frequencies[token] = self.doc_frequencies.get(token, 0) + 1

    def _compute_embeddings(self) -> None:
        total_docs = len(self.documents)
        if total_docs == 0:
            return

        for doc in self.documents:
            tf: Dict[str, int] = {}
            for token in doc.tokens:
                tf[token] = tf.get(token, 0) + 1

            doc_vec: Dict[int, float] = {}
            sum_sq = 0.0

            for token, count in tf.items():
                token_idx = self.vocabulary.get(token)
                if token_idx is not None:
                    df = self.doc_frequencies.get(token, 1)
                    # Fórmula IDF com suavização
                    idf = math.log((total_docs + 1) / (df + 1)) + 1.0
                    weight = count * idf
                    doc_vec[token_idx] = weight
                    sum_sq += weight * weight

            norm = math.sqrt(sum_sq) or 1.0
            # Normalização L2 para cálculo unitário do cosseno
            doc.vector = {idx: w / norm for idx, w in doc_vec.items()}
            doc.norm = 1.0

    def search(
        self,
        query: str,
        target_specialty: Optional[str] = None,
        top_k: int = 3,
    ) -> List[Dict[str, Any]]:
        """
        Calcula similaridade por cossenos entre a query e a base vetorial.
        Aplica boost de 1.35x caso o documento corresponda à especialidade requisitada.
        """
        if not self.initialized:
            self.initialize()

        if not self.documents:
            return []

        query_tokens = self.tokenize(query)
        if not query_tokens:
            return []

        # Vetor da query com contagem de frequência e vocabulário existente
        q_tf: Dict[int, float] = {}
        sum_sq = 0.0
        for token in query_tokens:
            idx = self.vocabulary.get(token)
            if idx is not None:
                q_tf[idx] = q_tf.get(idx, 0.0) + 1.0

        for idx, count in q_tf.items():
            sum_sq += count * count

        query_norm = math.sqrt(sum_sq) or 1.0
        query_vec = {idx: count / query_norm for idx, count in q_tf.items()}

        results = []
        target_spec_clean = target_specialty.strip().lower() if target_specialty else None

        for doc in self.documents:
            if not doc.vector:
                continue

            # Produto escalar (similaridade de cossenos para vetores normalizados)
            dot_product = 0.0
            for idx, q_weight in query_vec.items():
                if idx in doc.vector:
                    dot_product += q_weight * doc.vector[idx]

            # Bônus de 1.35x se o documento pertencer à especialidade do agente
            if target_spec_clean and doc.specialty == target_spec_clean:
                dot_product *= 1.35

            if dot_product > 0.02:
                results.append({
                    "score": round(dot_product, 4),
                    "source": doc.source,
                    "specialty": doc.specialty,
                    "content": doc.content,
                })

        results.sort(key=lambda item: item["score"], reverse=True)
        return results[:top_k]


# Instância padrão singleton para ser compartilhada na aplicação
default_vector_store = VectorStore()
