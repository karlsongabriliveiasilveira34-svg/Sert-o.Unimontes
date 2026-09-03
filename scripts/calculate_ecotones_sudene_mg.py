"""Calculate IBGE-mapped Cerrado-Caatinga contact areas for SUDENE-MG."""

import csv
import hashlib
import json
import struct
from pathlib import Path

from shapely.geometry import MultiPolygon, Polygon, box
from shapely.ops import unary_union

from calculate_biomes_sudene_mg import MESH_ZIP, UNIVERSE, geodesic_area_km2, load_zip_layers, read_dbf


ROOT = Path(__file__).resolve().parents[1]
VEGETATION_DBF = ROOT / "data/interim/vegetacao_ibge_2025/vege_area.dbf"
VEGETATION_SHP = ROOT / "data/interim/vegetacao_ibge_2025/vege_area.shp"
VEGETATION_ZIP = ROOT / "data/raw/IBGE_Vegetacao_250mil_2025.zip"
OUTPUT = ROOT / "data/processed/ecotonos_cerrado_caatinga_municipios_sudene_mg_2025.csv"
REPORT = ROOT / "data/processed/validacao_ecotonos_cerrado_caatinga_sudene_mg_2025.json"
CONTACT_CODES = {"ST": "Savana/Savana-Estépica", "STN": "Savana/Savana-Estépica/Floresta Estacional"}


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def signed_area(ring):
    return sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(ring, ring[1:])) / 2


def contains(point, ring):
    x, y = point
    inside = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            inside = not inside
    return inside


def geometry_from_record(data, offset):
    size, start = struct.unpack_from(">I", data, offset + 4)[0] * 2, offset + 8
    if struct.unpack_from("<I", data, start)[0] != 5:
        raise ValueError("A camada de vegetação deve conter Polygon (tipo 5).")
    parts, points = struct.unpack_from("<2I", data, start + 36)
    parts_start, points_start = start + 44, start + 44 + 4 * parts
    starts = [struct.unpack_from("<I", data, parts_start + 4 * index)[0] for index in range(parts)]
    coordinates = [struct.unpack_from("<2d", data, points_start + 16 * index) for index in range(points)]
    rings = [coordinates[start : starts[index + 1] if index + 1 < parts else points] for index, start in enumerate(starts)]
    outer, inner = [ring for ring in rings if signed_area(ring) < 0], [ring for ring in rings if signed_area(ring) >= 0]
    polygons = [Polygon(ring, [hole for hole in inner if contains(hole[0], ring)]) for ring in outer]
    return (polygons[0] if len(polygons) == 1 else MultiPolygon(polygons)), offset + 8 + size


def main():
    if not VEGETATION_DBF.is_file() or not VEGETATION_SHP.is_file():
        raise FileNotFoundError("Extraia IBGE_Vegetacao_250mil_2025.zip em data/interim/vegetacao_ibge_2025.")
    with UNIVERSE.open(encoding="utf-8", newline="") as source:
        codes = {row["codigo_ibge"] for row in csv.DictReader(source)}
    mesh_rows, mesh_shapes = load_zip_layers(MESH_ZIP)
    municipalities = [(row, shape) for row, shape in zip(mesh_rows, mesh_shapes) if row["CD_MUN"] in codes]
    if len(codes) != 249 or len(municipalities) != 249:
        raise ValueError("O universo municipal SUDENE-MG deve conter 249 municípios.")
    bounds = [shape.bounds for _, shape in municipalities]
    extent = box(
        min(bound[0] for bound in bounds), min(bound[1] for bound in bounds),
        max(bound[2] for bound in bounds), max(bound[3] for bound in bounds),
    )
    attributes = read_dbf(VEGETATION_DBF.read_bytes())
    contact_geometries = {code: [] for code in CONTACT_CODES}
    data, offset = VEGETATION_SHP.read_bytes(), 100
    for attributes_row in attributes:
        if attributes_row["leg_contat"] in CONTACT_CODES:
            geometry, offset = geometry_from_record(data, offset)
            if geometry.intersects(extent):
                contact_geometries[attributes_row["leg_contat"]].append(geometry)
        else:
            size = struct.unpack_from(">I", data, offset + 4)[0] * 2
            offset += 8 + size
    contacts = {code: unary_union(geometries) if geometries else None for code, geometries in contact_geometries.items()}
    if not all(contacts.values()) or not all(geometry.is_valid for geometry in contacts.values()):
        raise ValueError("Contatos ST/STN ausentes ou inválidos no recorte de estudo.")
    rows = []
    for attributes_row, municipality in municipalities:
        municipal_area = geodesic_area_km2(municipality)
        direct = geodesic_area_km2(municipality.intersection(contacts["ST"]))
        composite = geodesic_area_km2(municipality.intersection(contacts["STN"]))
        total = direct + composite
        if total > municipal_area + 0.001:
            raise ValueError(f"Área de contato excede o município: {attributes_row['CD_MUN']}")
        rows.append({"codigo_ibge": attributes_row["CD_MUN"], "municipio": attributes_row["NM_MUN"], "uf": "MG", "area_municipal_equal_area_km2": municipal_area, "area_contato_direto_st_km2": direct, "area_contato_composto_stn_km2": composite, "area_contato_total_cerrado_caatinga_km2": total, "percentual_contato_total_cerrado_caatinga": total / municipal_area * 100})
    rows.sort(key=lambda row: row["codigo_ibge"])
    columns = list(rows[0])
    with OUTPUT.open("w", encoding="utf-8", newline="") as destination:
        writer = csv.DictWriter(destination, fieldnames=columns)
        writer.writeheader()
        writer.writerows([{key: f"{value:.6f}" if isinstance(value, float) else value for key, value in row.items()} for row in rows])
    report = {"fonte": "IBGE - Vegetação 1:250.000, versão 2025", "arquivo_fonte": str(VEGETATION_ZIP.relative_to(ROOT)), "arquivo_fonte_sha256": sha256(VEGETATION_ZIP), "campo_contato": "leg_contat", "classes_incluidas": CONTACT_CODES, "municipios_processados": len(rows), "municipios_com_contato": sum(row["area_contato_total_cerrado_caatinga_km2"] > 0 for row in rows), "metodo_area": "interseção GEOS e área em projeção equivalente EPSG:6933, km2", "arquivo_saida_sha256": sha256(OUTPUT), "status": "aprovado"}
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
