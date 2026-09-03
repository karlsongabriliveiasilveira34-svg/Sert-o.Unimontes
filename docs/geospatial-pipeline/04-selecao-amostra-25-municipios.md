# Etapa 4 — Seleção espacial da amostra de 25 municípios

**Status:** concluída e pronta para revisão
**Responsável:** Túlio
**Data de validação:** 2026-09-03

## Objetivo

Definir uma amostra de referência, reproduzível e espacialmente distribuída de 25 municípios dentre os 249 municípios mineiros da área de atuação da SUDENE. A amostra serve para demonstrações e testes de regressão das próximas análises de biomas, transição entre Cerrado e Caatinga e distâncias para aplicação da Lei dos Cossenos.

Esta etapa seleciona apenas os municípios. Ela não classifica biomas, não calcula porcentagens ambientais e não infere fauna ou flora.

## Insumos

- `data/processed/sudene_mg_municipios_2021.csv`: universo canônico da Etapa 1, com 249 códigos IBGE únicos.
- `data/raw/MG_Municipios_2021.zip`: Malha Municipal Digital 2021 do IBGE, validada na Etapa 2.
- `scripts/select_sample_25.py`: script reprodutível desta etapa; lê o ZIP bruto diretamente, sem depender da pasta temporária de extração.

## Decisão metodológica

A seleção usa uma amostragem espacial determinística em duas partes:

1. O primeiro município é o **medoide geodésico**: entre os 249 centroides municipais, é aquele cuja soma das distâncias de grande círculo até todos os demais é a menor. Ele representa um ponto central do recorte sem priorizar população, área ou relevância política.
2. Cada município seguinte é escolhido por **maximin**: dentre os candidatos restantes, entra aquele cuja distância até o município já selecionado mais próximo é a maior. Isso reduz concentração territorial e amplia a cobertura do recorte.

As distâncias são calculadas entre centroides municipais com a fórmula de Haversine, usando raio terrestre de 6.371,0088 km. Empates numéricos são resolvidos pelo menor código IBGE. Assim, a lista não depende de sorteio, da ordem física do arquivo ou de decisão manual posterior.

O centroide é usado somente para orientar a distribuição espacial. Os polígonos completos continuarão sendo usados para as interseções de biomas; esta etapa não substitui geometria municipal por pontos.

## Execução reproduzível

Na raiz do repositório, executar:

```powershell
py scripts/select_sample_25.py
```

O script interrompe a execução se o universo não tiver exatamente 249 códigos únicos, se a malha não contiver o mesmo conjunto de códigos ou se o resultado não tiver exatamente 25 municípios únicos. A execução pode sobrescrever apenas os dois produtos desta etapa, permitindo regenerá-los a partir dos insumos versionados e comparar o diff antes de aceitar uma mudança.

## Produtos

- `data/processed/amostra_25_municipios_sudene_mg_2021.csv`: lista ordenada pela rodada de seleção, com código IBGE, município, centroide e distância mínima que justificou cada inclusão.
- `data/processed/validacao_amostra_25_municipios_sudene_mg_2021.json`: relatório legível por máquina com as validações e métricas de cobertura.

## Resultado da validação

| Verificação | Resultado obtido |
|---|---:|
| Municípios no universo canônico | 249 |
| Municípios candidatos na malha | 249 |
| Municípios selecionados | 25 |
| Códigos duplicados | 0 |
| Códigos fora do universo | 0 |
| Proporção da amostra | 25 / 249 (10,04%) |

As métricas de distância e o município-semente constam no relatório JSON gerado. Elas devem ser comparadas a cada reexecução para detectar alterações na malha ou no algoritmo.

### Integridade dos arquivos

| Arquivo | SHA-256 |
|---|---|
| `amostra_25_municipios_sudene_mg_2021.csv` | `7599BC38233BC7D4E431CFF63CA6F2F8DE8F64C57BE6B718F6432822D9B8B8BE` |
| `validacao_amostra_25_municipios_sudene_mg_2021.json` | `F66333BB8914DD98091B1A33ADACB0FAF625C7EC3695EAD12A616B09EE1F03A4` |

## Limites e premissas

- A amostra é espacialmente equilibrada, não estatisticamente proporcional à população, à área municipal ou a indicadores socioeconômicos. Esses critérios exigiriam fontes, pesos e uma decisão explícita da equipe.
- A seleção não garante por si só presença de ambos os biomas em todos os municípios. Isso será testado com a base ambiental na etapa seguinte.
- A Lei dos Cossenos ainda não é aplicada: os centroides e a amostra estável são os insumos para essa análise, que deve documentar pares, triângulos e a unidade de distância adotada.
- Para desfazer esta etapa, basta remover seus dois produtos gerados e o script ou restaurar o commit anterior; os insumos das Etapas 1 a 3 não são alterados.
- A seleção de referência não limita o produto a esses 25 municípios. A decisão de aceitar listas externas e o plano de adaptação antes da Etapa 5 estão em `docs/geospatial-pipeline/00-decisao-amostra-parametrizavel.md`.

## Critério de aprovação da revisão

Prosseguir somente se a equipe aceitar que os 25 municípios sejam escolhidos por cobertura espacial, sem ponderação temática, como perfil de referência. Antes da Etapa 5, deve ser implementada a seleção parametrizável descrita em `docs/geospatial-pipeline/00-decisao-amostra-parametrizavel.md`.
