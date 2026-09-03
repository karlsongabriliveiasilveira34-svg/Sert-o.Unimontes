"""Calculate pairwise municipal-centroid distances with the spherical law of cosines."""

import argparse
import csv
import hashlib
import json
import math
import zipfile
from itertools import combinations
from pathlib import Path

from select_sample_25 import read_dbf, read_shape_centroids


ROOT = Path(__file__).resolve().parents[1]
MESH_ZIP = ROOT / "data/raw/MG_Municipios_2021.zip"
EARTH_RADIUS_KM = 6371.0088


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def law_of_cosines_distance_km(point_a, point_b):
    longitude_a, latitude_a = map(math.radians, point_a)
    longitude_b, latitude_b = map(math.radians, point_b)
    cosine = math.sin(latitude_a) * math.sin(latitude_b) + math.cos(latitude_a) * math.cos(latitude_b) * math.cos(longitude_b - longitude_a)
    return EARTH_RADIUS_KM * math.acos(max(-1.0, min(1.0, cosine)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--selection-dir", type=Path, required=True, help="Diretório gerado pela Etapa 6.")
    parser.add_argument("--force", action="store_true", help="Permite regenerar resultados existentes.")
    args = parser.parse_args()
    selection_dir = args.selection_dir
    manifest_path = selection_dir / "manifesto.json"
    output_csv = selection_dir / "distancias_lei_cossenos.csv"
    output_report = selection_dir / "resumo_espacial_lei_cossenos.json"
    if not manifest_path.is_file():
        raise FileNotFoundError("manifesto.json da Etapa 6 não encontrado.")
    if (output_csv.exists() or output_report.exists()) and not args.force:
        raise FileExistsError("Resultado espacial já existe; use --force para regenerá-lo.")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    codes = manifest.get("codigos_ibge_ordenados", [])
    if len(codes) != 25 or len(set(codes)) != 25:
        raise ValueError("A seleção deve conter exatamente 25 códigos IBGE únicos.")
    with zipfile.ZipFile(MESH_ZIP) as archive:
        names = archive.namelist()
        attributes = read_dbf(archive.read(next(name for name in names if name.lower().endswith(".dbf"))))
        centroids = read_shape_centroids(archive.read(next(name for name in names if name.lower().endswith(".shp"))))
    municipalities = {
        row["CD_MUN"]: {"municipio": row["NM_MUN"], "centroid": centroid}
        for row, centroid in zip(attributes, centroids)
        if row["CD_MUN"] in codes
    }
    if set(municipalities) != set(codes):
        raise ValueError("A malha não contém todos os códigos da seleção.")
    rows = []
    for code_a, code_b in combinations(sorted(codes), 2):
        municipality_a, municipality_b = municipalities[code_a], municipalities[code_b]
        distance = law_of_cosines_distance_km(municipality_a["centroid"], municipality_b["centroid"])
        if distance <= 0:
            raise ValueError(f"Centroides coincidentes ou distância inválida: {code_a}, {code_b}.")
        rows.append({"codigo_ibge_a": code_a, "municipio_a": municipality_a["municipio"], "longitude_a": f"{municipality_a['centroid'][0]:.6f}", "latitude_a": f"{municipality_a['centroid'][1]:.6f}", "codigo_ibge_b": code_b, "municipio_b": municipality_b["municipio"], "longitude_b": f"{municipality_b['centroid'][0]:.6f}", "latitude_b": f"{municipality_b['centroid'][1]:.6f}", "distancia_lei_cossenos_km": f"{distance:.6f}"})
    with output_csv.open("w", encoding="utf-8", newline="") as destination:
        writer = csv.DictWriter(destination, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)
    distances = [float(row["distancia_lei_cossenos_km"]) for row in rows]
    closest, farthest = min(rows, key=lambda row: float(row["distancia_lei_cossenos_km"])), max(rows, key=lambda row: float(row["distancia_lei_cossenos_km"]))
    report = {"identificador_selecao": manifest["identificador_selecao"], "municipios": 25, "pares_calculados": len(rows), "metodo": "lei dos cossenos esférica entre centroides municipais", "raio_terrestre_km": EARTH_RADIUS_KM, "distancia_minima_km": min(distances), "distancia_maxima_km": max(distances), "distancia_media_km": round(sum(distances) / len(distances), 6), "par_mais_proximo": {"codigo_ibge_a": closest["codigo_ibge_a"], "codigo_ibge_b": closest["codigo_ibge_b"], "distancia_km": float(closest["distancia_lei_cossenos_km"])}, "par_mais_distante": {"codigo_ibge_a": farthest["codigo_ibge_a"], "codigo_ibge_b": farthest["codigo_ibge_b"], "distancia_km": float(farthest["distancia_lei_cossenos_km"])}, "manifesto_sha256": sha256(manifest_path), "malha_fonte_sha256": sha256(MESH_ZIP), "status": "aprovado"}
    output_report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
