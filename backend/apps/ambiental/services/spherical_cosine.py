"""
Cálculo de Distâncias Geodésicas via Lei dos Cossenos Esférica.
Responsável: Túlio (Geoprocessamento e Dados Ambientais)
"""

import math
from typing import List, Dict, Any, Tuple, Optional

# Raio médio volumétrico da Terra em km conforme padrão IUGG / WGS84
EARTH_RADIUS_KM: float = 6371.0088


def spherical_law_of_cosines(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcula a distância do grande círculo em quilômetros entre dois pontos geográficos
    utilizando rigorosamente a fórmula da Lei dos Cossenos Esférica.

    d = R * arccos(sin(phi1)*sin(phi2) + cos(phi1)*cos(phi2)*cos(delta_lambda))
    """
    if lat1 == lat2 and lon1 == lon2:
        return 0.0

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_lambda = math.radians(lon2 - lon1)

    cos_sigma = (
        math.sin(phi1) * math.sin(phi2)
        + math.cos(phi1) * math.cos(phi2) * math.cos(delta_lambda)
    )
    # Previne imprecisões numéricas de ponto flutuante fora do domínio [-1.0, 1.0]
    cos_sigma = max(-1.0, min(1.0, cos_sigma))

    return EARTH_RADIUS_KM * math.acos(cos_sigma)


def calculate_distance_matrix(
    origin: Tuple[float, float],
    destinations: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Calcula a matriz de distâncias de um ponto de origem (lat, lon)
    para múltiplos pontos de destino.
    """
    lat_orig, lon_orig = origin
    results = []

    for dest in destinations:
        dest_lat = float(dest["latitude"])
        dest_lon = float(dest["longitude"])
        dist_km = spherical_law_of_cosines(lat_orig, lon_orig, dest_lat, dest_lon)
        
        results.append({
            "identificador": dest.get("identificador", dest.get("codigo_ibge", "")),
            "nome": dest.get("nome", dest.get("municipio", "")),
            "latitude": dest_lat,
            "longitude": dest_lon,
            "distancia_km": round(dist_km, 3),
        })

    # Ordena pelo mais próximo
    results.sort(key=lambda item: item["distancia_km"])
    return results
