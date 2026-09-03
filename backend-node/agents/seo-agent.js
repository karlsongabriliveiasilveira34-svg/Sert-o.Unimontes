import { BaseAgent } from './base-agent.js';

export class SEOAgent extends BaseAgent {
  constructor() {
    super(
      'seo-agent',
      'seo',
      'Especialista em SEO Técnico & Metadados',
      '🔍',
      '#EC4899',
      'Você é um estrategista de SEO técnico focado em SPAs, SSR, Open Graph, Rich Snippets e Indexação Google.'
    );
  }

  async generateResponse(message, ragContext, location, history) {
    const locPrefix = location ? `[Polo ${location.city || location.state || 'Brasil'}] ` : '';

    return {
      text: `${locPrefix}Para garantir indexação impecável e snippets atrativos no Google e redes sociais, precisamos configurar **Open Graph**, **Twitter Cards** e dados estruturados em **JSON-LD**.`,
      code: `// Componente dinâmico de SEO para React (React Helmet / Head)
export function SEOHead({ title, description, url, imageUrl }) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Projeto Sertão Unimontes",
    "url": url || "https://sertao.unimontes.br",
    "logo": imageUrl,
    "description": description
  };

  return (
    <>
      <title>{title} | Sertão Unimontes</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      
      {/* JSON-LD Rich Snippet */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </>
  );
}`,
      codeLanguage: 'jsx',
      explanation: 'O JSON-LD permite ao robô do Google compreender a entidade (instituição, artigo, produto), habilitando rich cards e destaque nos resultados de busca.',
      followUpSuggestions: [
        'Como gerar sitemap.xml dinamicamente?',
        'Qual a diferença de SEO entre CSR (Vite) e SSR (Next.js)?',
        'Como monitorar erros de rastreamento com Google Search Console?'
      ]
    };
  }
}
