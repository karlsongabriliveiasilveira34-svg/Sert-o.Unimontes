# TypeScript Avançado em Componentes React

Tipagem estrita previne erros em tempo de execução e melhora a experiência com intellisense.

## 1. Tipagem de Props com Generics
Componentes reutilizáveis como Listas ou Tabelas devem aceitar tipos genéricos:

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

export function GenericList<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}
```

## 2. Utility Types Essenciais:
- `Partial<T>`: torna todas as propriedades opcionais.
- `Pick<T, K>` / `Omit<T, K>`: extrai ou remove propriedades específicas.
- `ComponentPropsWithoutRef<'button'>`: herda todas as props nativas de um botão HTML.
