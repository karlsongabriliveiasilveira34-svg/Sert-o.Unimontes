# Decisão de arquitetura — Amostra parametrizável de 25 municípios

**Status:** implementada na Etapa 6
**Responsável:** Túlio
**Data:** 2026-09-03

## Contexto e decisão

O usuário final poderá informar uma fatia própria de exatamente 25 municípios,
desde que todos pertençam ao universo de 249 municípios SUDENE-MG definido na
Etapa 1. Portanto, a lista gerada na Etapa 4 não deve ser tratada como a única
amostra possível.

A lista atual, gerada por cobertura espacial, será preservada como **amostra de
referência**. Ela continua útil para demonstrações, testes de regressão e uso
quando não houver uma lista fornecida pelo usuário. Não deve ser apagada nem
regenerada por uma seleção de usuário.

A Etapa 5 calculou indicadores ambientais para os 249
municípios, e não somente para a amostra de referência. Assim, qualquer seleção
válida de 25 municípios poderá apenas filtrar resultados já preparados, sem
repetir interseções espaciais custosas.

## O que permanece inalterado

- O recorte legal e a tabela canônica `sudene_mg_municipios_2021.csv`, com 249
  códigos IBGE únicos.
- A Malha Municipal Digital 2021 do IBGE e a validação de vínculo dos 249
  polígonos.
- A geometria consolidada `area_sudene_mg_2021.geojson`, que continua sendo a
  máscara territorial do recorte completo.
- O método medoide geodésico + maximin da Etapa 4, como gerador da amostra de
  referência.
- Os arquivos já publicados da Etapa 4, preservados como evidência reproduzível
  da seleção de referência.

## Implementação realizada

1. A seleção automática de referência permaneceu em `scripts/select_sample_25.py`.
   Um validador independente, `scripts/validate_selection_25.py`, recebe a lista
   externa sem alterar a referência.
2. Definir um contrato de entrada mínimo em CSV, com uma coluna
   `codigo_ibge` e exatamente 25 linhas de dados. A ordem recebida não deve
   alterar a identidade da seleção; os códigos devem ser normalizados e
   ordenados antes da validação e do cálculo de hash.
3. No modo `lista-externa`, interromper a execução para quantidade diferente de
   25, código duplicado, código inexistente, código fora da SUDENE-MG ou coluna
   obrigatória ausente. O relatório deve listar erros de forma acionável.
4. Cada seleção é gravada em um diretório identificado por hash do conjunto de
   códigos, com manifesto contendo fonte, data, versão territorial, os 25
   códigos normalizados e hash do arquivo de entrada. Uma seleção não deve
   sobrescrever a outra nem os produtos de referência.
5. Versionar somente o exemplo de contrato e os perfis de referência. Seleções
   concretas de usuários e produtos temporários devem ficar fora do Git, pois
   são dados de execução e não a base canônica do projeto.
6. A documentação e o README foram atualizados na Etapa 6.

## Diretriz para a Etapa 5

A Etapa 5 deve produzir uma tabela ambiental por município para os 249 códigos
do universo canônico. Cada linha deverá conter, no mínimo, `codigo_ibge`, versão
da fonte de biomas, área municipal usada como denominador, áreas de Cerrado e
Caatinga, áreas de sobreposição/transição se aplicável, método de área e
indicadores de validação.

O processamento deve manter o polígono municipal completo como unidade de
interseção. Centroides servem somente para distâncias e para a futura aplicação
da Lei dos Cossenos; eles não devem ser usados para inferir proporção de biomas.

Depois disso, uma seleção de 25 códigos será uma operação de filtro sobre a
tabela de 249 municípios. A análise de distâncias deverá receber a mesma
seleção normalizada, registrar o identificador dela e nunca assumir a lista de
referência silenciosamente.

## Sequência realizada

1. A Etapa 5 foi concluída para os 249 municípios.
2. A Etapa 6 implementou e validou o contrato `lista-externa` e o manifesto.
3. A saída atual foi preservada como perfil de referência.
4. Os produtos de execução permanecem em `data/interim/`, já ignorado pelo Git.

## Critério de aceite

Aceitar a implementação quando uma lista válida de 25 códigos gerar seus
produtos isolados sem alterar os artefatos de referência ou a tabela ambiental
dos 249 municípios.
