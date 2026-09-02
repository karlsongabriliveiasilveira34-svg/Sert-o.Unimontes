# Acessibilidade Web (WCAG 2.1) e ARIA

Acessibilidade digital não é opcional; é um direito e garante conformidade legal (WCAG 2.1 níveis A e AA).

## 1. Semântica HTML vs ARIA
Primeira regra do ARIA: *Não use ARIA se existir um elemento HTML semântico nativo*.

```jsx
// Incorreto
<div className="btn" onClick={handleClick}>Enviar</div>

// Correto (Semântico e Acessível por teclado)
<button 
  type="button" 
  onClick={handleClick} 
  aria-label="Enviar formulário de cadastro"
  className="btn"
>
  Enviar
</button>
```

## 2. Contraste de Cores e Navegação por Teclado
- Taxa mínima de contraste para texto normal: **4.5:1** (WCAG AA).
- Sempre preserve ou estilize de forma visível o anel de foco:
```css
:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}
```
- Forneça textos alternativos (`alt`) descritivos para imagens não decorativas.
