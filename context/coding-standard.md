# 📐 Coding Standards

## 🧠 TypeScript

- Strict mode enabled
- ❌ No `any` types — use proper typing or `unknown`
- Define interfaces for:
  - Props
  - API responses
  - Database models
- Use type inference where obvious, explicit types where helpful

## ⚛️ React

- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused — one responsibility per component
- Extract reusable logic into custom hooks

## ▲ Next.js (Frontend)

- Use **App Router**
- Server Components by default
- Use `'use client'` only when needed:
  - Interactivity
  - Hooks
  - Browser APIs

### Data Handling

- Fetch data directly in Server Components
- Use **Server Actions** for:
  - Forms
  - Mutations

### Use API Routes ONLY when needed:

- Webhooks (Stripe, GitHub, etc.)
- File uploads (progress tracking)
- Long-running operations
- Custom headers / status codes
- External integrations
- Future mobile / CLI APIs

### Routing

- Use dynamic routes:
/projects/[slug]
/pages/[id]

## 🎨 Tailwind CSS v4

**CRITICAL**: We are using Tailwind CSS v4, which uses CSS-based configuration.

⚠️ **IMPORTANT: Tailwind v4 uses CSS-based configuration**

- ❌ DO NOT create:
- `tailwind.config.js`
- `tailwind.config.ts`

- ✅ Configure in:  src/app/globals.css

### Example

```css
@import "tailwindcss";

@theme {
--color-primary: oklch(50% 0.2 250);
}

## File Organization

/frontend
  src/
    app/
      [route]/page.tsx
    components/
      [feature]/ComponentName.tsx
    actions/
      [feature].ts
    types/
      [feature].ts
    lib/
      [utility].ts

/backend
  src/
    controllers/
    services/
    routes/
    middlewares/

## Naming

| Type       | Format                        |
| ---------- | ----------------------------- |
| Components | PascalCase (`PageTree.tsx`)   |
| Files      | kebab-case or match component |
| Functions  | camelCase                     |
| Constants  | SCREAMING_SNAKE_CASE          |
| Types      | PascalCase                    |


## Styling

- Use Tailwind CSS only
- Use shadcn/ui components when possible
- ❌ No inline styles
- 🌙 Dark mode first, light mode optional

## Database

Database: PostgreSQL

## Data Fetching

| Layer             | Method                |
| ----------------- | --------------------- |
| Server Components | Direct Prisma queries |
| Client Components | Server Actions        |
| Validation        | Zod                   |


## Error Handling

- Use try/catch in Server Actions
- Standard Response Format:
{
  success: boolean;
  data?: any;
  error?: string;
}
- Show user-friendly errors (toast / UI message)

## Testing

- Vitest for unit tests (server actions and utilities only, not components)
- Test files live next to source files: `feature.test.ts`
- Run tests: `npm run test` (single run) or `npm run test:watch` (watch mode)
- Use `vi.mock()` for external dependencies (Prisma, Resend, etc.)
- Use `vi.useFakeTimers()` for time-dependent logic

## Code Quality

- ❌ No commented-out code
- ❌ No unused imports or variables
- Keep functions small (≤ 50 lines recommended)
- Write readable and maintainable code

