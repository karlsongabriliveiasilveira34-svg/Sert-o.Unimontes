[CmdletBinding()]
param(
    [switch]$SkipPythonDependencies,
    [switch]$InstallNodeDependencies,
    [switch]$SkipVegetationDownload
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$RawDirectory = Join-Path $Root "data/raw"
$InterimDirectory = Join-Path $Root "data/interim"
$MeshZip = Join-Path $RawDirectory "MG_Municipios_2021.zip"
$MeshDirectory = Join-Path $InterimDirectory "malha_mg_2021"
$MeshSha256 = "53443CE5763AF172964E4CBF99C45C0571E23DEA4799D1AF61FD17B4BED267B4"
$VegetationZip = Join-Path $RawDirectory "IBGE_Vegetacao_250mil_2025.zip"
$VegetationDirectory = Join-Path $InterimDirectory "vegetacao_ibge_2025"
$VegetationUrl = "https://geoftp.ibge.gov.br/informacoes_ambientais/vegetacao/vetores/escala_250_mil/versao_2025/vege_area.zip"
$VegetationSha256 = "38F05C7F9B4ABCACB9AA41C35955AD67DD0A7290A3A949D584380401B2F13FA2"

function Test-Command([string]$Name) {
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Assert-FileHash([string]$Path, [string]$ExpectedHash) {
    $ActualHash = (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToUpperInvariant()
    if ($ActualHash -ne $ExpectedHash) {
        throw "Checksum SHA-256 invalido para $Path. Esperado: $ExpectedHash. Obtido: $ActualHash."
    }
}

Set-Location $Root
New-Item -ItemType Directory -Force -Path $RawDirectory, $InterimDirectory | Out-Null

if (-not (Test-Path -LiteralPath $MeshZip)) {
    throw "Fonte versionada ausente: $MeshZip. Restaure o arquivo pelo Git antes de preparar a pipeline."
}

Write-Host "Validando a malha municipal IBGE versionada..."
Assert-FileHash $MeshZip $MeshSha256
$RequiredMeshFiles = @("MG_Municipios_2021.shp", "MG_Municipios_2021.shx", "MG_Municipios_2021.dbf", "MG_Municipios_2021.prj")
$MissingMeshFiles = @($RequiredMeshFiles | Where-Object {
    -not (Test-Path -LiteralPath (Join-Path $MeshDirectory $_))
})
if ($MissingMeshFiles.Count -gt 0) {
    Write-Host "Extraindo a malha municipal IBGE..."
    Expand-Archive -LiteralPath $MeshZip -DestinationPath $MeshDirectory -Force
}

if (-not $SkipPythonDependencies) {
    if (-not (Test-Command "py")) {
        throw "Python Launcher ('py') nao encontrado. Instale Python para o usuario atual e execute novamente."
    }

    Write-Host "Instalando dependencias geoespaciais no perfil do usuario..."
    & py -m pip install --user -r requirements-geospatial.txt
    if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar as dependencias Python." }
}

if ($InstallNodeDependencies) {
    if (-not (Test-Command "pnpm")) {
        throw "pnpm nao encontrado. Instale Node.js e pnpm para o usuario atual antes de usar -InstallNodeDependencies."
    }

    Write-Host "Instalando dependencias Node travadas no pnpm-lock.yaml..."
    & pnpm install --frozen-lockfile
    if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar as dependencias Node." }
}

if (-not $SkipVegetationDownload) {
    if (Test-Path -LiteralPath $VegetationZip) {
        Write-Host "Validando a fonte de Vegetacao IBGE ja existente..."
        Assert-FileHash $VegetationZip $VegetationSha256
    }
    else {
        $TemporaryDownload = [System.IO.Path]::GetTempFileName()
        try {
            Write-Host "Baixando a fonte oficial de Vegetacao IBGE (aprox. 371 MB)..."
            Invoke-WebRequest -Uri $VegetationUrl -OutFile $TemporaryDownload
            Assert-FileHash $TemporaryDownload $VegetationSha256
            Move-Item -LiteralPath $TemporaryDownload -Destination $VegetationZip
        }
        finally {
            if (Test-Path -LiteralPath $TemporaryDownload) {
                Remove-Item -LiteralPath $TemporaryDownload -Force
            }
        }
    }

    $RequiredLayerFiles = @("vege_area.shp", "vege_area.shx", "vege_area.dbf", "vege_area.prj")
    $MissingLayerFiles = @($RequiredLayerFiles | Where-Object {
        -not (Test-Path -LiteralPath (Join-Path $VegetationDirectory $_))
    })

    if ($MissingLayerFiles.Count -gt 0) {
        Write-Host "Extraindo a camada de Vegetacao IBGE..."
        Expand-Archive -LiteralPath $VegetationZip -DestinationPath $VegetationDirectory -Force
    }
}

Write-Host "Preparacao concluida. Nenhum dado processado foi recalculado."
