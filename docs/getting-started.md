# Getting Started

This repo is a multi-app workspace driven by `pnpm`. The primary UI is in `apps/web`.

## Quick Start
1. Install dependencies: `pnpm install`
2. Run the web app: `pnpm --filter @solana-playground/web dev`
3. Open the app at `http://localhost:3000`

## Other Apps
- API server: `apps/api`
- Runner service: `apps/runner`

## Workspace Structure
- `apps/` contains runnable applications
- `packages/` contains shared libraries and templates
- `docs/` contains architectural and onboarding documentation
