# Princípios de UI/UX e Design Systems

Um design system consistente reduz atrito cognitivo e acelera o ciclo de entrega.

## 1. Hierarquia Visual e Espaçamento
- Adote uma escala modular de espaçamento (base 4px ou 8px): `p-2 (8px)`, `p-4 (16px)`, `p-6 (24px)`, `p-8 (32px)`.
- Use peso de fonte e opacidade controlada para criar contraste sem recorrer a múltiplas cores caóticas.

## 2. Micro-Interações e Feedback Tátil
- Cada ação interativa deve ter transições suaves (150ms a 250ms, curva `cubic-bezier(0.4, 0, 0.2, 1)`):
```css
.interactive-card {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.interactive-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px -10px rgba(56, 189, 248, 0.25);
}
```
