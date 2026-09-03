# Etapa 8 — Resumo ambiental da seleção de 25 municípios

**Status:** concluída e pronta para revisão
**Responsável:** Túlio
**Data de validação:** 2026-09-03

## Objetivo

Entregar os três indicadores consolidados da seleção válida de 25 municípios:
percentual de Cerrado, percentual de Caatinga e percentual de ecótono
Cerrado-Caatinga oficialmente mapeado.

## Método

A Etapa 6 fornece a seleção validada e a tabela de biomas filtrada. A Etapa 7
fornece os ecótonos dos 249 municípios. Esta etapa vincula os mesmos 25 códigos,
soma as áreas equivalentes `EPSG:6933` e calcula cada percentual pela área total
da seleção.

```text
percentual temático = soma da área temática / soma da área municipal dos 25 * 100
```

O ecótono é uma métrica independente: representa polígonos de contato `ST` e
`STN` da Vegetação do IBGE. Portanto, os três percentuais não devem ser somados
como se fossem classes mutuamente exclusivas.

## Execução

Após executar a Etapa 6, usar o diretório que ela gerou:

```powershell
py scripts/summarize_selection_environment.py --selection-dir data/interim/selecoes/<identificador>
```

O script bloqueia manifestos que não tenham 25 códigos únicos, tabelas de
biomas que não correspondam à seleção, códigos ausentes nos ecótonos ou áreas
municipais divergentes entre as Etapas 5 e 7.

## Produto

`data/interim/selecoes/<identificador>/resumo_ambiental.json` contém as três
áreas, os três percentuais, hashes dos insumos e o identificador da seleção.
Ele é dado de execução e não é versionado; pode ser regenerado com `--force`.

## Critério de aprovação

Prosseguir quando uma seleção válida produzir os três indicadores sem executar
novas interseções espaciais e sem alterar as fontes canônicas.
