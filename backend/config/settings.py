"""
Django settings for Sertão.Unimontes backend.
Equipe: Álvaro (Lead Backend), Lucas (Segurança/BD), Túlio (Ambiental/Geo),
        José Vitor (IA/RAG), Karlson (Front-End React).
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Carregar variáveis do arquivo .env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, ".env"))

# Adicionar BASE_DIR ao sys.path para garantir importações relativas e absolutas
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "sertao-unimontes-django-insecure-secret-key-2026-unimontes-norte-de-minas",
)

DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1,0.0.0.0,*").split(",")
    if host.strip()
]

# Definição das Aplicações Modulares
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Bibliotecas de Terceiros
    "corsheaders",
    "rest_framework",
    # Módulos Modulares do Projeto Sertão.Unimontes (Territorial, Ambiental, Clima e IA)
    "apps.core.apps.CoreConfig",
    "apps.ambiental.apps.AmbientalConfig",
    "apps.clima_hidro.apps.ClimaHidroConfig",
    "apps.ia_rag.apps.IaRagConfig",
    "apps.chat_territorial.apps.ChatTerritorialConfig",
]

MIDDLEWARE = [
    # 1. Cibersegurança Lucas: Rejeita antes de qualquer leitura se payload > 8 MB
    "apps.core.middlewares.payload_limit.MaxPayloadSizeMiddleware",
    # 2. CORS Headers
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# ==========================================
# BANCO DE DADOS (PostgreSQL + PostGIS ou SQLite local)
# ==========================================
DATABASE_URL = os.getenv("DATABASE_URL", "")

if DATABASE_URL.startswith("postgres://") or DATABASE_URL.startswith("postgresql://"):
    import urllib.parse
    url = urllib.parse.urlparse(DATABASE_URL)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": url.path[1:],
            "USER": url.username,
            "PASSWORD": url.password,
            "HOST": url.hostname,
            "PORT": url.port or 5432,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# ==========================================
# DJANGO REST FRAMEWORK & THROTTLING
# ==========================================
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "apps.core.throttles.SertaoAnonRateThrottle",
        "apps.core.throttles.SertaoUserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": os.getenv("DEFAULT_THROTTLE_RATE_ANON", "60/min"),
        "user": os.getenv("DEFAULT_THROTTLE_RATE_USER", "300/min"),
        "orchestrator": os.getenv("ORCHESTRATOR_THROTTLE_RATE", "20/min"),
    },
}

# ==========================================
# CORS HEADERS (React/Vite e Next.js)
# ==========================================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Em modo desenvolvimento permite origens locais
CORS_ALLOW_CREDENTIALS = True

# Internacionalização
LANGUAGE_CODE = "pt-br"
TIME_ZONE = "America/Sao_Paulo"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Configuração de upload e payload máximo (8 MB)
DATA_UPLOAD_MAX_MEMORY_SIZE = 8 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 8 * 1024 * 1024

# Permite flexibilidade de barras no final de endpoints
APPEND_SLASH = False
