# Dependency Graph

This is a curated dependency map to help navigate the codebase. It focuses on top-level modules and stable relationships rather than every file.

## Workspace Map

```
apps/web
  ├─ consumes @solana-playground/types
  ├─ uses templates from packages/solana
  ├─ reads state from apps/runner (via API or precomputed data)
  └─ renders UI for learning, execution, and visualization

apps/api
  ├─ depends on packages/db
  ├─ uses packages/types for shared contracts
  └─ serves templates + progress endpoints

apps/runner
  ├─ depends on packages/solana for templates
  └─ produces execution/state snapshots

packages/types
  └─ shared type contracts across apps

packages/solana
  └─ template source-of-truth for code + metadata

```

## Web UI Dependencies

```
app/playground/[templateId]/page.tsx
  ├─ components/TemplateHeader
  ├─ components/panels/CodePanel
  ├─ components/panels/MapPanel
  ├─ components/panels/StatePanel
  ├─ components/ui/ResizablePanels
  ├─ hooks/use-templates
  └─ stores/playground
```

## Notes
- This file is intentionally curated and should be updated when new top-level packages are added.
- For code-level graphs, consider generating an automated graph as a build step.
