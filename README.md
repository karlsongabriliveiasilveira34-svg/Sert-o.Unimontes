# Sertão.Unimontes

Projeto Sertão Unimontes.

## Equipe e Funções

O projeto é desenvolvido por uma equipe multidisciplinar, com as seguintes responsabilidades:

- **Lucas**: Integração de APIs de Banco de Dados (dados climáticos, morfológicos e de recursos hídricos) e Cibersegurança (implementação de restrições como rate limit, payload máximo de 8MB e outras medidas de segurança).
- **Túlio**: Análise de Dados Geográficos e Ambientais (aplicação da Lei dos Cossenos para análise da região de 25 cidades do Norte de Minas, além da determinação da porcentagem das áreas de transição entre Cerrado e Caatinga, focando na fauna e flora).
- **José Vitor**: Inteligência Artificial e Processamento de Dados (Implementação de RAG, indexação estruturada com árvore de vetores e arquitetura de multiagentes).
- **Karlson**: Desenvolvimento Frontend (Criação de interface web e integrações utilizando Node.js).
- **Álvaro**: Desenvolvimento Backend (Estruturação e lógica de negócios utilizando o framework Django).

## Pipeline geoespacial e ambiental

O MVP utiliza como universo de estudo a área mineira de atuação da SUDENE,
definida pela Lei Complementar nº 185/2021: 249 municípios. A amostra final
conterá 25 municípios (10,04% do universo) e será selecionada em etapas
auditáveis antes do cálculo das proporções de Cerrado e Caatinga.

### Etapa 1 — Recorte SUDENE-MG

A delimitação do universo municipal foi concluída e validada com 249 códigos
IBGE únicos. A documentação de fontes, regra de extração, validações,
checksums e premissas está em
[docs/geospatial-pipeline/01-recorte-sudene.md](docs/geospatial-pipeline/01-recorte-sudene.md).

Os dados processados estão em
`data/processed/sudene_mg_municipios_2021.csv`; o script de reprodução está em
`scripts/prepare_sudene_mg.py`.

### Etapa 2 — Vinculação à malha municipal

Os 249 códigos foram vinculados, sem ausências, aos polígonos oficiais da Malha
Municipal Digital 2021 do IBGE. O procedimento e a validação estrutural estão
registrados em
[docs/geospatial-pipeline/02-malha-municipal.md](docs/geospatial-pipeline/02-malha-municipal.md).
