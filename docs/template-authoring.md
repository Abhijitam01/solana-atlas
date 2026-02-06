# Template Authoring Guide

Templates live in `packages/solana/templates/<template-id>` and are validated via the TemplateAuthoring CLI.

## Create a new template

```bash
pnpm --filter @solana-playground/template-cli build
node packages/template-cli/dist/cli.js init <template-id> --name "Template Name"
```

## Required files
- `metadata.json`
- `explanations.json`
- `program-map.json`
- `precomputed-state.json`
- `program/lib.rs`

Recommended:
- `function-specs.json`

## Validate templates

```bash
pnpm --filter @solana-playground/template-cli build
node packages/template-cli/dist/cli.js validate
```

## Preview template summary

```bash
pnpm --filter @solana-playground/template-cli build
node packages/template-cli/dist/cli.js preview <template-id>
```

## Metadata rules
- `metadata.id` must match the folder name.
- `learningGoals` and `solanaConcepts` should be non-empty for grant-ready templates.
