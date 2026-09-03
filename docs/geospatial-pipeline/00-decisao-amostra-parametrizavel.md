# Decisão de arquitetura — Amostra parametrizável de 25 municípios

**Status:** aprovada para implementação antes da Etapa 5
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

Antes da Etapa 5, a pipeline será adaptada para aceitar uma seleção externa.
A Etapa 5, por sua vez, calculará indicadores ambientais para os 249
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

## O que deve mudar nesta branch

1. Refatorar `scripts/select_sample_25.py` para separar dois modos explícitos:
   `referencia-espacial` para a seleção automática atual e `lista-externa` para
   uma lista fornecida pelo usuário.
2. Definir um contrato de entrada mínimo em CSV, com uma coluna
   `codigo_ibge` e exatamente 25 linhas de dados. A ordem recebida não deve
   alterar a identidade da seleção; os códigos devem ser normalizados e
   ordenados antes da validação e do cálculo de hash.
3. No modo `lista-externa`, interromper a execução para quantidade diferente de
   25, código duplicado, código inexistente, código fora da SUDENE-MG ou coluna
   obrigatória ausente. O relatório deve listar erros de forma acionável.
4. Gravar cada seleção em um diretório identificado por hash do conjunto de
   códigos, com manifesto contendo fonte, data, versão territorial, os 25
   códigos normalizados e hash do arquivo de entrada. Uma seleção não deve
   sobrescrever a outra nem os produtos de referência.
5. Versionar somente o exemplo de contrato e os perfis de referência. Seleções
   concretas de usuários e produtos temporários devem ficar fora do Git, pois
   são dados de execução e não a base canônica do projeto.
6. Atualizar a documentação da Etapa 4 e o README com os dois modos de seleção,
   comandos de reprodução e regras de reversão.

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

## Sequência de implementação

1. Implementar e validar o contrato `lista-externa` e o manifesto de seleção.
2. Preservar e renomear conceitualmente a saída atual como perfil de referência
   na documentação, sem quebrar seus caminhos já publicados.
3. Adicionar regras ao `.gitignore` para diretórios de seleções executadas pelo
   usuário, mantendo exemplos versionados.
4. Só então iniciar a Etapa 5 com cobertura dos 249 municípios.

## Critério de aceite

Prosseguir para a Etapa 5 somente quando uma lista válida de 25 códigos puder
ser validada sem alterar os artefatos de referência e quando a especificação da
Etapa 5 assumir explicitamente os 249 municípios como universo de cálculo.
