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

### Etapa 3 — Consolidação da área de estudo

Os limites municipais foram dissolvidos em uma geometria válida, pronta para
interseções com bases de biomas. A decisão, os indicadores de validação e os
limites metodológicos estão em
[docs/geospatial-pipeline/03-consolidacao-area.md](docs/geospatial-pipeline/03-consolidacao-area.md).

### Etapa 4 — Seleção da amostra de 25 municípios

Os 25 municípios de referência foram selecionados por um método determinístico
de cobertura espacial, a partir dos 249 municípios do recorte. A regra de
seleção, os produtos e as validações estão em
[docs/geospatial-pipeline/04-selecao-amostra-25-municipios.md](docs/geospatial-pipeline/04-selecao-amostra-25-municipios.md).

A pipeline será parametrizada antes da Etapa 5 para receber qualquer seleção
válida de 25 municípios do recorte, mantendo a amostra atual como referência.
A decisão e o plano de adaptação estão em
[docs/geospatial-pipeline/00-decisao-amostra-parametrizavel.md](docs/geospatial-pipeline/00-decisao-amostra-parametrizavel.md).

### Etapa 5 — Interseção com biomas IBGE

As áreas e percentuais de Cerrado e Caatinga foram calculados para os 249
municípios do universo, permitindo atender seleções futuras sem repetir o
cruzamento espacial. Fonte, método, validações e limites estão em
[docs/geospatial-pipeline/05-intersecao-biomas-ibge.md](docs/geospatial-pipeline/05-intersecao-biomas-ibge.md).

### Etapa 6 — Seleção externa de 25 municípios

Uma lista externa de 25 códigos IBGE pode ser validada e filtrada contra os
indicadores ambientais já preparados, sem novo cruzamento espacial. O contrato
e o procedimento estão em
[docs/geospatial-pipeline/06-selecao-externa-25-municipios.md](docs/geospatial-pipeline/06-selecao-externa-25-municipios.md).

### Etapa 7 — Ecótonos Cerrado-Caatinga

Os contatos oficiais de vegetação entre Cerrado e Caatinga foram identificados
para os 249 municípios, distinguindo contato direto e composto. A fonte,
classificação, validações e limite de versionamento estão em
[docs/geospatial-pipeline/07-ecotonos-cerrado-caatinga.md](docs/geospatial-pipeline/07-ecotonos-cerrado-caatinga.md).
