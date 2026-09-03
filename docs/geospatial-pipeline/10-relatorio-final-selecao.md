# Etapa 10 — Relatório final da seleção

**Status:** concluída e pronta para revisão
**Responsável:** Túlio
**Data de validação:** 2026-09-03

## Objetivo

Consolidar os resultados espaciais e ambientais de uma seleção válida de 25
municípios em um produto auditável e legível. Esta é a entrega final da pipeline
geográfica e ambiental sob responsabilidade de Túlio.

## Insumos

- `manifesto.json` da Etapa 6;
- `resumo_ambiental.json` da Etapa 8;
- `resumo_espacial_lei_cossenos.json` da Etapa 9.

Os três arquivos devem possuir o mesmo identificador de seleção. O script
interrompe a execução se houver divergência, se a seleção não tiver 25 códigos
ou se a matriz espacial não tiver os 300 pares esperados.

## Execução

```powershell
py scripts/build_selection_report.py --selection-dir data/interim/selecoes/<identificador>
```

## Produtos

- `relatorio_final_selecao.json`: dados estruturados e hashes dos insumos;
- `relatorio_final_selecao.md`: versão humana com os três percentuais e métricas
  da Lei dos Cossenos.

Os produtos são específicos da seleção e ficam em `data/interim`, sendo
regeneráveis com `--force` e não versionados.

## Resultado entregue

O relatório apresenta `% Cerrado`, `% Caatinga`, `% ecótono`, distâncias mínima,
máxima e média, além dos pares mais próximo e mais distante. Ecótono não é
somado aos dois biomas. Fauna e flora não entram nesta etapa: são dados externos
da equipe responsável por banco de dados.

## Pendências não bloqueantes

- Decidir o uso de Git LFS para a camada de Vegetação 2025, que excede o limite
  de arquivo do GitHub comum.
- Criar um comando único de preparação do ambiente para reduzir etapas manuais.
