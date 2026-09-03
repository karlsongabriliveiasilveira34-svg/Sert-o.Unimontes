# Etapa 1 — Delimitação da área de estudo SUDENE-MG

**Status:** concluída e pronta para revisão
**Responsável:** Túlio
**Data de validação:** 2026-09-02

## Objetivo

Estabelecer um universo municipal legal, reproduzível e auditável para a amostra de 25 cidades do MVP AIRA.

## Decisão registrada

O universo do projeto será a **área mineira de atuação da SUDENE**, e não a mesorregião administrativa "Norte de Minas" nem a delimitação do Semiárido. A fonte normativa é a Lei Complementar nº 185/2021. O produto geoespacial oficial do IBGE, versão 2021, classifica 249 municípios de Minas Gerais como pertencentes à área de atuação da SUDENE.

Essa escolha preserva a definição usada no escopo do MVP (249 municípios) e permite uma seleção de 25 cidades correspondente a 10,04% do universo.

## Fontes primárias

- IBGE, **Área de Atuação da SUDENE**: https://www.ibge.gov.br/geociencias/organizacao-do-territorio/estrutura-territorial/34331-area-de-atuacao-da-sudene.html
- Lei Complementar nº 185, de 6 de outubro de 2021: https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp185.htm
- Geosserviço IBGE (camada `CGMAT:qg_2021_070_areasudene`): https://geoservicos.ibge.gov.br/geoserver/CGMAT/wms?service=WMS&request=GetCapabilities

## Insumos versionados

- `data/raw/SUDENE_2021.xls`: tabela oficial original do IBGE, preservada sem edição.
- `data/raw/SUDENE_2021.ods`: alternativa oficial do mesmo conteúdo, preservada sem edição.
- `data/raw/SUDENE_MG_2021_atributos.geojson`: exportação WFS com atributos dos municípios mineiros.
- `data/processed/sudene_mg_municipios_2021.csv`: tabela canônica gerada para as próximas etapas.

### Integridade dos arquivos

| Arquivo | SHA-256 |
|---|---|
| `SUDENE_2021.xls` | `AEF65198DF88F266AE2A3DEE9C867B057421DE0A9E90841F613AFC5B0A422AEF` |
| `SUDENE_2021.ods` | `12E790109B8DFFA4D2333CC50C2E15F5795B53A9E0C80000CBA995805B05FB1B` |
| `SUDENE_MG_2021_atributos.geojson` | `DD85D89F40EAAE7EC3F691DE1F2A2001E63D2BF7E8E37913C5E5EDBB09E6A62B` |
| `sudene_mg_municipios_2021.csv` | `CE8513B813E66248248430199B01FC5970C06E4E90C6BEBCEFE0B9FE85BA166D` |

## Regra de extração

1. Consultar a camada oficial do IBGE;
2. restringir a Minas Gerais pelo prefixo `31` do código IBGE municipal;
3. manter apenas registros com `cd_sudene = "1"`;
4. ordenar pelo código IBGE;
5. interromper o pipeline se o resultado não tiver exatamente 249 códigos únicos.

O script reprodutível é `scripts/prepare_sudene_mg.py`.

Para a extração de atributos foi usado o endpoint WFS oficial, limitado aos campos
`cd_recorte`, `cd_sudene`, `nm_sudene`, `cd_mun` e `nm_mun`. A geometria não foi
baixada nesta etapa: ela será obtida e validada separadamente na Etapa 2.

## Resultado de validação

| Verificação | Resultado esperado | Resultado obtido |
|---|---:|---:|
| Municípios mineiros na camada | 853 | 853 |
| Municípios com `cd_sudene = 1` | 249 | 249 |
| Códigos IBGE únicos no recorte | 249 | 249 |
| Proporção da amostra planejada | 25 / 249 | 10,04% |

## Limites e premissas

- Esta etapa ainda não determina quais serão os 25 municípios.
- A área de atuação legal da SUDENE não deve ser confundida com o Semiárido: há sobreposição, mas os recortes possuem finalidades e regras distintas.
- A próxima etapa usará a malha municipal do IBGE compatível com a versão territorial escolhida para verificar geometrias e associar os polígonos aos 249 códigos.

## Critério de aprovação da revisão

A equipe deve confirmar que **"SUDENE-MG, 2021, 249 municípios"** é o recorte oficial do MVP. Com a aprovação, a Etapa 2 poderá baixar e validar a malha municipal.
