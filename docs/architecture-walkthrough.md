# Architecture Walkthrough

This walkthrough explains how the main runtime flows connect and where to extend the system safely.

## High-Level Topology

```
┌───────────────────────┐     ┌────────────────────┐
│      apps/web         │     │     apps/api       │
│  Next.js UI + state   │────▶│  REST + services   │
└──────────┬────────────┘     └──────────┬─────────┘
           │                              │
           │                              │
           ▼                              ▼
┌───────────────────────┐     ┌────────────────────┐
│    apps/runner        │     │   packages/*       │
│ Execution + capture   │     │  Shared libraries  │
└───────────────────────┘     └────────────────────┘
```

## UI Runtime Flow (apps/web)

```
Route: /playground/[templateId]
  ↓
app/playground/[templateId]/page.tsx
  ↓
TemplateHeader + ResizablePanels
  ↓
CodePanel | MapPanel | StatePanel
  ↓
Zustand stores + hooks
```

Key ideas:
- Route segments live in `apps/web/app`
- UI primitives are in `apps/web/components/ui`
- State is centralized in `apps/web/stores`


## Extending the System

### Add a new UI panel
1. Create a new component in `apps/web/components/panels`
2. Use the `panel` + `panel-header` utility classes
3. Wire into `ResizablePanels` in the playground route

### Add a new API integration
1. Add a port under `ports/`
2. Implement in `infrastructure/`
3. Inject into use cases via factories
