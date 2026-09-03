# Etapa 5 — Interseção municipal com biomas do IBGE

**Status:** concluída e pronta para revisão
**Responsável:** Túlio
**Data de validação:** 2026-09-03

## Objetivo

Calcular, para os 249 municípios SUDENE-MG, as áreas e percentuais de Cerrado e
Caatinga. O produto é municipal e cobre todo o universo canônico, permitindo
filtrar posteriormente qualquer seleção válida de 25 municípios sem repetir a
operação espacial.

## Relação com a pipeline

- A Etapa 1 entrega os 249 códigos IBGE que definem quais municípios processar.
- A Etapa 2 entrega a malha oficial e validada desses municípios.
- A Etapa 3 garante a referência espacial do recorte SUDENE-MG.
- A Etapa 4 permanece como amostra espacial de referência, mas não é entrada
  obrigatória desta etapa.
- Esta etapa acrescenta o tema ambiental: intersecta cada polígono municipal
  com os polígonos oficiais de Cerrado e Caatinga e produz uma linha por
  município para consumo das análises e seleções futuras.

## Fonte primária

- IBGE, **Biomas e Sistema Costeiro-Marinho do Brasil**, escala 1:250.000,
  versão 2025: https://geoftp.ibge.gov.br/informacoes_ambientais/estudos_ambientais/biomas/vetores/2025_Biomas-e-Sistema-Costeiro-Marinho-do-Brasil-1-250000_shp.zip

O arquivo bruto preservado é `data/raw/IBGE_Biomas_SistemaCosteiro_2025.zip`.
Na tabela de atributos, `CD_BIOMA = 2` identifica Caatinga e `CD_BIOMA = 3`
identifica Cerrado.

## Método reproduzível

Instalar as dependências de cálculo no ambiente do usuário:

```powershell
py -m pip install --user -r requirements-geospatial.txt
```

Depois, executar:

```powershell
py scripts/calculate_biomes_sudene_mg.py
```

O script lê os dois ZIPs brutos diretamente, associa a malha aos 249 códigos
canônicos e faz as interseções com GEOS. Todas as áreas são medidas após a
projeção equivalente global `EPSG:6933`, em km²; o mesmo método é usado para o
numerador (bioma) e o denominador (município).

Ele interrompe a execução se o universo não tiver 249 códigos únicos, se os
arquivos DBF/SHP divergirem, se Cerrado ou Caatinga não existirem na fonte, se
houver geometria municipal inválida ou se a soma das áreas dos dois biomas
exceder a área municipal além da tolerância de 0,001 km².

## Produtos e validação

- `data/processed/biomas_municipios_sudene_mg_2025.csv`
- `data/processed/validacao_biomas_sudene_mg_2025.json`

| Verificação | Resultado |
|---|---:|
| Municípios processados | 249 |
| Municípios com Cerrado | 112 |
| Municípios com Caatinga | 40 |
| Municípios com ambos | 30 |
| Códigos fora do universo | 0 |

| Arquivo | SHA-256 |
|---|---|
| `IBGE_Biomas_SistemaCosteiro_2025.zip` | `247B15C427070805044EBE02012F15552850D535FBFECADDB359875CDDA1EA8F` |
| `biomas_municipios_sudene_mg_2025.csv` | `CCE8A42DF647844A89910EB7AD6F7E2C38E71922BC74750F5B1FDADAAC74D391` |
| `validacao_biomas_sudene_mg_2025.json` | `73669CFA1C39DB7E5EFFF0FFD3707AC4D7B4231A36EA6E1EC723C12FACA6F4E7` |

## Limites

A fonte do IBGE delimita biomas, mas não contém uma classe ou polígono de
ecótono/transição Cerrado-Caatinga. Logo, esta etapa não chama a sobreposição
de dois biomas de “transição” nem produz percentual de ecótono. Essa análise
exigirá uma fonte temática específica e será uma etapa posterior.

## Critério de aprovação

Prosseguir quando a equipe aceitar a fonte e os indicadores municipais como
base ambiental de todo o universo SUDENE-MG. A parametrização de 25 municípios
então apenas filtrará este CSV pelo contrato registrado na decisão arquitetural.
