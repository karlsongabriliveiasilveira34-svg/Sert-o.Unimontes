"""Build a final spatial-environmental report for one validated 25-municipality selection."""

import argparse
import hashlib
import json
from pathlib import Path


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest().upper()


def read_json(path):
    if not path.is_file():
        raise FileNotFoundError(f"Produto obrigatório não encontrado: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--selection-dir", type=Path, required=True, help="Diretório gerado pelas Etapas 6, 8 e 9.")
    parser.add_argument("--force", action="store_true", help="Permite regenerar o relatório existente.")
    args = parser.parse_args()
    selection_dir = args.selection_dir
    manifest_path = selection_dir / "manifesto.json"
    environment_path = selection_dir / "resumo_ambiental.json"
    spatial_path = selection_dir / "resumo_espacial_lei_cossenos.json"
    json_path = selection_dir / "relatorio_final_selecao.json"
    markdown_path = selection_dir / "relatorio_final_selecao.md"
    if (json_path.exists() or markdown_path.exists()) and not args.force:
        raise FileExistsError("Relatório final já existe; use --force para regenerá-lo.")
    manifest, environment, spatial = map(read_json, (manifest_path, environment_path, spatial_path))
    selection_id = manifest.get("identificador_selecao")
    if not selection_id or environment.get("identificador_selecao") != selection_id or spatial.get("identificador_selecao") != selection_id:
        raise ValueError("Os produtos de entrada não pertencem à mesma seleção.")
    if manifest.get("quantidade_municipios") != 25 or spatial.get("pares_calculados") != 300:
        raise ValueError("O relatório final exige 25 municípios e 300 pares espaciais.")
    report = {
        "identificador_selecao": selection_id,
        "municipios": manifest["quantidade_municipios"],
        "codigos_ibge_ordenados": manifest["codigos_ibge_ordenados"],
        "fonte_declarada": manifest["fonte_declarada"],
        "indicadores_ambientais": {
            "percentual_cerrado": environment["percentual_cerrado"],
            "percentual_caatinga": environment["percentual_caatinga"],
            "percentual_ecotono_cerrado_caatinga": environment["percentual_ecotono_cerrado_caatinga"],
        },
        "indicadores_espaciais": {
            "pares_calculados": spatial["pares_calculados"],
            "distancia_minima_km": spatial["distancia_minima_km"],
            "distancia_maxima_km": spatial["distancia_maxima_km"],
            "distancia_media_km": spatial["distancia_media_km"],
            "par_mais_proximo": spatial["par_mais_proximo"],
            "par_mais_distante": spatial["par_mais_distante"],
        },
        "limites": [
            "Ecótono é métrica independente de Cerrado e Caatinga; os percentuais não devem ser somados.",
            "Distâncias são de grande círculo entre centroides municipais, não rotas ou tempos de deslocamento.",
            "Fauna e flora são dados externos da equipe responsável por banco de dados e não integram este relatório.",
        ],
        "insumos": {"manifesto_sha256": sha256(manifest_path), "resumo_ambiental_sha256": sha256(environment_path), "resumo_espacial_sha256": sha256(spatial_path)},
        "status": "aprovado",
    }
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    markdown = f"""# Relatório final — Seleção {selection_id}

## Escopo

Seleção validada de **25 municípios**. Origem declarada: `{manifest['fonte_declarada']}`.

## Indicadores ambientais

| Indicador | Percentual |
|---|---:|
| Cerrado | {environment['percentual_cerrado']:.6f}% |
| Caatinga | {environment['percentual_caatinga']:.6f}% |
| Ecótono Cerrado-Caatinga | {environment['percentual_ecotono_cerrado_caatinga']:.6f}% |

## Indicadores espaciais

| Indicador | Resultado |
|---|---:|
| Pares calculados | {spatial['pares_calculados']} |
| Distância mínima | {spatial['distancia_minima_km']:.6f} km |
| Distância máxima | {spatial['distancia_maxima_km']:.6f} km |
| Distância média | {spatial['distancia_media_km']:.6f} km |
| Par mais próximo | {spatial['par_mais_proximo']['codigo_ibge_a']} / {spatial['par_mais_proximo']['codigo_ibge_b']} |
| Par mais distante | {spatial['par_mais_distante']['codigo_ibge_a']} / {spatial['par_mais_distante']['codigo_ibge_b']} |

## Limites

- Ecótono é métrica independente de Cerrado e Caatinga; os percentuais não devem ser somados.
- Distâncias representam grande círculo entre centroides municipais, não rotas ou tempo de deslocamento.
- Fauna e flora pertencem à integração de banco de dados da equipe responsável e não estão incluídas.
"""
    markdown_path.write_text(markdown, encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
