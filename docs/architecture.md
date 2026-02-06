# Architecture Overview

This codebase is organized as a polyrepo-style monorepo with clear boundaries:

- `apps/web` is a Next.js UI for the Solana Playground
- `apps/api` is the API layer
- `apps/runner` handles execution or sandboxed operations
- `packages/*` store shared libraries

## UI Architecture (apps/web)
- Route segments live in `apps/web/app`
- Reusable UI components are in `apps/web/components`
- Data fetching is centralized in `apps/web/hooks`
- Global state uses Zustand in `apps/web/stores`
