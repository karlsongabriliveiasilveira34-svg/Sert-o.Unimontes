# Etapa 2 — Malha Municipal Digital e validação geométrica

**Status:** concluída e pronta para revisão
**Responsável:** Túlio
**Data de validação:** 2026-09-02

## Objetivo

Associar os 249 municípios da área mineira de atuação da SUDENE aos seus
polígonos oficiais e bloquear o pipeline caso existissem divergências de códigos
ou geometrias estruturalmente inválidas.

## Fonte primária

- IBGE, **Malha Municipal Digital 2021 — Minas Gerais**:
  https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_municipais/municipio_2021/UFs/MG/MG_Municipios_2021.zip

A versão 2021 foi escolhida para ser compatível com o recorte SUDENE adotado na
Etapa 1. O arquivo `.prj` declara SIRGAS 2000, em coordenadas geográficas.

## Insumos e produtos

- `data/raw/MG_Municipios_2021.zip`: distribuição original do IBGE, preservada sem edição.
- `data/interim/malha_mg_2021/`: conteúdo temporariamente extraído do ZIP; é reproduzível a partir do dado bruto e não será versionado.
- `data/processed/sudene_mg_malha_index_2021.csv`: índice dos 249 polígonos vinculados aos códigos IBGE.
- `data/processed/validacao_malha_sudene_mg_2021.json`: relatório de validação legível por máquina.
- `scripts/validate_malha_sudene_mg.py`: validação reprodutível de DBF/SHP.

### Integridade dos arquivos

| Arquivo | SHA-256 |
|---|---|
| `MG_Municipios_2021.zip` | `53443CE5763AF172964E4CBF99C45C0571E23DEA4799D1AF61FD17B4BED267B4` |
| `sudene_mg_malha_index_2021.csv` | `E34DE8B8478C3CF10543A4B95F81DA26629DD13E33DC78BE15EBCC8E49C160D1` |
| `validacao_malha_sudene_mg_2021.json` | `679C8FC9348CFA9BAC7B17A6FF653EDF5C4B50D0B8CCE0130579B4EABD5A615C` |

## Validações executadas

1. Conferência de assinatura e estrutura do Shapefile e do DBF.
2. Leitura dos 853 municípios da malha de Minas Gerais.
3. Vínculo por `CD_MUN` com a tabela canônica SUDENE-MG da Etapa 1.
4. Confirmação de 249 códigos correspondentes, sem ausência ou duplicidade.
5. Para cada polígono selecionado: tipo Polygon, ao menos uma parte e quatro
   pontos, anel fechado, coordenadas finitas e caixa envolvente válida.

## Resultado de validação

| Verificação | Resultado obtido |
|---|---:|
| Municípios na malha de MG | 853 |
| Municípios SUDENE-MG | 249 |
| Correspondências por código IBGE | 249 |
| Códigos SUDENE sem polígono | 0 |
| Geometrias inválidas no recorte | 0 |
| CRS | SIRGAS 2000 geográfico |

## Decisão registrada

A malha está apta para a Etapa 3. Ainda não foi calculada área nem feita união de
polígonos; isso ocorrerá somente após esta revisão, para que qualquer problema de
limite municipal seja isolado antes da análise espacial.

### Limite desta validação

A validação desta etapa é **estrutural**: confere registros, anéis, coordenadas e
caixas envolventes. Uma validação topológica completa — por exemplo,
auto-interseções e sobreposições — será executada antes das operações de união e
interseção da Etapa 3, com um motor de geometria apropriado.

## Critério de aprovação da revisão

Prosseguir apenas se a equipe aceitar a Malha Municipal Digital 2021 do IBGE como
base geométrica dos 249 municípios do recorte SUDENE-MG.
