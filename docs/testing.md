# Testing

## Web UI
Unit tests live under `apps/web/tests/unit`. The Vitest config is in `apps/web/vitest.config.ts`.

Typical commands:
- Run unit tests: `pnpm --filter @solana-playground/web test`
- Watch mode: `pnpm --filter @solana-playground/web test:watch`
- Playwright E2E: `pnpm --filter @solana-playground/web test:e2e`
