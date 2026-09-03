# 🌳 Knowledge Tree - Projeto Sertão.Unimontes

## 📌 Visão Geral
A **Knowledge Tree** (Árvore de Conhecimento Hierárquica) é a estrutura central de taxonomia e ordenação do ecossistema Sertão.Unimontes. Ela organiza e conecta o domínio regional em 5 eixos estratégicos:

1. **Biomas & Ecorregiões**: Cerrado Stricto Sensu, Caatinga Hiperxerófila e a Zona de Transição (Ecótono).
2. **Recursos Hídricos & Veredas**: Veredas & Buritizais (*Mauritia flexuosa*), Bacia do Rio São Francisco, Sub-bacia do Verde Grande, Sub-bacia do Gorutuba.
3. **Território (25 Regiões da SUDENE)**: As 25 Regiões de atuação da Superintendência do Desenvolvimento do Nordeste no Norte de Minas e Semiárido (Montes Claros, Januária, Janaúba, Salinas, Porteirinha, Francisco Sá, Pirapora, São Francisco, Bocaiúva, Taiobeiras, Rio Pardo de Minas, Jaíba, Varzelândia, Manga, Monte Azul, Mato Verde, Espinosa, Mirabela, Coração de Jesus, Brasilândia de Minas, Pedras de Maria da Cruz, Itacarambi, Chapada Gaúcha, Grão Mogol e Cristália), todas acompanhadas de seus códigos SUDENE, coordenadas geográficas e percentual de transição biogeográfica.
4. **Eixos Temáticos**: Flora & Morfologia Vegetal, Fauna & Dispersores.
5. **Acervos e Coleções Científicas**: Metadados para indexação.

---

## 🛠️ Como o José Vitor (RAG) Utiliza a Knowledge Tree

O módulo foi disponibilizado em `backend/rag/knowledge-tree.js`.

### Exemplo de Importação no RAG:
```javascript
import { knowledgeTreeEngine } from './rag/knowledge-tree.js';

// 1. Obter as 25 Regiões da SUDENE com coordenadas geográficas
const regioesSudene = knowledgeTreeEngine.getSudeneRegions();

// 2. Buscar nós por palavra-chave (ex: 'veredas' ou 'sudene')
const nosEncontrados = knowledgeTreeEngine.searchNodes('sudene');

// 3. Formatar o contexto da árvore para injetar no Prompt do RAG
const promptSnippet = knowledgeTreeEngine.formatContextPrompt('sudene-regiao-januaria');
```

---

## 🌐 Endpoints HTTP Disponíveis (Backend)

- `GET /api/knowledge-tree` - Retorna a árvore completa
- `GET /api/knowledge-tree/sudene-regions` - Retorna a lista completa das 25 Regiões da SUDENE com dados territoriais e coordenadas
- `GET /api/knowledge-tree/search?q=termo` - Pesquisa nós por label, tag ou descrição
- `GET /api/knowledge-tree/node/:id` - Retorna os dados de um nó específico e o snippet pré-formatado para o RAG
