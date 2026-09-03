# Etapa 7 — Ecótonos Cerrado-Caatinga

**Status:** concluída e pronta para revisão
**Responsável:** Túlio
**Data de validação:** 2026-09-03

## Objetivo

Quantificar, nos 249 municípios SUDENE-MG, as áreas oficialmente mapeadas como
contato entre Cerrado e Caatinga. O resultado complementa a Etapa 5: biomas
medem presença regional; esta etapa mede polígonos que a fonte de Vegetação
classifica explicitamente como contato/ecótono.

## Fonte e classificação

- IBGE, **Vegetação 1:250.000**, versão 2025:
  https://geoftp.ibge.gov.br/informacoes_ambientais/vegetacao/vetores/escala_250_mil/versao_2025/vege_area.zip
- Campo de classificação: `leg_contat`.

As classes aceitas foram inspecionadas na tabela oficial antes da interseção:

| Código | Denominação do IBGE | Interpretação nesta etapa |
|---|---|---|
| `ST` | Contato Savana/Savana-Estépica | contato direto Cerrado-Caatinga |
| `STN` | Contato Savana/Savana-Estépica/Floresta Estacional | contato composto que inclui Cerrado e Caatinga |

Savana é a tipologia associada ao Cerrado e Savana-Estépica à Caatinga na
classificação de vegetação do IBGE. Os dois campos são mantidos separados no
produto para que o contato composto não seja confundido com o contato direto.

## Relação com a pipeline

- Etapas 1 e 2 definem os 249 municípios e seus polígonos.
- Etapa 5 calcula proporções de Cerrado e Caatinga no universo completo.
- Esta etapa mede a transição cartografada pela Vegetação do IBGE no mesmo
  universo completo.
- A Etapa 6 pode filtrar este resultado para qualquer seleção válida de 25
  municípios sem nova interseção espacial.

## Execução reproduzível

Baixar o ZIP oficial para `data/raw/IBGE_Vegetacao_250mil_2025.zip`, conferir o
checksum e extrair em `data/interim/vegetacao_ibge_2025/`:

```powershell
Expand-Archive data/raw/IBGE_Vegetacao_250mil_2025.zip data/interim/vegetacao_ibge_2025
py scripts/calculate_ecotones_sudene_mg.py
```

O script usa GEOS para interseções e `EPSG:6933` para áreas equivalentes em km².
Ele interrompe a execução se o universo não tiver 249 municípios, se os contatos
`ST` e `STN` não existirem no recorte ou se a área de contato exceder a área de
um município.

## Produtos e validação

- `data/processed/ecotonos_cerrado_caatinga_municipios_sudene_mg_2025.csv`
- `data/processed/validacao_ecotonos_cerrado_caatinga_sudene_mg_2025.json`

| Verificação | Resultado |
|---|---:|
| Municípios processados | 249 |
| Municípios com contato ST ou STN | 8 |
| Classes de contato incluídas | 2 |

| Arquivo | SHA-256 |
|---|---|
| `IBGE_Vegetacao_250mil_2025.zip` | `38F05C7F9B4ABCACB9AA41C35955AD67DD0A7290A3A949D584380401B2F13FA2` |
| `ecotonos_cerrado_caatinga_municipios_sudene_mg_2025.csv` | `BB69A7C079A29BC2F2721ECB0E8B56868E68435E8D7A1E472D5BA0C68BAC13BA` |
| `validacao_ecotonos_cerrado_caatinga_sudene_mg_2025.json` | `F4EA4BF813D4B7BF574FB5C55E2DCAC6BC4F7C58ED7E7FE9A4A973BC2FD7745A` |

## Limites e versionamento

O ZIP oficial tem cerca de 371 MB e não pode ser enviado por Git comum ao
GitHub, cujo limite por arquivo é 100 MB. Ele fica em `data/raw` apenas na
máquina de execução e é ignorado pelo repositório; URL e checksum permitem
reproduzir a obtenção. A equipe pode adotar Git LFS em decisão posterior, caso
queira manter uma cópia da fonte no repositório remoto.

Esta etapa mede somente os contatos codificados pelo IBGE. Não estima áreas de
transição por proximidade de fronteiras, nem substitui investigação de fauna e
flora por município.

## Critério de aprovação

Prosseguir quando a equipe aceitar as classes `ST` e `STN` como definição
operacional auditável de contato Cerrado-Caatinga e decidir se o arquivo bruto
grande será mantido por Git LFS ou reproduzido pelo download oficial.
