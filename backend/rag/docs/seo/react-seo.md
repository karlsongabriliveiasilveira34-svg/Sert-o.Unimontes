# SEO Técnico para Aplicações Single Page e React

A indexabilidade por motores de busca requer metadados dinâmicos e dados estruturados schema.org.

## 1. Open Graph e Metadados Sociais
```html
<title>Sertão Unimontes - Inovação & Tecnologia</title>
<meta name="description" content="Plataforma de inteligência e agentes especializados de front-end." />
<meta property="og:title" content="Sertão Unimontes - Inovação & Tecnologia" />
<meta property="og:description" content="Agentes IA Especializados para Front-End com RAG." />
<meta property="og:image" content="https://sertao.unimontes.br/og-cover.png" />
<meta name="twitter:card" content="summary_large_image" />
```

## 2. Dados Estruturados (JSON-LD)
Injete microdados no formato schema.org para que o Google exiba rich snippets:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Frontend AI Agents",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web"
}
</script>
```
