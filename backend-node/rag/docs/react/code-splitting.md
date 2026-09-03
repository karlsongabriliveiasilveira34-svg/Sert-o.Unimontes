# Otimização de Performance e Lazy Loading em React

Em aplicações React modernas, carregar todo o bundle JavaScript de uma vez prejudica diretamente métricas de Core Web Vitals como LCP (Largest Contentful Paint) e INP (Interaction to Next Paint).

## 1. Code Splitting com React.lazy e Suspense
Ao utilizar `React.lazy()`, o componente só é baixado pela rede quando renderizado na tela.

```jsx
import React, { lazy, Suspense } from 'react';

const HeavyAnalyticsChart = lazy(() => import('./HeavyAnalyticsChart'));

export function Dashboard() {
  return (
    <div className="p-6">
      <h1>Painel de Métricas</h1>
      <Suspense fallback={<div className="animate-pulse h-64 bg-slate-800 rounded-xl" />}>
        <HeavyAnalyticsChart />
      </Suspense>
    </div>
  );
}
```

## 2. Boas Práticas:
- Use Suspense boundaries isolados para não bloquear o layout principal.
- Implemente prefetch sob hover usando `onMouseEnter={() => import('./Componente')}` para transições imperceptíveis.
- Evite memorizar prematuramente com `useMemo` e `useCallback` sem antes perfilar a árvore de componentes com React DevTools Profiler.
