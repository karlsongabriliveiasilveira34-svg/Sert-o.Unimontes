"""Aggregate Cerrado, Caatinga and mapped ecotone percentages for one selection."""

import argparse
import csv
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ECOTONES = ROOT / "data/processed/ecotonos_cerrado_caatinga_municipios_sudene_mg_2025.csv"


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def read_csv(path):
    with path.open(encoding="utf-8", newline="") as source:
        return list(csv.DictReader(source))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--selection-dir", type=Path, required=True, help="Diretório gerado pela Etapa 6.")
    parser.add_argument("--force", action="store_true", help="Permite regenerar o resumo existente.")
    args = parser.parse_args()
    selection_dir = args.selection_dir
    manifest_path = selection_dir / "manifesto.json"
    biomes_path = selection_dir / "biomas_25_municipios.csv"
    output_path = selection_dir / "resumo_ambiental.json"
    if not manifest_path.is_file() or not biomes_path.is_file():
        raise FileNotFoundError("O diretório deve conter manifesto.json e biomas_25_municipios.csv da Etapa 6.")
    if output_path.exists() and not args.force:
        raise FileExistsError(f"Resumo já existe: {output_path}. Use --force para regenerá-lo.")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    codes = manifest.get("codigos_ibge_ordenados", [])
    if manifest.get("quantidade_municipios") != 25 or len(codes) != 25 or len(set(codes)) != 25:
        raise ValueError("O manifesto deve representar exatamente 25 códigos IBGE únicos.")
    biomes = read_csv(biomes_path)
    if {row["codigo_ibge"] for row in biomes} != set(codes) or len(biomes) != 25:
        raise ValueError("A tabela de biomas não corresponde aos 25 códigos do manifesto.")
    ecotones = {row["codigo_ibge"]: row for row in read_csv(ECOTONES)}
    if not set(codes).issubset(ecotones):
        raise ValueError("A tabela de ecótonos não contém todos os códigos da seleção.")
    totals = {"municipal": 0.0, "cerrado": 0.0, "caatinga": 0.0, "ecotono": 0.0}
    for row in biomes:
        code = row["codigo_ibge"]
        municipal = float(row["area_municipal_equal_area_km2"])
        ecotone_municipal = float(ecotones[code]["area_municipal_equal_area_km2"])
        if abs(municipal - ecotone_municipal) > 0.001:
            raise ValueError(f"Áreas municipais divergentes entre etapas para {code}.")
        totals["municipal"] += municipal
        totals["cerrado"] += float(row["area_cerrado_km2"])
        totals["caatinga"] += float(row["area_caatinga_km2"])
        totals["ecotono"] += float(ecotones[code]["area_contato_total_cerrado_caatinga_km2"])
    percentages = {key: totals[key] / totals["municipal"] * 100 for key in ("cerrado", "caatinga", "ecotono")}
    report = {
        "identificador_selecao": manifest["identificador_selecao"],
        "municipios": 25,
        "area_total_selecao_km2": round(totals["municipal"], 6),
        "area_cerrado_km2": round(totals["cerrado"], 6),
        "percentual_cerrado": round(percentages["cerrado"], 6),
        "area_caatinga_km2": round(totals["caatinga"], 6),
        "percentual_caatinga": round(percentages["caatinga"], 6),
        "area_ecotono_cerrado_caatinga_km2": round(totals["ecotono"], 6),
        "percentual_ecotono_cerrado_caatinga": round(percentages["ecotono"], 6),
        "metodo": "soma de áreas equivalentes municipais; percentual = área temática / área total da seleção * 100",
        "nota": "Ecótono é métrica independente dos biomas e os três percentuais não devem ser somados.",
        "manifesto_sha256": sha256(manifest_path),
        "biomas_selecao_sha256": sha256(biomes_path),
        "ecotonos_fonte_sha256": sha256(ECOTONES),
        "status": "aprovado",
    }
    output_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
