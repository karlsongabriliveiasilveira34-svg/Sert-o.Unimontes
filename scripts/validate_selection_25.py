"""Validate an external 25-municipality selection and filter prepared biome data."""

import argparse
import csv
import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
UNIVERSE = ROOT / "data/processed/sudene_mg_municipios_2021.csv"
BIOMES = ROOT / "data/processed/biomas_municipios_sudene_mg_2025.csv"
DEFAULT_OUTPUT_ROOT = ROOT / "data/interim/selecoes"
EXPECTED_SIZE = 25


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def read_codes(path):
    with path.open(encoding="utf-8-sig", newline="") as source:
        reader = csv.DictReader(source)
        if reader.fieldnames != ["codigo_ibge"]:
            raise ValueError("O CSV deve conter somente a coluna codigo_ibge.")
        return [row["codigo_ibge"].strip() for row in reader]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True, help="CSV externo com a coluna codigo_ibge.")
    parser.add_argument("--source", default="usuario", help="Origem declarada da seleção.")
    parser.add_argument("--output-root", type=Path, default=DEFAULT_OUTPUT_ROOT)
    parser.add_argument("--force", action="store_true", help="Permite regenerar uma seleção com o mesmo identificador.")
    args = parser.parse_args()
    if not args.input.is_file():
        raise ValueError(f"Arquivo de entrada não encontrado: {args.input}")
    received_codes = read_codes(args.input)
    errors = []
    if len(received_codes) != EXPECTED_SIZE:
        errors.append(f"Esperados {EXPECTED_SIZE} códigos; recebidos {len(received_codes)}.")
    invalid_format = sorted({code for code in received_codes if not re.fullmatch(r"\d{7}", code)})
    if invalid_format:
        errors.append(f"Códigos fora do formato IBGE de sete dígitos: {', '.join(invalid_format)}.")
    duplicates = sorted({code for code in received_codes if received_codes.count(code) > 1})
    if duplicates:
        errors.append(f"Códigos duplicados: {', '.join(duplicates)}.")
    with UNIVERSE.open(encoding="utf-8", newline="") as source:
        universe = {row["codigo_ibge"] for row in csv.DictReader(source)}
    outside = sorted(set(received_codes) - universe)
    if outside:
        errors.append(f"Códigos fora do universo SUDENE-MG: {', '.join(outside)}.")
    if errors:
        raise ValueError(" ".join(errors))
    codes = sorted(received_codes)
    selection_id = hashlib.sha256("\n".join(codes).encode("ascii")).hexdigest()[:16]
    output_dir = args.output_root / selection_id
    if output_dir.exists() and not args.force:
        raise FileExistsError(f"Seleção já existe: {output_dir}. Use --force para regenerá-la.")
    with BIOMES.open(encoding="utf-8", newline="") as source:
        biome_rows = {row["codigo_ibge"]: row for row in csv.DictReader(source)}
        fieldnames = source.seek(0) or csv.DictReader(source).fieldnames
    selected_rows = [biome_rows[code] for code in codes]
    output_dir.mkdir(parents=True, exist_ok=True)
    selection_path = output_dir / "selecao_25_municipios.csv"
    biome_path = output_dir / "biomas_25_municipios.csv"
    selection_path.write_text("codigo_ibge\n" + "\n".join(codes) + "\n", encoding="utf-8")
    with biome_path.open("w", encoding="utf-8", newline="") as destination:
        writer = csv.DictWriter(destination, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(selected_rows)
    manifest = {
        "identificador_selecao": selection_id,
        "fonte_declarada": args.source,
        "arquivo_entrada": str(args.input),
        "arquivo_entrada_sha256": sha256(args.input),
        "versao_territorial": "SUDENE-MG 2021, 249 municípios",
        "quantidade_municipios": len(codes),
        "codigos_ibge_ordenados": codes,
        "indicadores_biomas_fonte": str(BIOMES.relative_to(ROOT)),
        "indicadores_biomas_sha256": sha256(BIOMES),
        "status": "aprovado",
    }
    (output_dir / "manifesto.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
