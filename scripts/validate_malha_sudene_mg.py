"""Validate IBGE's 2021 MG municipal mesh against the canonical SUDENE-MG table."""

from __future__ import annotations

import csv
import json
import math
import struct
from pathlib import Path
from typing import TypedDict


MESH_DIR = Path("data/interim/malha_mg_2021")
CSV_PATH = Path("data/processed/sudene_mg_municipios_2021.csv")
INDEX_PATH = Path("data/processed/sudene_mg_malha_index_2021.csv")
REPORT_PATH = Path("data/processed/validacao_malha_sudene_mg_2021.json")


class ShapeMetadata(TypedDict):
    """Validated metadata extracted from one Polygon record in the SHP file."""

    record_number: int
    shape_type: int
    valid: bool
    parts_count: int
    points_count: int
    bbox: tuple[float, float, float, float]


def read_dbf(path: Path) -> list[dict[str, str]]:
    with path.open("rb") as file:
        header = file.read(32)
        record_count = struct.unpack("<I", header[4:8])[0]
        header_length = struct.unpack("<H", header[8:10])[0]
        record_length = struct.unpack("<H", header[10:12])[0]

        fields: list[tuple[str, int]] = []
        while file.tell() < header_length:
            descriptor = file.read(32)
            if descriptor[0] == 0x0D:
                break
            name = descriptor[:11].split(b"\x00", 1)[0].decode("ascii")
            fields.append((name, descriptor[16]))

        file.seek(header_length)
        records = []
        for _ in range(record_count):
            row = file.read(record_length)
            if not row or row[0:1] == b"*":
                continue
            cursor = 1
            values: dict[str, str] = {}
            for name, length in fields:
                values[name] = row[cursor : cursor + length].decode("latin-1").strip()
                cursor += length
            records.append(values)
    return records


def read_shape_metadata(path: Path) -> list[ShapeMetadata]:
    records = []
    with path.open("rb") as file:
        header = file.read(100)
        if struct.unpack(">I", header[:4])[0] != 9994:
            raise ValueError("Invalid shapefile signature")

        while True:
            record_header = file.read(8)
            if not record_header:
                break
            record_number, content_words = struct.unpack(">2I", record_header)
            content = file.read(content_words * 2)
            shape_type = struct.unpack("<I", content[:4])[0]
            if shape_type == 0:
                raise ValueError(f"Null geometry in record {record_number}")
            if shape_type != 5:
                raise ValueError(f"Unexpected shape type {shape_type} in record {record_number}")

            xmin, ymin, xmax, ymax = struct.unpack("<4d", content[4:36])
            parts_count, points_count = struct.unpack("<2I", content[36:44])
            parts = list(struct.unpack(f"<{parts_count}I", content[44 : 44 + 4 * parts_count]))
            point_offset = 44 + 4 * parts_count
            points = [
                struct.unpack("<2d", content[point_offset + i * 16 : point_offset + (i + 1) * 16])
                for i in range(points_count)
            ]

            if not (parts_count > 0 and points_count > 3 and parts[0] == 0):
                valid = False
            else:
                limits = parts[1:] + [points_count]
                valid = all(
                    end - start >= 4 and points[start] == points[end - 1]
                    for start, end in zip(parts, limits)
                )
                valid = valid and all(math.isfinite(value) for point in points for value in point)
                valid = valid and xmin <= xmax and ymin <= ymax

            records.append(
                {
                    "record_number": record_number,
                    "shape_type": shape_type,
                    "valid": valid,
                    "parts_count": parts_count,
                    "points_count": points_count,
                    "bbox": [xmin, ymin, xmax, ymax],
                }
            )
    return records


def main() -> None:
    attributes = read_dbf(MESH_DIR / "MG_Municipios_2021.dbf")
    geometries = read_shape_metadata(MESH_DIR / "MG_Municipios_2021.shp")
    if len(attributes) != len(geometries):
        raise ValueError("DBF and SHP record counts differ")

    with CSV_PATH.open(encoding="utf-8", newline="") as file:
        sudene_rows = list(csv.DictReader(file))
    sudene_codes = {row["codigo_ibge"] for row in sudene_rows}

    mesh_by_code = {row["CD_MUN"]: (row, geometry) for row, geometry in zip(attributes, geometries)}
    matched_codes = sudene_codes.intersection(mesh_by_code)
    missing_codes = sorted(sudene_codes.difference(mesh_by_code))
    unexpected_codes = sorted(set(mesh_by_code).difference(sudene_codes))
    selected = [(mesh_by_code[code][0], mesh_by_code[code][1]) for code in sorted(matched_codes)]

    invalid_geometries = [row["CD_MUN"] for row, geometry in selected if not geometry["valid"]]
    if missing_codes or len(selected) != 249 or invalid_geometries:
        raise ValueError(
            "Mesh validation failed: "
            f"matched={len(selected)}, missing={missing_codes}, invalid={invalid_geometries}"
        )

    INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    with INDEX_PATH.open("w", encoding="utf-8", newline="") as file:
        columns = [
            "codigo_ibge",
            "municipio_malha",
            "uf",
            "registro_shp",
            "tipo_geometria",
            "partes",
            "pontos",
            "xmin",
            "ymin",
            "xmax",
            "ymax",
            "anel_fechado_e_coordenadas_validas",
        ]
        writer = csv.DictWriter(file, fieldnames=columns)
        writer.writeheader()
        for row, geometry in selected:
            xmin, ymin, xmax, ymax = geometry["bbox"]
            writer.writerow(
                {
                    "codigo_ibge": row["CD_MUN"],
                    "municipio_malha": row["NM_MUN"],
                    "uf": row["SIGLA"],
                    "registro_shp": geometry["record_number"],
                    "tipo_geometria": geometry["shape_type"],
                    "partes": geometry["parts_count"],
                    "pontos": geometry["points_count"],
                    "xmin": xmin,
                    "ymin": ymin,
                    "xmax": xmax,
                    "ymax": ymax,
                    "anel_fechado_e_coordenadas_validas": geometry["valid"],
                }
            )

    report = {
        "fonte": "IBGE - Malha Municipal Digital 2021, Minas Gerais",
        "crs_wkt": (MESH_DIR / "MG_Municipios_2021.prj").read_text(encoding="ascii").strip(),
        "municipios_na_malha_mg": len(attributes),
        "municipios_sudene_mg": len(sudene_codes),
        "municipios_correspondentes": len(selected),
        "codigos_sudene_sem_malha": missing_codes,
        "codigos_malha_fora_do_recorte_sudene": len(unexpected_codes),
        "geometrias_invalidas_no_recorte": invalid_geometries,
        "status": "aprovado",
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
