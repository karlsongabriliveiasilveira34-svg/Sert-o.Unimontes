"""Select a spatially balanced, reproducible 25-municipality SUDENE-MG sample."""

import csv
import hashlib
import json
import math
import struct
import zipfile
from pathlib import Path

MESH_ZIP_PATH = Path("data/raw/MG_Municipios_2021.zip")
UNIVERSE_CSV_PATH = Path("data/processed/sudene_mg_municipios_2021.csv")
OUTPUT_CSV_PATH = Path("data/processed/amostra_25_municipios_sudene_mg_2021.csv")
OUTPUT_REPORT_PATH = Path("data/processed/validacao_amostra_25_municipios_sudene_mg_2021.json")
EXPECTED_UNIVERSE_SIZE = 249
SAMPLE_SIZE = 25
EARTH_RADIUS_KM = 6371.0088


def read_dbf(buffer):
    """Read IBGE DBF attributes without external packages."""
    record_count = struct.unpack_from("<I", buffer, 4)[0]
    header_length = struct.unpack_from("<H", buffer, 8)[0]
    record_length = struct.unpack_from("<H", buffer, 10)[0]
    fields, offset = [], 32
    while buffer[offset] != 0x0D:
        name = buffer[offset : offset + 11].split(b"\0", 1)[0].decode("ascii")
        fields.append((name, buffer[offset + 16]))
        offset += 32
    records = []
    for index in range(record_count):
        offset = header_length + index * record_length
        if buffer[offset] == 0x2A:
            continue
        row, cursor = {}, offset + 1
        for name, length in fields:
            raw_value = buffer[cursor : cursor + length].rstrip(b" \0")
            # The 2021 IBGE DBF stores accented names as UTF-8 despite DBF's
            # legacy encoding conventions; retain a Latin-1 fallback for reuse.
            try:
                row[name] = raw_value.decode("utf-8")
            except UnicodeDecodeError:
                row[name] = raw_value.decode("latin-1")
            cursor += length
        records.append(row)
    return records


def read_shape_centroids(buffer):
    """Return one area-weighted centroid for every Polygon record."""
    if struct.unpack_from(">I", buffer, 0)[0] != 9994:
        raise ValueError("Assinatura do Shapefile inválida.")
    centroids, offset = [], 100
    while offset < len(buffer):
        content_length = struct.unpack_from(">I", buffer, offset + 4)[0] * 2
        content_start = offset + 8
        if struct.unpack_from("<I", buffer, content_start)[0] != 5:
            raise ValueError("A malha deve conter geometrias Polygon (tipo 5).")
        xmin, ymin, xmax, ymax = struct.unpack_from("<4d", buffer, content_start + 4)
        parts_count, points_count = struct.unpack_from("<2I", buffer, content_start + 36)
        parts_start = content_start + 44
        points_start = parts_start + 4 * parts_count
        parts = [struct.unpack_from("<I", buffer, parts_start + 4 * index)[0] for index in range(parts_count)]
        points = [struct.unpack_from("<2d", buffer, points_start + 16 * index) for index in range(points_count)]
        doubled_area = centroid_x = centroid_y = 0.0
        for ring_index, start in enumerate(parts):
            end = parts[ring_index + 1] if ring_index + 1 < parts_count else points_count
            ring = points[start:end]
            for point_index in range(len(ring) - 1):
                x1, y1 = ring[point_index]
                x2, y2 = ring[point_index + 1]
                cross = x1 * y2 - x2 * y1
                doubled_area += cross
                centroid_x += (x1 + x2) * cross
                centroid_y += (y1 + y2) * cross
        if math.isclose(doubled_area, 0.0, abs_tol=1e-12):
            centroids.append(((xmin + xmax) / 2, (ymin + ymax) / 2))
        else:
            centroids.append((centroid_x / (3 * doubled_area), centroid_y / (3 * doubled_area)))
        offset = content_start + content_length
    return centroids


def haversine_km(point_a, point_b):
    longitude_a, latitude_a = map(math.radians, point_a)
    longitude_b, latitude_b = map(math.radians, point_b)
    latitude_term = math.sin((latitude_b - latitude_a) / 2) ** 2
    longitude_term = math.sin((longitude_b - longitude_a) / 2) ** 2
    value = latitude_term + math.cos(latitude_a) * math.cos(latitude_b) * longitude_term
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(value))


