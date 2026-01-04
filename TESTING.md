# Testing Guide

## Setup

### Unit Tests (Vitest)

```bash
# Install dependencies
pnpm add -D vitest @vitest/ui

# Run tests
pnpm test

# Run with UI
pnpm test:ui
```

### E2E Tests (Playwright)

```bash
# Install dependencies
pnpm add -D @playwright/test

# Run tests
pnpm exec playwright test

# Run with UI
pnpm exec playwright test --ui
```

## Test Structure

- `apps/api/tests/` - API unit and integration tests
- `apps/web/tests/` - Frontend component tests
- `e2e/` - End-to-end tests

## Coverage Goals

- Unit tests: >80% coverage
- Integration tests: Critical paths
- E2E tests: User journeys

## Running Tests

```bash
# All tests
pnpm test

# Specific app
pnpm --filter @solana-playground/api test

# Watch mode
pnpm test --watch
```

