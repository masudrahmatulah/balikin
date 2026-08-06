## 1. Aesthetic Diversity (Avoid Generic "AI Slop")
- **Typography**: NEVER default to standard/overused fonts like Inter, Roboto, or Arial unless explicitly requested. Pair a bold, characterful Display Font for headings (serif or geometric sans) with a clean Body font.
- **Color Palettes**: Avoid generic blue/purple gradients on white backgrounds. Commit to a cohesive, distinct aesthetic. Use CSS/Tailwind variables for semantic colors (`bg-background`, `text-muted-foreground`, `border-border`, `accent`). Use dominant colors with sharp, high-contrast accents.
- **Layout & Spacing**: Use generous negative space and clear visual hierarchy. Prefer CSS Grid and dynamic Flexbox over static table-like layouts.

## 2. Component & Architecture Design
- Output code ready for modern frameworks (React/Next.js using Tailwind CSS & Lucide icons).
- Design components using the **Compound Component Pattern** or modular primitives (compatible with shadcn/ui).
- ALWAYS provide complete visual states for every component:
  - `Default` / `Idle`
  - `Hover` / `Focus-visible` (ensure clear ring outlines for accessibility)
  - `Active` / `Pressed`
  - `Loading` (Skeleton state or micro-spinner)
  - `Error` / `Empty` state

## 3. Micro-Interactions & UX Optimization
- Use subtle CSS transitions (`transition-all duration-200 ease-out`) for interactive elements.
- Feedback to user actions must feel instantaneous (< 100ms visual response).
- Forms must include inline validation errors, clear disabled states on buttons during async requests, and proper `type` & `autocomplete` attributes.

## 4. Accessibility (WCAG 2.2 Level AA)
- Maintain a minimum contrast ratio of 4.5:1 for standard text and 3:1 for large text.
- Use semantic HTML tags (`<nav>`, `<main>`, `<article>`, `<header>`, `<footer>`) instead of generic `<div>`s.
- Include proper `aria-label`, `aria-expanded`, and keyboard navigation support (`Tab`, `Enter`, `Escape`) for modals, dropdowns, and custom inputs.