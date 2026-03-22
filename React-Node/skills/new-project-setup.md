---
name: vite-react-setup-guide
description: >
  Provides guidance when setting up a new Vite + React project or planning its architecture
  and technology stack. Use this skill when the user asks about starting a new project, choosing
  a tech stack, structuring a React app, setting up tooling, or designing component architecture.
  Triggers on: "new project", "scaffold", "init", "setup", "what stack should I use",
  "project structure", "how should I organize", "feature-based architecture", "monorepo",
  "Vite + React", or any new-app bootstrapping discussion.
---

# Vite + React Project Setup Guide

Opinionated guidance for bootstrapping new Vite + React applications. This skill activates
during planning and design phases — when deciding on stack, structure, and conventions
before writing application code.

---

## Technology Stack

### Core (always include)

| Layer     | Choice                   | Why                                              |
| --------- | ------------------------ | ------------------------------------------------ |
| Bundler   | Vite (latest stable)     | Fast HMR, native ESM, minimal config             |
| Framework | React (latest stable)    | Component model, ecosystem, hiring pool          |
| Language  | TypeScript (strict mode) | Catch errors at compile time, better IDE support |
| Routing   | React Router (v7+)       | De facto standard, nested layouts, loaders       |

### State Management (pick one based on complexity)

| Option         | When to use                                         |
| -------------- | --------------------------------------------------- |
| React Context  | Simple shared state (auth, theme, user preferences) |
| TanStack Query | Server state — API caching, refetching, mutations   |
| Zustand        | Medium client-side state, multiple consumers        |
| Redux Toolkit  | Complex client state with many interrelated slices  |

For most apps, **React Context + TanStack Query** covers everything. Only reach for
Zustand or Redux when you have substantial client-only state that Context makes awkward.

### Styling

| Layer             | Choice       | Notes                                         |
| ----------------- | ------------ | --------------------------------------------- |
| Utility CSS       | Tailwind CSS | Use `@theme` block for brand tokens in v4     |
| Component library | shadcn/ui    | Optional — copy-paste components, fully owned |

If using shadcn/ui:

- Never modify the original shadcn/ui source files directly
- Create design-system wrappers that compose shadcn/ui components
- Use theme-based styling — no hardcoded colors or font values
- Define component variants with `cva` (class-variance-authority)

If not using shadcn/ui:

- Build your own `components/ui/` with Tailwind utility classes
- Still centralize theme tokens in Tailwind's `@theme` config

### Code Quality

| Option            | Best for                                             |
| ----------------- | ---------------------------------------------------- |
| ESLint + Prettier | Teams with existing standards, rich plugin ecosystem |
| Biome             | Greenfield projects wanting fast, zero-config setup  |

Both work well. ESLint has more React-specific plugins. Biome is faster and simpler to
configure. Pick one and commit to it.

### Testing

| Tool            | Purpose                   |
| --------------- | ------------------------- |
| Vitest          | Unit + integration tests  |
| Testing Library | Component rendering tests |
| Supertest       | Backend HTTP tests        |
| Playwright      | End-to-end browser tests  |

### Package Management

Use **npm** (ships with Node). If the team prefers alternatives, pnpm is a good choice
for monorepos due to its strict dependency resolution.

Use **fnm** or **nvm** to manage Node versions across projects.

---

## Project Structure

### Feature-based architecture (recommended)

