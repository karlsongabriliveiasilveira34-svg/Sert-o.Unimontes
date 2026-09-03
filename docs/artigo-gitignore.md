# Artigo Técnico: O que é o `.gitignore`, Como Funciona e Como Está Configurado no Sertão.Unimontes

**Universidade Estadual de Montes Claros (Unimontes)**  
*Autor: Equipe de Engenharia de Software e Geoprocessamento — Sertão.Unimontes*

---

## 1. O que é o `.gitignore`?

O arquivo `.gitignore` é um arquivo de configuração de texto puro localizado na raiz (ou em subdiretórios) de um repositório **Git**. Sua finalidade primária é instruir explicitamente o Git sobre **quais arquivos e pastas devem ser ignorados** e nunca adicionados à árvore de controle de versão (*working directory* -> *staging area*).

Sem o `.gitignore`, qualquer execução de `git add .` colocaria sob controle de versão arquivos compilados, dependências pesadas, credenciais secretas e arquivos temporários do sistema operacional.

---

## 2. Por que ele é crucial em projetos Fullstack modernos?

No ecossistema do **Sertão.Unimontes**, integramos um ecossistema misto:
1. **Frontend (Node.js / React / Vite)**
2. **Backend (Python 3.12 / Django 5.x REST Framework / SQLite / RAG)**

Essa combinação torna o `.gitignore` duplamente importante por 4 motivos vitais:

### A. Segurança Absoluta de Credenciais (Arquivos `.env`)
Arquivos `.env` contêm segredos vitais: `SECRET_KEY` do Django, senhas de banco de dados, chaves de API da OpenAI/Gemini/Anthropic. Se um arquivo `.env` for versionado e enviado ao GitHub (mesmo em repositório privado), as credenciais podem ser indexadas, roubadas ou rastreadas no histórico de commits para sempre.

### B. Evitar Explosão de Tamanho no Repositório (`node_modules/` e `venv/`)
- A pasta `node_modules` de um projeto frontend pode conter facilmente mais de 30.000 arquivos e centenas de megabytes.
- O ambiente virtual Python (`venv/` ou `env/`) contém cópias binárias de bibliotecas C/Python específicas do sistema operacional de quem as instalou.
- **Regra de Ouro:** Dependências nunca são versionadas no Git. O que se versiona são as listas de requisitos: [`package.json`](../package.json) e [`requirements.txt`](../backend/requirements.txt). Qualquer colaborador pode reconstituir tudo com `npm install` ou `pip install -r requirements.txt`.

### C. Bloquear Artefatos de Compilação e Cache (`__pycache__/`, `dist/`)
- O interpretador Python cria arquivos de bytecode compilados (`.pyc`, `.pyo`) na pasta `__pycache__/` para acelerar execuções futuras. Esses arquivos são binários, mudam toda hora e variam de acordo com a versão exata do Python.
- O Vite gera o diretório `dist/` após o build de produção. Esse diretório é efêmero e não deve competir com o código-fonte.

### D. Conflitos de Sistema Operacional e IDEs (`.vscode/`, `.DS_Store`, `Thumbs.db`)
Cada membro da equipe (Álvaro, Karlson, Lucas, Túlio, José Vitor) utiliza um sistema operacional (Windows, Linux, macOS) e configurações de editor próprias. Subir arquivos de miniaturas do Windows (`Thumbs.db`) ou metadados da Apple (`.DS_Store`) gera ruído e conflitos de merge desnecessários.

---

## 3. Anatomia do `.gitignore` do Sertão.Unimontes

Veja como cada seção do nosso arquivo [`.gitignore`](../.gitignore) protege o projeto:

```gitignore
# ==============================================================================
# 1. DEPENDÊNCIAS DO FRONTEND (Node.js / React)
# ==============================================================================
node_modules/       # Bloqueia centenas de MBs de bibliotecas do NPM
.pnp
.pnp.js

# ==============================================================================
# 2. BUILDS DE PRODUÇÃO
# ==============================================================================
dist/               # Saída compilada do 'npm run build' (Vite)
build/              # Saídas genéricas de empacotamento
*.local

# ==============================================================================
# 3. SEGURANÇA E VARIÁVEIS DE AMBIENTE (CRÍTICO)
# ==============================================================================
.env                # Nunca subir! Contém chaves e senhas reais
.env*.local         # Sobrescritas locais de desenvolvimento

# ==============================================================================
# 4. LOGS DE EXECUÇÃO
# ==============================================================================
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# ==============================================================================
# 5. DIRETÓRIOS DE EDITORES E ARQUIVOS DO SISTEMA
# ==============================================================================
.vscode/            # Configurações pessoais do VS Code
.idea/              # Configurações pessoais do PyCharm / WebStorm
.DS_Store           # Arquivos de índice ocultos do macOS
Thumbs.db           # Cache de miniaturas de imagens do Windows

# ==============================================================================
# 6. PYTHON & DJANGO BACKEND
# ==============================================================================
__pycache__/        # Bytecode compilado do Python (*.pyc)
*.py[cod]           # Arquivos compilados individuais
*$py.class
*.so                # Bibliotecas compiladas em C/C++
.Python
env/                # Ambientes virtuais
venv/
ENV/
.pytest_cache/      # Cache do framework de testes Pytest
.coverage           # Relatórios de cobertura de código
htmlcov/
*.sqlite3-journal   # Locks e transações temporárias do SQLite
```

---

## 4. O Padrão `.env` vs `.env.example`

Como garantir que novos desenvolvedores saibam quais variáveis configurar sem expor os segredos no Git?

1. **`.env` (Ignorado pelo Git):**  
   Fica apenas no seu computador local. Guarda credenciais reais e variáveis específicas da sua máquina.
2. **`.env.example` (Versionado no Git):**  
   É um modelo público limpo, sem valores secretos reais. Serve como manual descritivo para que qualquer desenvolvedor clone o repositório, rode:
   ```bash
   cp .env.example .env
   ```
   e preencha suas chaves com segurança.

---

## 5. Como Resolver: "Adicionei ao `.gitignore`, mas o Git continua rastreando o arquivo!"

Se um arquivo já foi comitado no repositório antes de ser adicionado ao `.gitignore`, o Git continuará rastreando alterações nele. Para corrigir isso sem deletar o arquivo do seu disco local:

```bash
# 1. Remove o arquivo apenas do índice de rastreamento do Git
git rm --cached caminho/do/arquivo.env

# 2. Ou para uma pasta inteira (ex: node_modules ou venv):
git rm -r --cached pasta/

# 3. Em seguida, comite a remoção do índice:
git commit -m "chore: remover arquivos rastreados indevidamente respeitando o .gitignore"
```

---

## 6. Conclusão

O `.gitignore` não é apenas um arquivo utilitário: ele é um **pilar de governança de código, conformidade de segurança e boas práticas de engenharia de software**. No Sertão.Unimontes, ele garante que tanto a interface web moderna (Karlson) quanto a espinha dorsal de microsserviços Django e IA (Álvaro, Lucas, Túlio, José Vitor) convivam em perfeita harmonia e segurança.
