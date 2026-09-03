# Preparacao reproduzivel do ambiente

**Status:** concluida e pronta para uso  
**Responsavel:** Tulio  
**Data de validacao:** 2026-09-03

## Objetivo

Preparar uma maquina Windows para executar as etapas geoespaciais em Python sem exigir permissoes administrativas. O comando instala as bibliotecas declaradas pelo projeto, extrai a malha municipal versionada e recupera a base de Vegetacao 2025.

Ele nao executa calculos espaciais, nao substitui arquivos em `data/processed` e nao cria uma selecao de municipios. Preparar o ambiente e executar uma etapa permanecem operacoes distintas e auditaveis.

## Comando unico

No PowerShell, a partir da raiz do repositorio, execute:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup_pipeline.ps1
```

O comando realiza, nesta ordem:

1. Confere a malha versionada `data/raw/MG_Municipios_2021.zip` pelo SHA-256 `53443CE5763AF172964E4CBF99C45C0571E23DEA4799D1AF61FD17B4BED267B4` e a extrai em `data/interim/malha_mg_2021/` se necessario.
2. Instala `pyproj` e `shapely` no perfil do usuario com `py -m pip install --user -r requirements-geospatial.txt`.
3. Baixa a fonte oficial Vegetacao 1:250.000 do IBGE apenas se ela ainda nao existir em `data/raw/IBGE_Vegetacao_250mil_2025.zip`.
4. Confere o SHA-256 `38F05C7F9B4ABCACB9AA41C35955AD67DD0A7290A3A949D584380401B2F13FA2` antes de aceitar o arquivo.
5. Extrai `vege_area.shp`, `vege_area.shx`, `vege_area.dbf` e `vege_area.prj` em `data/interim/vegetacao_ibge_2025/`, quando ainda nao estiverem presentes.

O download tem cerca de 371 MB. A maquina precisa de acesso a internet durante a primeira preparacao e de espaco livre adicional para o ZIP e para os arquivos extraidos.

## Pre-requisitos

- Windows PowerShell 5.1 ou superior.
- Python com o comando `py` disponivel para o usuario atual.
- Acesso de escrita ao clone do projeto e internet para obter a fonte externa.

Nenhum requisito exige permissao administrativa se as ferramentas forem instaladas no perfil do usuario. O comando interrompe com mensagem clara quando `py` nao esta disponivel.

## Opcoes controladas

Em uma maquina que ja tenha parte do ambiente pronta, e possivel pular blocos especificos:

```powershell
# Nao reinstala Python; ainda valida/prepara a fonte IBGE.
powershell -ExecutionPolicy Bypass -File scripts/setup_pipeline.ps1 -SkipPythonDependencies

# Apenas instala as dependencias; nao baixa nem extrai Vegetacao.
powershell -ExecutionPolicy Bypass -File scripts/setup_pipeline.ps1 -SkipVegetationDownload

# Inclui o pacote Node usado apenas para reconstruir a Etapa 3.
powershell -ExecutionPolicy Bypass -File scripts/setup_pipeline.ps1 -InstallNodeDependencies
```

## Relacao com as etapas

- A Etapa 2 usa a malha extraida. Para reconstruir a Etapa 3, instale tambem a dependencia Node com `-InstallNodeDependencies`.
- A Etapa 5 usa as bibliotecas Python e a fonte de Biomas ja versionada em `data/raw`.
- A Etapa 7 depende diretamente do ZIP de Vegetacao e do extrato em `data/interim/vegetacao_ibge_2025`; ambos sao preparados aqui.
- As demais etapas usam fontes e produtos ja versionados ou selecionados explicitamente pelo usuario.

Depois da preparacao, a Etapa 7 pode ser reproduzida com:

```powershell
py scripts/calculate_ecotones_sudene_mg.py
```

Os demais comandos permanecem documentados nas paginas de cada etapa. Isso evita que uma preparacao aparentemente inofensiva gere resultados processados sem revisao.

## Versionamento, reversao e Git LFS

O ZIP de Vegetacao nao e enviado ao GitHub: e uma fonte oficial recuperavel por URL e checksum e excede o limite do Git comum. `data/raw/IBGE_Vegetacao_250mil_2025.zip` e `data/interim/` sao ignorados pelo Git; o script, a URL e o checksum sao versionados.

Para refazer somente a camada extraida, apague manualmente `data/interim/vegetacao_ibge_2025/` e execute novamente o comando unico. Para refazer tambem o download, apague manualmente o ZIP em `data/raw/` e execute o comando outra vez. Esses dois artefatos sao reproduziveis e nao afetam o historico do repositorio.

Git LFS continua opcional e nao e necessario para a pipeline funcionar. So deve ser adotado se a equipe decidir centralizar o ZIP, confirmar a cota de LFS e garantir que todos os colaboradores instalem o cliente LFS. Ate essa decisao, o download validado e a alternativa com menor dependencia operacional.
