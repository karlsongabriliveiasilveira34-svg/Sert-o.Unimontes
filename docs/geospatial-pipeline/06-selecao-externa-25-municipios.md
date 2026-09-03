# Etapa 6 — Seleção externa de 25 municípios

**Status:** concluída e pronta para revisão
**Responsável:** Túlio
**Data de validação:** 2026-09-03

## Objetivo

Receber uma seleção informada pelo usuário final, validar exatamente 25 códigos
IBGE da SUDENE-MG e filtrar os indicadores ambientais já calculados na Etapa 5.
Esta etapa não executa nova interseção de polígonos.

## Contrato de entrada

O CSV deve ter somente a coluna `codigo_ibge`, um código por linha e exatamente
25 linhas de dados. O exemplo versionado está em
`data/examples/selecao_25_municipios_exemplo.csv`.

## Execução

Na raiz do repositório:

```powershell
py scripts/validate_selection_25.py --input data/examples/selecao_25_municipios_exemplo.csv --source exemplo
```

O script bloqueia coluna incorreta, quantidade diferente de 25, formato inválido,
duplicidade e códigos fora dos 249 municípios SUDENE-MG. Os códigos são
ordenados antes do hash, portanto a mesma seleção em ordens diferentes recebe o
mesmo identificador.

## Produtos

Cada seleção é gravada em `data/interim/selecoes/<identificador>/`, diretório
ignorado pelo Git, com:

- `selecao_25_municipios.csv`: códigos normalizados;
- `biomas_25_municipios.csv`: filtro da Etapa 5;
- `manifesto.json`: origem declarada, hashes, versão territorial e códigos.

Uma seleção existente não é sobrescrita. Para regenerá-la de forma explícita,
usar `--force`. Para reversão, apagar apenas a pasta do identificador; os dados
canônicos e a amostra de referência da Etapa 4 não são modificados.

## Relação com as etapas anteriores

A Etapa 4 preserva a amostra espacial automática como referência. A Etapa 5
preparou indicadores para os 249 municípios. Esta etapa combina ambas as
decisões: aceita qualquer conjunto válido de 25 e apenas filtra a tabela já
processada, mantendo custo baixo e resultados rastreáveis.

## Critério de aprovação

Prosseguir quando uma lista externa válida gerar três produtos no diretório do
seu hash, sem alterar arquivos versionados nem reprocessar os biomas.
