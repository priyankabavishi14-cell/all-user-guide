# App Feature

User Guide Management System — a platform for creating, managing, and displaying structured user guides with separate admin (backend) and public (frontend) experiences.

## Status

In Progress

## Goals

### Admin Dashboard (Project Control Panel)
- Project-scoped dashboard with top header (logo, project breadcrumb, view live site, user profile)
- Left sidebar: project switcher, management links (Dashboard, Manage Pages), Create New Page CTA
- Stats cards: Total Pages count, Guide Setup toggle (welcome screen ON/OFF), Create Page CTA
- Recently Updated Pages table: Title, Parent, Last Updated, Edit action
- Responsive: fixed sidebar on desktop, collapsible on mobile

### Frontend Homepage (End-User Guide View)
- Welcome screen as default landing; togglable from admin dashboard
- Left sidebar as table of contents showing hierarchical page structure (root + nested sub-pages)
- Main content area: welcome icon, title, subtitle, Getting Started card with navigation instructions
- Content fetched dynamically from backend; project-isolated
- Responsive: fixed sidebar on desktop, collapsible hamburger on mobile

### Database — Prisma ORM + Neon PostgreSQL
- Prisma 7 with Neon serverless PostgreSQL
- Schema models: `User`, `Project`, `Page` (self-referencing hierarchy)
- All tables use snake_case column names mapped to camelCase in Prisma
- Unique constraint on `(project_id, slug)` per page; cascade delete on project removal
- Always use migrations (`prisma migrate dev`) — never direct schema push
- Development branch for `DATABASE_URL`; separate production branch
- Prisma client singleton via Neon adapter at `src/lib/prisma.ts`
- Generated client output at `generated/prisma/` (gitignored)

## Notes

- All three screens share the same design system: primary `#5b5ce2`, gradient to `#7c3aed`, background `#f9fafb`, text `#111827`
- Micro-interactions required: button hover, card elevation, smooth scroll, loading skeletons
- Switching projects in admin requires re-authentication
- Only active projects shown on the main dashboard
- Welcome screen visibility controlled via admin toggle

## History

### 2026-04-29 — Completed Admin Dashboard & Frontend Homepage
- Scaffolded project with `create-next-app` and configured Tailwind CSS
- Built Admin Dashboard (`/admin/[slug]`): header with logo/breadcrumb/user profile, left sidebar with project switcher and navigation, stats cards (total pages, welcome screen toggle, create page CTA), recently updated pages table
- Built Frontend Homepage (`/[slug]`): welcome screen, hierarchical sidebar TOC, main content area with getting started card
- Root `/` redirects to Admin Dashboard for active project
- All screens share design system: primary `#5b5ce2`, gradient to `#7c3aed`, background `#f9fafb`, text `#111827`
