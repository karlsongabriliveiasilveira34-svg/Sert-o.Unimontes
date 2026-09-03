"""
Serviço de Análise de Transição Ecotonal Cerrado-Caatinga.
Responsável: Túlio (Geoprocessamento e Dados Ambientais)
"""

from typing import Dict, Any, List


def calculate_biome_statistics(municipios_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calcula métricas consolidadas sobre a sobreposição e proporção dos biomas
    Cerrado e Caatinga nos municípios da área de estudo SUDENE-MG.
    """
    total_municipios = len(municipios_data)
    if total_municipios == 0:
        return {
            "total_municipios": 0,
            "media_pct_cerrado": 0.0,
            "media_pct_caatinga": 0.0,
            "municipios_ecotonais": 0,
            "predominancia_cerrado": 0,
            "predominancia_caatinga": 0,
            "resumo": "Nenhum município cadastrado."
        }

    soma_cerrado = 0.0
    soma_caatinga = 0.0
    ecotonais = 0  # Municípios com presença expressiva de ambos os biomas (ex: > 10% de cada)
    pred_cerrado = 0
    pred_caatinga = 0

    for mun in municipios_data:
        pct_cer = float(mun.get("pct_cerrado", 0.0))
        pct_caa = float(mun.get("pct_caatinga", 0.0))
        
        soma_cerrado += pct_cer
        soma_caatinga += pct_caa

        if pct_cer >= 10.0 and pct_caa >= 10.0:
            ecotonais += 1

        if pct_cer >= pct_caa:
            pred_cerrado += 1
        else:
            pred_caatinga += 1

    media_cerrado = round(soma_cerrado / total_municipios, 2)
    media_caatinga = round(soma_caatinga / total_municipios, 2)

    return {
        "universo_legal": "SUDENE-MG (Lei Complementar nº 185/2021)",
        "total_municipios": total_municipios,
        "media_pct_cerrado": media_cerrado,
        "media_pct_caatinga": media_caatinga,
        "municipios_ecotonais_transicao": ecotonais,
        "pct_municipios_ecotonais": round((ecotonais / total_municipios) * 100, 2),
        "municipios_predominancia_cerrado": pred_cerrado,
        "municipios_predominancia_caatinga": pred_caatinga,
        "observacao_ecologica": (
            "A faixa de transição ecotonal no Norte de Minas abriga alta biodiversidade "
            "adaptativa, com espécies com xilopódios e tolerância ao estresse hídrico e ao fogo."
        )
    }