def select_sample(candidates):
    """Use a medoid seed then greedy maximin sampling, with IBGE-code tie breaks."""
    first = min(
        candidates,
        key=lambda candidate: (
            sum(haversine_km(candidate["centroid"], other["centroid"]) for other in candidates),
            candidate["codigo_ibge"],
        ),
    )
    first["distancia_minima_amostra_km"] = None
    selected = [first]
    remaining = [candidate for candidate in candidates if candidate != first]
    while len(selected) < SAMPLE_SIZE:
        for candidate in remaining:
            candidate["distancia_minima_amostra_km"] = min(
                haversine_km(candidate["centroid"], chosen["centroid"]) for chosen in selected
            )
        next_candidate = min(
            remaining,
            key=lambda candidate: (-candidate["distancia_minima_amostra_km"], candidate["codigo_ibge"]),
        )
        selected.append(next_candidate)
        remaining.remove(next_candidate)
    return selected


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def main():
    with UNIVERSE_CSV_PATH.open(encoding="utf-8", newline="") as source:
        universe_rows = list(csv.DictReader(source))
    universe_by_code = {row["codigo_ibge"]: row for row in universe_rows}
    if len(universe_rows) != EXPECTED_UNIVERSE_SIZE or len(universe_by_code) != EXPECTED_UNIVERSE_SIZE:
        raise ValueError("O universo canônico deve conter exatamente 249 códigos IBGE únicos.")
    with zipfile.ZipFile(MESH_ZIP_PATH) as archive:
        dbf_name = next(name for name in archive.namelist() if name.lower().endswith(".dbf"))
        shp_name = next(name for name in archive.namelist() if name.lower().endswith(".shp"))
        attributes = read_dbf(archive.read(dbf_name))
        centroids = read_shape_centroids(archive.read(shp_name))
    if len(attributes) != len(centroids):
        raise ValueError("As contagens de registros DBF e SHP divergem.")
    candidates = []
    for attributes_row, centroid in zip(attributes, centroids):
        code = attributes_row["CD_MUN"]
        if code in universe_by_code:
            candidates.append({"codigo_ibge": code, "municipio": attributes_row["NM_MUN"], "uf": "MG", "centroid": centroid})
    candidate_codes = {candidate["codigo_ibge"] for candidate in candidates}
    if len(candidates) != EXPECTED_UNIVERSE_SIZE or candidate_codes != set(universe_by_code):
        raise ValueError("A malha não contém exatamente os 249 municípios do universo canônico.")
    selected = select_sample(candidates)
    selected_codes = [candidate["codigo_ibge"] for candidate in selected]
    if len(selected_codes) != SAMPLE_SIZE or len(set(selected_codes)) != SAMPLE_SIZE:
        raise ValueError("A amostra deve conter exatamente 25 códigos IBGE únicos.")
    with OUTPUT_CSV_PATH.open("w", encoding="utf-8", newline="") as destination:
        writer = csv.DictWriter(destination, fieldnames=("ordem_selecao", "codigo_ibge", "municipio", "uf", "centroide_longitude", "centroide_latitude", "distancia_minima_amostra_km", "metodo_selecao"))
        writer.writeheader()
        for order, candidate in enumerate(selected, start=1):
            writer.writerow({
                "ordem_selecao": order,
                "codigo_ibge": candidate["codigo_ibge"],
                "municipio": candidate["municipio"],
                "uf": candidate["uf"],
                "centroide_longitude": f"{candidate['centroid'][0]:.6f}",
                "centroide_latitude": f"{candidate['centroid'][1]:.6f}",
                "distancia_minima_amostra_km": "" if candidate["distancia_minima_amostra_km"] is None else f"{candidate['distancia_minima_amostra_km']:.3f}",
                "metodo_selecao": "medoide_geodesico_maximin",
            })
    nearest_selected_distances = [min(haversine_km(candidate["centroid"], chosen["centroid"]) for chosen in selected) for candidate in candidates]
    selected_pair_distances = [haversine_km(selected[left]["centroid"], selected[right]["centroid"]) for left in range(SAMPLE_SIZE) for right in range(left + 1, SAMPLE_SIZE)]
    report = {
        "fonte_universo": "IBGE - Area de Atuacao da SUDENE, 2021 (LC 185/2021)",
        "fonte_geometria": "IBGE - Malha Municipal Digital 2021, Minas Gerais",
        "metodo": "medoide geodesico seguido de amostragem espacial maximin",
        "unidade_distancia": "km, distancia de grande circulo entre centroides municipais",
        "universo_esperado": EXPECTED_UNIVERSE_SIZE,
        "municipios_candidatos": len(candidates),
        "municipios_amostra": len(selected),
        "codigos_duplicados_amostra": [],
        "codigos_fora_do_universo": sorted(set(selected_codes) - set(universe_by_code)),
        "municipio_semente": {"codigo_ibge": selected[0]["codigo_ibge"], "municipio": selected[0]["municipio"]},
        "cobertura_maxima_distancia_ao_ponto_amostral_mais_proximo_km": round(max(nearest_selected_distances), 3),
        "distancia_minima_entre_pares_da_amostra_km": round(min(selected_pair_distances), 3),
        "arquivo_amostra_sha256": sha256(OUTPUT_CSV_PATH),
        "status": "aprovado",
    }
    OUTPUT_REPORT_PATH.write_text(f"{json.dumps(report, ensure_ascii=False, indent=2)}\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
