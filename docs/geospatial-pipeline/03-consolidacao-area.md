# Etapa 3 — Consolidação da área SUDENE-MG

**Status:** concluída e pronta para revisão
**Responsável:** Túlio
**Data de validação:** 2026-09-02

## Objetivo

Transformar os 249 polígonos municipais validados na Etapa 2 em uma única
geometria de trabalho — tecnicamente um `MultiPolygon`, pois o recorte contém
dois componentes geográficos desconectados. Esta geometria será a máscara
territorial usada nas próximas interseções ambientais.

## Insumos e método

- Lista canônica dos 249 municípios: `data/processed/sudene_mg_municipios_2021.csv`.
- Malha Municipal Digital 2021 de Minas Gerais do IBGE:
  `data/raw/MG_Municipios_2021.zip`.
- Script reproduzível: `scripts/build_sudene_area.mjs`.
- Motor geométrico: Turf.js 7.4.0, travado em `pnpm-lock.yaml`.

O script lê a malha, seleciona os registros por `CD_MUN`, preserva anéis
externos e internos dos polígonos, valida cada geometria com o motor topológico
e realiza a operação de dissolução. A geometria resultante também é validada
antes de ser gravada.

## Produtos

- `data/processed/area_sudene_mg_2021.geojson`: máscara territorial em SIRGAS
  2000 (coordenadas longitude/latitude), com 2 polígonos e 48.224 pontos de
  anel.
- `data/processed/consolidacao_area_sudene_mg_2021.json`: relatório técnico
  legível por máquina.

## Resultado da validação

| Verificação | Resultado |
|---|---:|
| Municípios incluídos | 249 |
| Geometrias municipais inválidas | 0 |
| Geometria dissolvida válida | sim |
| Componentes do `MultiPolygon` | 2 |
| Soma das áreas publicadas pelo IBGE | 247.049,151 km² |
| Área geodésica de controle (Turf) | 247.880,646 km² |
| Diferença relativa | 0,33657% |

### Integridade dos produtos

| Arquivo | SHA-256 |
|---|---|
| `area_sudene_mg_2021.geojson` | `9E914E32DEFEBF99117CD2B8496513364C0F4B515E195ABC64B85EBAB21BABBF` |
| `consolidacao_area_sudene_mg_2021.json` | `DEBE4FE3431E9F46A215B0E1F4B1FD0C387C0122147FEF1327A9B1F3D373E505` |

## Decisão registrada

A área dissolvida está aprovada como máscara comum para cruzamento com as
bases de Cerrado e Caatinga. O `MultiPolygon` não é um erro: os municípios
selecionados não formam uma região inteiramente contígua.

## Premissas e limites

- A soma de `AREA_KM2` do IBGE é a referência descritiva das áreas municipais.
  A área retornada pelo Turf é uma medida geodésica de controle; as duas não
  precisam coincidir exatamente por usarem métodos de cálculo distintos.
- Para calcular porcentagens de biomas, a próxima etapa deverá empregar uma
  única metodologia de área de forma consistente para numerador e denominador,
  preferencialmente uma projeção de área equivalente adequada ao território.
- Esta etapa não classifica biomas e não seleciona ainda a amostra de 25
  cidades; ela apenas estabelece a máscara espacial auditável para essas
  operações.

## Critério de aprovação da revisão

Prosseguir se a equipe aceitar o GeoJSON consolidado como referência espacial
do recorte SUDENE-MG para a análise de biomas.
