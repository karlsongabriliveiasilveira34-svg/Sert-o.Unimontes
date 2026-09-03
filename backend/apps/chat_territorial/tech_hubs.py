"""
Mapeamento dos 6 Polos Tecnológicos Oficiais e Resolução de Proximidade.
Responsável: Karlson (Front-End) & Túlio (Cálculo Geodésico)
"""

from typing import List, Dict, Any
from apps.ambiental.services.spherical_cosine import spherical_law_of_cosines

TECH_HUBS: List[Dict[str, Any]] = [
    {
        "id": "unimontes-mg",
        "state": "MG",
        "city": "Montes Claros (Polo Sertão / Unimontes)",
        "lat": -16.7282,
        "lng": -43.8578,
        "specialties": ["react", "performance", "a11y"],
        "description": "Polo de Inovação e Tecnologia do Norte de Minas - Unimontes. Foco em soluções de impacto regional e alta performance.",
    },
    {
        "id": "bh-mg",
        "state": "MG",
        "city": "Belo Horizonte (San Pedro Valley)",
        "lat": -19.9167,
        "lng": -43.9345,
        "specialties": ["react", "seo", "ts"],
        "description": "San Pedro Valley - Ecossistema maduro de startups e engenharia de software escalável.",
    },
    {
        "id": "sp",
        "state": "SP",
        "city": "São Paulo (Faria Lima / Paulista Tech)",
        "lat": -23.5505,
        "lng": -46.6333,
        "specialties": ["react", "performance", "ts"],
        "description": "Maior hub de tecnologia e fintechs da América Latina. Foco em arquitetura corporativa e Core Web Vitals.",
    },
    {
        "id": "rj",
        "state": "RJ",
        "city": "Rio de Janeiro (Porto Maravalley)",
        "lat": -22.9068,
        "lng": -43.1729,
        "specialties": ["ui-ux", "css", "a11y"],
        "description": "Hub de design, interfaces ricas e economia criativa.",
    },
    {
        "id": "recife-pe",
        "state": "PE",
        "city": "Recife (Porto Digital)",
        "lat": -8.0476,
        "lng": -34.8770,
        "specialties": ["ts", "react", "performance"],
        "description": "Porto Digital - Parque tecnológico de referência em sistemas distribuídos e frontend robusto.",
    },
    {
        "id": "florianopolis-sc",
        "state": "SC",
        "city": "Florianópolis (Ilha do Silício)",
        "lat": -27.5954,
        "lng": -48.5480,
        "specialties": ["ui-ux", "react", "seo"],
        "description": "Capital inovadora com foco em produtos SaaS e usabilidade de ponta.",
    },
]


def get_hub_by_id(hub_id: str) -> Dict[str, Any]:
    """Retorna o polo correspondente ao ID informado ou o Polo Unimontes por padrão."""
    for hub in TECH_HUBS:
        if hub["id"] == hub_id:
            return hub
    return TECH_HUBS[0]


def get_nearest_hub(lat: float, lng: float) -> Dict[str, Any]:
    """
    Localiza o polo tecnológico mais próximo utilizando o cálculo geodésico
    da Lei dos Cossenos Esférica.
    """
    closest_hub = TECH_HUBS[0]
    min_distance = float("inf")

    for hub in TECH_HUBS:
        dist = spherical_law_of_cosines(lat, lng, hub["lat"], hub["lng"])
        if dist < min_distance:
            min_distance = dist
            closest_hub = hub

    return closest_hub
