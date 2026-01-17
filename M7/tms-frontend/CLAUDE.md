# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TMS Frontend is a Transportation Management System built with React, TypeScript, Vite, and Tailwind CSS. It uses shadcn/ui component library with Radix UI primitives.

## Common Commands

```bash
# Development
npm run dev                    # Start Vite dev server (default port from env)
npm run dev:local              # Start with local backend (port 4002, API at localhost:4001)
npm run build                  # Production build
npm run lint                   # Run ESLint

# Testing
npm run test:e2e               # Run Playwright tests
npm run test:e2e:ui            # Playwright test UI mode
npm run test:e2e:headed        # Run tests with browser visible
npm run test:e2e:chromium      # Run only Chromium tests
npm run test:cucumber          # Run Cucumber BDD tests

# Storybook
npm run storybook              # Start Storybook on port 6006

# Dependency visualization
npm run madge                  # Generate dependency graph image
npm run dependency-cruiser     # Generate dependency report HTML
```

## Architecture

### Directory Structure

- `src/pages/` - Route-level page components, organized by feature (orders, drivers, vehicles, documents, shipments)
- `src/components/ui/` - shadcn/ui primitives (use `cn()` from `@/lib/tailwind/utils` for class merging)
- `src/components/layout/` - App shell (Layout, Header, Sidebar)
- `src/http/` - API layer with pattern: `*.http.ts` (fetch functions), `*.mocks.ts` (mock data), `*.model.ts` (types), `*.queries.ts` (React Query hooks)
- `src/hooks/queries/` - Reusable React Query hooks for entities
- `src/model/` - Domain types organized by entity (shipments, drivers, vehicles, expenses, documents)
- `src/auth/` - Authentication context and hooks
- `src/lib/` - Utilities (broker, date, pdf, tailwind)

### Data Layer Pattern

API calls follow a consistent pattern in `src/http/`:
1. Types defined in `*.model.ts`
2. Fetch functions in `*.http.ts` using `API_BASE_URL` from `http.config.ts`
3. Mock data in `*.mocks.ts` with simulated network delay via `http-utils.ts`
4. React Query hooks in `*.queries.ts` for data fetching

### Routing

Routes defined in `src/AppRoutes.tsx`. Protected routes use `ProtectedRoute` component which checks `AuthContext`. Main layout wraps all protected routes via `ProtectedLayout`.

### State Management

- Server state: TanStack React Query (5-minute stale time, no retry)
- Local state: Jotai atoms
- Auth state: React Context in `src/auth/AuthContext.tsx`

### Path Alias

`@/` maps to `src/` directory (configured in vite.config.ts and tsconfig)

## Testing

- E2E tests in `tests/` using Playwright (chromium, firefox, webkit)
- BDD tests in `features/` using Cucumber with step definitions in `features/step_definitions/`
- Component stories in `src/components/ui/*.stories.tsx`
