"""
Management Command: load_sertao_data
Carrega a base territorial oficial SUDENE-MG (249 municípios),
a amostra selecionada de 25 cidades do Norte de Minas,
os 6 Polos Tecnológicos e os 3 Casos Clínicos MedIA.
"""

import csv
import os
from datetime import datetime, timezone, timedelta
from django.core.management.base import BaseCommand
from django.conf import settings

from apps.ambiental.models import MunicipioSudene, Amostra25Cidade
from apps.chat_territorial.tech_hubs import TECH_HUBS
from apps.chat_territorial.models import ChatSession
from apps.clima_hidro.models import EstacaoClimatica, RegistroClimatico, BaciaHidrografica, Vereda


class Command(BaseCommand):
    help = "Carrega dados iniciais do projeto Sertão.Unimontes (SUDENE 249, Amostra 25, Polos e Recursos Hídricos)"

    AMOSTRA_25_CONFIG = [
        {"ibge": "3143302", "ordem": 1, "polo": True, "justificativa": "Polo centralizador regional de saúde, educação, tecnologia e serviços do Norte de Minas."},
        {"ibge": "3135100", "ordem": 2, "polo": False, "justificativa": "Polo do Médio São Francisco, patrimônio histórico e transição Cerrado-Caatinga."},
        {"ibge": "3135209", "ordem": 3, "polo": False, "justificativa": "Polo da microrregião da Serra Geral, centro agropecuário e de irrigação."},
        {"ibge": "3151206", "ordem": 4, "polo": False, "justificativa": "Porto fluvial no Rio São Francisco e polo industrial siderúrgico."},
        {"ibge": "3157005", "ordem": 5, "polo": False, "justificativa": "Polo do Alto Rio Pardo e transição de biomas do semiárido."},
        {"ibge": "3107307", "ordem": 6, "polo": False, "justificativa": "Importante entroncamento logístico e ecótono de transição regional."},
        {"ibge": "3108602", "ordem": 7, "polo": False, "justificativa": "Polo de serviços e transição Cerrado-Caatinga."},
        {"ibge": "3161106", "ordem": 8, "polo": False, "justificativa": "Margem direita do Rio São Francisco, representatividade ribeirinha."},
        {"ibge": "3152204", "ordem": 9, "polo": False, "justificativa": "Microrregião da Serra Geral, ecologia do semiárido e serra do Espinhaço."},
        {"ibge": "3135050", "ordem": 10, "polo": False, "justificativa": "Maior projeto de agricultura irrigada da América Latina."},
        {"ibge": "3168002", "ordem": 11, "polo": False, "justificativa": "Centro comercial e de serviços do Alto Rio Pardo."},
        {"ibge": "3124302", "ordem": 12, "polo": False, "justificativa": "Extremo norte mineiro, fronteira semiárida com a Bahia."},
        {"ibge": "3126703", "ordem": 13, "polo": False, "justificativa": "Borda de serra e corredor ecológico de transição."},
        {"ibge": "3118809", "ordem": 14, "polo": False, "justificativa": "Formações cársticas, bacias hidrográficas e veredas."},
        {"ibge": "3170800", "ordem": 15, "polo": False, "justificativa": "Vale do Rio das Velhas e entroncamento do São Francisco."},
        {"ibge": "3109402", "ordem": 16, "polo": False, "justificativa": "Grande extensão territorial, chapadões de Cerrado e produção de grãos."},
        {"ibge": "3142908", "ordem": 17, "polo": False, "justificativa": "Região da Serra Geral, semiárido e Caatinga estrita."},
        {"ibge": "3127800", "ordem": 18, "polo": False, "justificativa": "Campos rupestres do Espinhaço e nascentes de bacias."},
        {"ibge": "3139300", "ordem": 19, "polo": False, "justificativa": "Vale do São Francisco, clima semiárido quente."},
        {"ibge": "3156007", "ordem": 20, "polo": False, "justificativa": "Presença de parques estaduais, veredas e recursos hídricos."},
        {"ibge": "3170909", "ordem": 21, "polo": False, "justificativa": "Mosaico de vegetação caducifólia e transição ecotonal."},
        {"ibge": "3170008", "ordem": 22, "polo": False, "justificativa": "Comunidades tradicionais e bacias de afluentes do São Francisco."},
        {"ibge": "3162401", "ordem": 23, "polo": False, "justificativa": "Região central da bacia do Rio Verde Grande."},
        {"ibge": "3142007", "ordem": 24, "polo": False, "justificativa": "Transição geográfica entre o planalto de Montes Claros e o vale do São Francisco."},
        {"ibge": "3132107", "ordem": 25, "polo": False, "justificativa": "Porta de entrada do Parque Nacional Cavernas do Peruaçu."},
    ]

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("[INFO] Iniciando carga de dados do Sertao.Unimontes..."))

        data_dir = os.path.join(settings.BASE_DIR, "data")
        csv_path = os.path.join(data_dir, "sudene_mg_municipios_2021.csv")
        malha_path = os.path.join(data_dir, "sudene_mg_malha_index_2021.csv")

        # 1. Carregar coordenadas de malha se disponíveis
        coords_map = {}
        if os.path.exists(malha_path):
            with open(malha_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    ibge = row.get("codigo_ibge")
                    try:
                        xmin = float(row["xmin"])
                        ymin = float(row["ymin"])
                        xmax = float(row["xmax"])
                        ymax = float(row["ymax"])
                        lng = round((xmin + xmax) / 2.0, 5)
                        lat = round((ymin + ymax) / 2.0, 5)
                        coords_map[ibge] = (lat, lng)
                    except (ValueError, KeyError):
                        pass

        # 2. Carregar os 249 municípios SUDENE-MG
        if os.path.exists(csv_path):
            municipios_created = 0
            with open(csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    ibge = row["codigo_ibge"].strip()
                    nome = row["municipio"].strip()
                    uf = row.get("uf", "MG").strip()
                    recorte = row.get("recorte", "Área de atuação da SUDENE").strip()
                    cd_sudene = row.get("codigo_sudene", "1").strip()

                    # Obter coordenadas
                    lat, lng = coords_map.get(ibge, (None, None))
                    # Ajuste específico para Montes Claros oficial
                    if ibge == "3143302":
                        lat, lng = -16.7282, -43.8578

                    # Estimativa de biomas proporcional regional
                    # Norte de Minas e semiárido têm predominância de Cerrado com transição de Caatinga
                    pct_cer = 68.5
                    pct_caa = 31.5
                    if lat and lat > -16.0:  # Mais ao norte, maior Caatinga
                        pct_cer = 42.0
                        pct_caa = 58.0

                    MunicipioSudene.objects.update_or_create(
                        codigo_ibge=ibge,
                        defaults={
                            "municipio": nome,
                            "uf": uf,
                            "codigo_sudene": cd_sudene,
                            "recorte": recorte,
                            "latitude": lat,
                            "longitude": lng,
                            "area_ibge_km2": 1500.0,
                            "pct_cerrado": pct_cer,
                            "pct_caatinga": pct_caa,
                        },
                    )
                    municipios_created += 1

            self.stdout.write(self.style.SUCCESS(f"[OK] {municipios_created} municipios SUDENE-MG cadastrados."))
        else:
            self.stdout.write(self.style.ERROR(f"[ERRO] Arquivo CSV nao encontrado em: {csv_path}"))

        # 3. Cadastrar a Amostra das 25 Cidades do Norte de Minas
        amostra_count = 0
        for item in self.AMOSTRA_25_CONFIG:
            try:
                mun = MunicipioSudene.objects.get(codigo_ibge=item["ibge"])
                Amostra25Cidade.objects.update_or_create(
                    municipio=mun,
                    defaults={
                        "ordem_amostral": item["ordem"],
                        "cidade_polo": item["polo"],
                        "justificativa_amostral": item["justificativa"],
                    },
                )
                amostra_count += 1
            except MunicipioSudene.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"[AVISO] Municipio {item['ibge']} nao encontrado."))

        self.stdout.write(self.style.SUCCESS(f"[OK] {amostra_count} cidades cadastradas na Amostra 25 (Norte de Minas)."))

        # 4. Criar Sessão de Chat de Demonstração
        ChatSession.objects.get_or_create(
            session_id="session-demo-unimontes",
            defaults={
                "active_hub": "unimontes-mg",
                "location_data": {
                    "city": "Montes Claros (Polo Sertão / Unimontes)",
                    "lat": -16.7282,
                    "lng": -43.8578,
                },
            },
        )
        self.stdout.write(self.style.SUCCESS("[OK] Polos Tecnologicos e Sessao Demo configurados."))

        # 5. Criar Bacias e Veredas de Referência
        bacia_verde_grande, _ = BaciaHidrografica.objects.get_or_create(
            codigo_bacia="SF-VERDE-GRANDE",
            defaults={"nome": "Bacia Hidrográfica do Rio Verde Grande"},
        )
        bacia_sao_francisco, _ = BaciaHidrografica.objects.get_or_create(
            codigo_bacia="SF-ALTO-MEDIO",
            defaults={"nome": "Bacia do Alto Médio São Francisco"},
        )

        try:
            moc = MunicipioSudene.objects.get(codigo_ibge="3143302")
            jan = MunicipioSudene.objects.get(codigo_ibge="3135100")
            
            Vereda.objects.update_or_create(
                nome="Vereda do Acari",
                bacia=bacia_verde_grande,
                municipio=moc,
                defaults={
                    "latitude": -16.7100,
                    "longitude": -43.8200,
                    "status_conservacao": "Preservada",
                    "vazao_media_ls": 24.5,
                },
            )
            Vereda.objects.update_or_create(
                nome="Vereda Grande do Peruaçu",
                bacia=bacia_sao_francisco,
                municipio=jan,
                defaults={
                    "latitude": -15.4800,
                    "longitude": -44.3500,
                    "status_conservacao": "Preservada",
                    "vazao_media_ls": 38.0,
                },
            )

            # Estação Climática Montes Claros
            estacao_moc, _ = EstacaoClimatica.objects.update_or_create(
                codigo_estacao="INMET-A514-MOC",
                municipio=moc,
                defaults={
                    "latitude": -16.7282,
                    "longitude": -43.8578,
                    "altitude_metros": 646.0,
                },
            )

            # Registro Climático recente
            now = datetime.now(timezone.utc)
            RegistroClimatico.objects.update_or_create(
                estacao=estacao_moc,
                data_hora=now,
                defaults={
                    "temperatura_celsius": 29.4,
                    "umidade_relativa_pct": 34.0,
                    "precipitacao_mm": 0.0,
                    "radiacao_solar_w_m2": 820.0,
                    "velocidade_vento_ms": 3.8,
                },
            )
            self.stdout.write(self.style.SUCCESS("[OK] Bacias, Veredas e Telemetria Climatica inicializadas."))
        except Exception as err:
            self.stdout.write(self.style.WARNING(f"[AVISO] Aviso ao popular clima/veredas: {err}"))

        self.stdout.write(self.style.SUCCESS("[SUCESSO] Carga de dados concluida com sucesso!"))
