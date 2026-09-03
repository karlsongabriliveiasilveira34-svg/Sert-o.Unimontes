"""Build the canonical SUDENE-MG municipality table from the official IBGE WFS export."""

from __future__ import annotations

import csv
import json
from pathlib import Path


RAW_PATH = Path("data/raw/SUDENE_MG_2021_atributos.geojson")
OUTPUT_PATH = Path("data/processed/sudene_mg_municipios_2021.csv")


def main() -> None:
    data = json.loads(RAW_PATH.read_text(encoding="utf-8"))
    rows = []

    for feature in data["features"]:
        props = feature["properties"]
        if props["cd_mun"].startswith("31") and props["cd_sudene"] == "1":
            rows.append(
                {
                    "codigo_ibge": props["cd_mun"],
                    "municipio": props["nm_mun"],
                    "uf": "MG",
                    "codigo_sudene": props["cd_sudene"],
                    "recorte": props["nm_sudene"],
                    "fonte": "IBGE - Área de Atuação da SUDENE",
                    "versao_recorte": "2021 (LC 185/2021)",
                }
            )

    rows.sort(key=lambda row: row["codigo_ibge"])
    if len(rows) != 249 or len({row["codigo_ibge"] for row in rows}) != 249:
        raise ValueError("Expected exactly 249 unique SUDENE municipalities in Minas Gerais.")

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8", newline="") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} municipalities to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
