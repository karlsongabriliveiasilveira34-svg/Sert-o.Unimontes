import { vectorStore } from './vector-store.js';

export async function semanticSearch(query, specialty, topK = 3) {
  await vectorStore.init();
  const results = vectorStore.search(query, specialty, topK);
  return results.map(r => ({
    source: r.source,
    score: parseFloat(r.score.toFixed(3)),
    specialty: r.specialty,
    snippet: r.content
  }));
}