Organize by domain feature, not by file type. Each feature is a self-contained module
with its own components, hooks, API calls, and types.

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root component, providers, router
├── features/                   # Feature modules
│   ├── auth/
│   │   ├── components/         # Feature-specific UI
│   │   ├── hooks/              # Feature-specific hooks
│   │   ├── api/                # Feature-specific API calls
│   │   ├── types/              # Feature-specific types
│   │   └── index.ts            # Public API — only export what others need
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   └── ...
├── shared/                     # Cross-feature resources
│   ├── components/
│   │   ├── ui/                 # Base UI primitives (Button, Input, Modal)
│   │   └── layout/             # App shell, header, footer, sidebar
│   ├── hooks/                  # Shared hooks (useDebounce, useLocalStorage)
│   ├── lib/                    # Third-party wrappers, utilities
│   ├── types/                  # Shared TypeScript types/interfaces
│   ├── styles/                 # Theme config, global styles
│   └── utils/                  # Pure helper functions
├── context/                    # React Context providers
├── api/                        # Shared API client setup (Axios/fetch instance)
└── routes.tsx                  # Route definitions
```

### Structure rules

1. **No direct imports between features.** Feature A cannot import from Feature B's
   internals. If both need something, move it to `shared/`.
2. **Explicit public API.** Each feature's `index.ts` exports only what other code
   should consume. Internal components stay internal.
3. **Shared code goes through `shared/`.** If two features need the same hook or
   component, it belongs in `shared/`, not duplicated.

### Alternative: flat by-concern structure

For smaller apps (under ~20 routes), a flat structure organized by concern works fine:

```
src/
├── api/            # API client + endpoint modules
├── components/     # All components, grouped by area
│   ├── form/
│   ├── layout/
│   ├── table/
│   └── ui/
├── hooks/          # All custom hooks
├── context/        # React Context providers
├── types/          # TypeScript types
├── utils/          # Helper functions
├── styles/         # Theme and global styles
└── routes.tsx
```

This is simpler to navigate when the app is small. Migrate to feature-based when you
start having 5+ distinct domains that each have their own components, hooks, and API calls.

---

## Backend Stack (when building full-stack)

| Layer       | Choice                     | Notes                                       |
| ----------- | -------------------------- | ------------------------------------------- |
| Runtime     | Node.js 20+                | LTS, ESM support                            |
| Framework   | Express 5                  | Mature, minimal, huge middleware ecosystem  |
| Language    | TypeScript (strict)        | ESM — use `.js` extensions in imports       |
| ORM / Query | Knex                       | SQL query builder, migration system         |
| Database    | PostgreSQL                 | Default choice for relational data          |
| Validation  | Zod                        | Shared with frontend, runtime type checking |
| Auth        | express-session            | Session-based with `connect-pg-simple`      |
| Logging     | Pino                       | Structured JSON logging, fast               |
| Security    | Helmet + CORS + rate-limit | Production defaults                         |

### Backend structure

```
backend/
  src/
    config/         # Environment variables, feature flags
    controllers/    # Request handlers (thin — delegate to services)
    db/
      connection.ts # Database client instance
      migrations/   # Schema migrations
      seeds/        # Seed data
    middleware/     # Auth, validation, error handling, guards
    routes/         # Express router definitions
    schemas/        # Zod schemas for request validation
    services/       # Business logic (one per domain)
    types/          # Shared TypeScript types
    utils/          # Helper functions
    index.ts        # App entry point
```

### Backend conventions

- **Thin controllers**: Controllers parse the request and call a service. Business logic
  lives in services, not controllers.
- **Validate at the boundary**: Use Zod schemas with a `validate()` middleware to reject
  bad requests before they reach business logic.
- **UUID public IDs**: Expose UUID `public_id` in API URLs, keep integer `id` for internal
  FK joins. Prevents enumeration attacks.
- **Structured errors**: Return consistent `{ success: false, error: { message, code } }`
  responses. Use an error-handling middleware to catch and format.

---

## Local Development Setup

### Docker Compose (recommended)

For full-stack apps, Docker Compose gives you reproducible environments:

```yaml
# Typical services
services:
  db: # PostgreSQL
  backend: # Node API (volume-mount src for hot reload)
  frontend: # Vite dev server (proxy /api to backend)
```

Volume-mount source directories so code changes reflect immediately without rebuilds.

### Vite Configuration Essentials

```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

Key points:

- **Path alias**: `@` → `src/` so imports read `@/components/...` instead of `../../../`
- **API proxy**: Frontend dev server forwards `/api/*` to the backend — no CORS issues in dev
- **Test config**: Vitest with jsdom for component tests, colocated with source

---

## CLAUDE.md Template

When starting a new project, create a `CLAUDE.md` at the root with these essentials:

```markdown
# Project Development Guide

## Architecture

- [Feature-based | Flat by-concern] structure
- [Key architectural decisions and why]

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm test` — Run tests
- `npm run lint` — Lint check

## Conventions

- TypeScript strict mode
- [Styling approach — e.g., Tailwind with @theme tokens]
- [State management approach]
- [Testing requirements]

## Key Files

- [Entry points, config files, route definitions]
```

---

> **Note:** This skill activates during planning and design phases. Once a project is
> scaffolded and has its own CLAUDE.md, that project-specific file takes precedence over
> these generic recommendations.
