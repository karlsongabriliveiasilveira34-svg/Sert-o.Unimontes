# Otimização de Performance e Core Web Vitals

Métricas vitais de experiência web (LCP, CLS, INP) impactam conversão e ranking de busca no Google.

## 1. Largest Contentful Paint (LCP < 2.5s)
- Utilize tags de preload para a imagem Hero principal:
```html
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />
```
- Otimize fontes com `font-display: swap` e preconnect para CDNs.

## 2. Cumulative Layout Shift (CLS < 0.1)
- Sempre defina `width` e `height` explícitos ou `aspect-ratio` em imagens e iframes.
```css
img.responsive {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}
```

## 3. Bundle Analysis e Redução de Tamanho
- Substitua bibliotecas pesadas (ex: `moment.js` por `date-fns` ou a API nativa `Intl.DateTimeFormat`).
- Aplique tree-shaking rigoroso e monitore os chunks com `@rollup/plugin-visualizer` ou `webpack-bundle-analyzer`.
