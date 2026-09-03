"""Calculate IBGE 2025 Cerrado and Caatinga areas for all SUDENE-MG municipalities."""

import csv
import hashlib
import json
import struct
import zipfile
from pathlib import Path

from shapely.geometry import MultiPolygon, Polygon


MESH_ZIP = Path("data/raw/MG_Municipios_2021.zip")
BIOMES_ZIP = Path("data/raw/IBGE_Biomas_SistemaCosteiro_2025.zip")
UNIVERSE = Path("data/processed/sudene_mg_municipios_2021.csv")
OUTPUT = Path("data/processed/biomas_municipios_sudene_mg_2025.csv")
REPORT = Path("data/processed/validacao_biomas_sudene_mg_2025.json")
EARTH_RADIUS_M = 6_371_008.8


def read_dbf(data):
    count, header, length = struct.unpack_from("<IHH", data, 4)
    fields, offset = [], 32
    while data[offset] != 13:
        fields.append((data[offset : offset + 11].split(b"\0", 1)[0].decode("ascii"), data[offset + 16]))
        offset += 32
    rows = []
    for index in range(count):
        offset = header + index * length
        if data[offset] == 42:
            continue
        row, cursor = {}, offset + 1
        for name, size in fields:
            raw = data[cursor : cursor + size].rstrip(b" \0")
            value = raw.decode("utf-8", errors="replace")
            # The municipal DBF contains legacy double-encoded accented names.
            if "Ã" in value or "Â" in value:
                value = value.encode("latin-1").decode("utf-8")
            row[name] = value
            cursor += size
        rows.append(row)
    return rows


def signed_area(ring):
    return sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(ring, ring[1:])) / 2


def contains(point, ring):
    x, y = point
    inside = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            inside = not inside
    return inside


def read_shapes(data):
    shapes, offset = [], 100
    if struct.unpack_from(">I", data, 0)[0] != 9994:
        raise ValueError("Assinatura do Shapefile inválida.")
    while offset < len(data):
        size, start = struct.unpack_from(">I", data, offset + 4)[0] * 2, offset + 8
        if struct.unpack_from("<I", data, start)[0] != 5:
            raise ValueError("A fonte deve conter Polygon (tipo 5).")
        parts, points = struct.unpack_from("<2I", data, start + 36)
        parts_start, points_start = start + 44, start + 44 + 4 * parts
        starts = [struct.unpack_from("<I", data, parts_start + 4 * i)[0] for i in range(parts)]
        coordinates = [struct.unpack_from("<2d", data, points_start + 16 * i) for i in range(points)]
        rings = [coordinates[part : starts[i + 1] if i + 1 < parts else points] for i, part in enumerate(starts)]
        outers, inners = [ring for ring in rings if signed_area(ring) < 0], [ring for ring in rings if signed_area(ring) >= 0]
        polygons = []
        for outer in outers:
            polygons.append(Polygon(outer, [hole for hole in inners if contains(hole[0], outer)]))
        shapes.append(polygons[0] if len(polygons) == 1 else MultiPolygon(polygons))
        offset = start + size
    return shapes


def load_zip_layers(zip_path):
    with zipfile.ZipFile(zip_path) as archive:
        names = archive.namelist()
        dbf, shp = next(name for name in names if name.endswith(".dbf")), next(name for name in names if name.endswith(".shp"))
        attributes, shapes = read_dbf(archive.read(dbf)), read_shapes(archive.read(shp))
    if len(attributes) != len(shapes):
        raise ValueError(f"DBF e SHP divergem em {zip_path}.")
    return attributes, shapes


def geodesic_area_km2(geometry):
    # Shapely intersection is planar; this converts its WGS84 result to spherical area.
    from shapely.ops import transform
    from pyproj import Transformer
    equal_area = Transformer.from_crs("EPSG:4326", "EPSG:6933", always_xy=True).transform
    return transform(equal_area, geometry).area / 1_000_000


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def main():
    with UNIVERSE.open(encoding="utf-8", newline="") as file:
        codes = {row["codigo_ibge"] for row in csv.DictReader(file)}
    if len(codes) != 249:
        raise ValueError("O universo canônico deve conter 249 códigos únicos.")
    mesh_attributes, mesh_shapes = load_zip_layers(MESH_ZIP)
    biome_attributes, biome_shapes = load_zip_layers(BIOMES_ZIP)
    municipalities = [(row, shape) for row, shape in zip(mesh_attributes, mesh_shapes) if row["CD_MUN"] in codes]
    biomes = {row["CD_BIOMA"]: shape for row, shape in zip(biome_attributes, biome_shapes)}
    if len(municipalities) != 249 or not {"2", "3"}.issubset(biomes):
        raise ValueError("Municípios ou biomas obrigatórios ausentes.")
    rows = []
    for attributes, municipality in municipalities:
        if not municipality.is_valid:
            raise ValueError(f"Geometria municipal inválida: {attributes['CD_MUN']}")
        municipal = geodesic_area_km2(municipality)
        cerrado, caatinga = geodesic_area_km2(municipality.intersection(biomes["3"])), geodesic_area_km2(municipality.intersection(biomes["2"]))
        if cerrado + caatinga > municipal + 0.001:
            raise ValueError(f"Sobreposição de biomas: {attributes['CD_MUN']}")
        rows.append({"codigo_ibge": attributes["CD_MUN"], "municipio": attributes["NM_MUN"], "uf": "MG", "area_municipal_equal_area_km2": municipal, "area_cerrado_km2": cerrado, "area_caatinga_km2": caatinga, "area_outros_biomas_km2": max(0, municipal - cerrado - caatinga), "percentual_cerrado": cerrado / municipal * 100, "percentual_caatinga": caatinga / municipal * 100})
    rows.sort(key=lambda row: row["codigo_ibge"])
    columns = list(rows[0])
    with OUTPUT.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=columns)
        writer.writeheader()
        writer.writerows([{key: f"{value:.6f}" if isinstance(value, float) else value for key, value in row.items()} for row in rows])
    report = {"fonte": "IBGE - Biomas e Sistema Costeiro-Marinho do Brasil, escala 1:250.000, versão 2025", "arquivo_fonte": str(BIOMES_ZIP), "arquivo_fonte_sha256": sha256(BIOMES_ZIP), "campos_fonte": {"codigo": "CD_BIOMA", "caatinga": "2", "cerrado": "3"}, "municipios_processados": len(rows), "municipios_com_cerrado": sum(row["area_cerrado_km2"] > 0 for row in rows), "municipios_com_caatinga": sum(row["area_caatinga_km2"] > 0 for row in rows), "municipios_com_ambos": sum(row["area_cerrado_km2"] > 0 and row["area_caatinga_km2"] > 0 for row in rows), "metodo_area": "interseção GEOS em WGS84 e área em projeção global equivalente EPSG:6933, km2", "nota_transicao": "A fonte não possui classe de transição; esta etapa não infere ecótono.", "arquivo_saida_sha256": sha256(OUTPUT), "status": "aprovado"}
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
