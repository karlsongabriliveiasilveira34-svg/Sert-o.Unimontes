import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class VectorStore {
  constructor() {
    this.documents = [];
    this.vocabulary = new Map();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    const docsBaseDir = path.join(__dirname, 'docs');
    if (fs.existsSync(docsBaseDir)) {
      this.loadDirectory(docsBaseDir);
      this.buildVocabulary();
      this.computeEmbeddings();
    }
    this.initialized = true;
    console.log(`[VectorStore] Carregados ${this.documents.length} blocos de conhecimento RAG.`);
  }

  loadDirectory(dir, currentSpecialty = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        this.loadDirectory(fullPath, entry.name);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const specialty = currentSpecialty || path.basename(path.dirname(fullPath));
        this.chunkAndStore(content, entry.name, specialty);
      }
    }
  }

  chunkAndStore(content, filename, specialty) {
    // Quebra por seções de título markdown (##)
    const sections = content.split(/(?=^##\s+)/m);
    for (const section of sections) {
      const trimmed = section.trim();
      if (trimmed.length > 30) {
        this.documents.push({
          id: `${filename}-${this.documents.length}`,
          source: filename,
          specialty: specialty.toLowerCase(),
          content: trimmed,
          tokens: this.tokenize(trimmed),
          vector: null
        });
      }
    }
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  buildVocabulary() {
    let index = 0;
    for (const doc of this.documents) {
      for (const token of doc.tokens) {
        if (!this.vocabulary.has(token)) {
          this.vocabulary.set(token, index++);
        }
      }
    }
  }

  computeEmbeddings() {
    const vocabSize = this.vocabulary.size;
    const numDocs = this.documents.length;
    
    // Cálculo de IDF
    const docFreq = new Map();
    for (const doc of this.documents) {
      const uniqueTokens = new Set(doc.tokens);
      for (const token of uniqueTokens) {
        docFreq.set(token, (docFreq.get(token) || 0) + 1);
      }
    }

    // Vetores TF-IDF normalizados (cosseno)
    for (const doc of this.documents) {
      const vec = new Float32Array(vocabSize);
      const tf = new Map();
      for (const token of doc.tokens) {
        tf.set(token, (tf.get(token) || 0) + 1);
      }

      let norm = 0;
      for (const [token, count] of tf.entries()) {
        const idx = this.vocabulary.get(token);
        const idf = Math.log((numDocs + 1) / ((docFreq.get(token) || 0) + 1)) + 1;
        const weight = count * idf;
        vec[idx] = weight;
        norm += weight * weight;
      }

      norm = Math.sqrt(norm) || 1;
      for (let i = 0; i < vocabSize; i++) {
        vec[i] = vec[i] / norm;
      }
      doc.vector = vec;
    }
  }

  search(query, targetSpecialty = null, topK = 3) {
    if (!this.initialized) return [];
    const queryTokens = this.tokenize(query);
    const vocabSize = this.vocabulary.size;
    const queryVec = new Float32Array(vocabSize);
    
    let norm = 0;
    for (const token of queryTokens) {
      if (this.vocabulary.has(token)) {
        const idx = this.vocabulary.get(token);
        queryVec[idx] += 1;
        norm += 1;
      }
    }

    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < vocabSize; i++) {
      queryVec[i] = queryVec[i] / norm;
    }

    // Similaridade de cossenos
    const scores = [];
    for (const doc of this.documents) {
      if (targetSpecialty && doc.specialty !== targetSpecialty.toLowerCase()) {
        // Leve penalidade se não for a especialidade solicitada
        // mas ainda permite fallback caso seja muito relevante
      }

      let dotProduct = 0;
      for (let i = 0; i < vocabSize; i++) {
        dotProduct += queryVec[i] * doc.vector[i];
      }

      if (targetSpecialty && doc.specialty === targetSpecialty.toLowerCase()) {
        dotProduct *= 1.35; // boost na especialidade detectada
      }

      if (dotProduct > 0.05) {
        scores.push({
          score: dotProduct,
          source: doc.source,
          specialty: doc.specialty,
          content: doc.content
        });
      }
    }

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, topK);
  }
}

export const vectorStore = new VectorStore();
