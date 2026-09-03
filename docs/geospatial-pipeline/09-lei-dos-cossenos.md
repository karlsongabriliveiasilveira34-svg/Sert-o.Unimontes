# Etapa 9 — Distâncias pela Lei dos Cossenos

**Status:** concluída e pronta para revisão
**Responsável:** Túlio
**Data de validação:** 2026-09-03

## Objetivo

Calcular as distâncias de grande círculo entre todos os pares de centroides dos
25 municípios de uma seleção validada. Para 25 municípios, o produto contém
300 pares únicos.

## Método

Os centroides são calculados a partir dos polígonos da Malha Municipal Digital
2021 do IBGE. Para cada par, o script aplica a Lei dos Cossenos esférica:

```text
d = R * arccos(sen(lat1) * sen(lat2) + cos(lat1) * cos(lat2) * cos(lon2 - lon1))
```

com `R = 6.371,0088 km`. O argumento de `arccos` é limitado ao intervalo
`[-1, 1]` para evitar erro numérico por arredondamento.

## Execução

```powershell
py scripts/calculate_selection_distances.py --selection-dir data/interim/selecoes/<identificador>
```

## Produtos

- `distancias_lei_cossenos.csv`: 300 pares, seus centroides e distâncias.
- `resumo_espacial_lei_cossenos.json`: distância mínima, máxima, média e pares
  extremos.

Os arquivos ficam na pasta da seleção e são regeneráveis com `--force`. O
script bloqueia seleção diferente de 25 municípios, códigos ausentes na malha,
centroides coincidentes e tentativa de sobrescrita não explícita.

## Limites

As distâncias representam centros geométricos municipais, não rotas ou tempo de
deslocamento. A etapa não calcula fauna ou flora; esses dados pertencem à
integração de banco de dados da equipe responsável.
