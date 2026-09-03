# Sertão.Unimontes — Backend Django

**Universidade Estadual de Montes Claros (Unimontes)**  
Plataforma Integrada de Geoprocessamento Territorial, Cibersegurança, Monitoramento Ambiental/Climático e Inteligência Artificial Multiagente focada no Norte de Minas Gerais e no Semiárido.

---

## 1. Atribuições da Equipe e Arquitetura

- **Álvaro (Backend Lead):** Arquitetura em camadas (Clean Architecture), Django 5.x, Django REST Framework, ORM, migrações e integração de esteiras.
- **Lucas (Cibersegurança e Banco de Dados):**
  - Middleware de restrição de payload máximo de **8 MB** (`MaxPayloadSizeMiddleware`), rejeitando com `HTTP 413 Payload Too Large`.
  - Rate Limiting estrito (60 req/min para anônimos, 300 req/min para autenticados).
  - Modelagem e persistência de estações climáticas, séries temporais meteorológicas, bacias hidrográficas e veredas do Cerrado.
- **Túlio (Geoprocessamento e Dados Ambientais):**
  - Universo normativo legal SUDENE-MG 2021 (**249 municípios**, LC nº 185/2021).
  - Subconjunto amostral auditável de **25 cidades no Norte de Minas** (10,04% do universo), polo Montes Claros (`3143302`).
  - Implementação canônica da **Lei dos Cossenos Esférica** ($R = 6371.0088\text{ km}$) para matriz geodésica.
  - Proporções e faixas de transição ecotonal Cerrado–Caatinga.
- **José Vitor (Inteligência Artificial e RAG):**
  - Motor RAG vetorial local em Python com cálculo de TF-IDF e Similaridade de Cossenos com boosting de relevância de `1.35x`.
  - Roteador Semântico de intenções (`learning`, `optimization`, `bug-fix`, `architecture`, `general-consultation`) e seleção de agente secundário colaborativo.
  - Indexação de base de conhecimento em Markdown para 7 especialidades (`react`, `css`, `a11y`, `performance`, `seo`, `ui-ux`, `ts`).
- **Karlson (Front-End React/Vite):**
  - Compatibilidade **100% plug-and-play** com as chamadas de `frontend/src/services/api.js`, chat territorial imersivo de biodiversidade (Flora, Fauna, Hidrologia e Ecologia do Cerrado).

---

## 2. Estrutura de Diretórios

```
backend/
├── manage.py
├── pytest.ini
├── requirements.txt
├── .env.example
├── .env
├── Dockerfile
├── docker-compose.yml
├── config/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── core/                  # Middlewares (8MB), Throttles, Health Check
│   ├── ambiental/             # SUDENE 249, Amostra 25, Lei dos Cossenos, Biomas
│   │   ├── services/
│   │   │   ├── spherical_cosine.py
│   │   │   └── biome_service.py
│   │   └── management/commands/load_sertao_data.py
│   ├── clima_hidro/           # Estações climáticas, telemetria, bacias e veredas
│   ├── ia_rag/                # VectorStore (TF-IDF + Cosseno), SemanticRouter, Docs
│   │   └── docs/              # 7 especialidades em Markdown
│   └── chat_territorial/      # Chat de Biodiversidade, Polos Tecnológicos e Histórico
├── data/                      # CSVs e GeoJSON SUDENE 2021
└── tests/                     # 25 testes automatizados (100% de aprovação)
```

---

## 3. Instruções de Instalação e Execução

### 3.1 Pré-requisitos
- Python 3.12+
- Pip

### 3.2 Instalação das Dependências
```bash
cd backend
pip install -r requirements.txt
```

### 3.3 Executar Migrações
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3.4 Carga Inicial de Dados (Seed Data)
```bash
python manage.py load_sertao_data
```
Esse comando realiza:
1. Leitura de `data/sudene_mg_municipios_2021.csv` e cadastro dos 249 municípios SUDENE-MG com coordenadas e estimativas de bioma.
2. Definição da amostra das 25 cidades prioritárias do Norte de Minas (Montes Claros como polo).
3. Cadastramento dos 6 polos tecnológicos oficiais e sessão demo.
4. Inicialização de bacias hidrográficas, veredas e telemetria meteorológica.

### 3.5 Iniciar o Servidor de Desenvolvimento
```bash
python manage.py runserver 0.0.0.0:8000
```

---

## 4. Execução da Suíte de Testes Automatizados

### Via Django Test:
```bash
python manage.py test tests
```

### Via Pytest:
```bash
pytest
```
*Resultado: 25 testes executados e aprovados com 100% de sucesso.*

---

## 5. Principais Endpoints da API REST

| Endpoint | Método | Descrição |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Health Check da API (status online, serviço e timestamp). |
| `/api/agents` | `GET` | Lista os 4 agentes de biodiversidade do Cerrado. |
| `/api/locations` | `GET` | Lista os 6 polos tecnológicos (Montes Claros, BH, SP, RJ, Recife, Florianópolis). |
| `/api/chat/message` | `POST` | Chat interativo do território (diagnose do Ipê-amarelo, Lobo-guará, etc.). |
| `/api/chat/history/<sessionId>` | `GET` | Histórico paginado da sessão de chat. |
| `/api/chat/location` | `POST` | Atualiza polo tecnológico selecionado na sessão. |
| `/api/ambiental/sudene/` | `GET` | Lista os 249 municípios SUDENE-MG com filtro de busca. |
| `/api/ambiental/amostra-25/` | `GET` | Lista as 25 cidades selecionadas do Norte de Minas. |
| `/api/ambiental/distancias/` | `POST` | Matriz de distâncias via Lei dos Cossenos Esférica. |
| `/api/ambiental/transicao-biomas/` | `GET` | Estatísticas da transição Cerrado–Caatinga. |
| `/api/clima-hidro/clima/recente/` | `GET` | Telemetria meteorológica recente do Norte de Minas. |
| `/api/clima-hidro/veredas/` | `GET` | Catálogo de veredas e status de preservação. |
| `/api/ia/search/` | `POST` | Busca por similaridade cosseno no RAG vetorial (boost 1.35x). |
| `/api/ia/route/` | `POST` | Roteamento semântico de intenções e agentes de front-end. |
