# Contributing

Thanks for helping improve the Solana Developer Playground. This repository is optimized for tutorial templates and learning UX.

## Quick start
- Install dependencies: `pnpm install`
- Build: `pnpm build`
- Run web: `pnpm --filter @solana-playground/web dev`

## Template contributions
Templates live in `packages/solana/templates/<template-id>`. Each template must pass schema validation.

### Required files
- `metadata.json`
- `explanations.json`
- `program-map.json`
- `precomputed-state.json`
- `function-specs.json` (optional but recommended)
- `program/lib.rs`

### Create a new template
Use the CLI:

```bash
pnpm --filter @solana-playground/template-cli build
node packages/template-cli/dist/cli.js init <template-id> --name "Template Name"
```

### Validate templates

```bash
pnpm --filter @solana-playground/template-cli build
node packages/template-cli/dist/cli.js validate
```

## RFC process
Large changes (new templates, learning flows, execution behavior) should go through the lightweight RFC process:

1. Copy `docs/rfcs/000-template-submission.md` to a new file like `docs/rfcs/001-your-change.md`.
2. Fill it out with the proposal and impact.
3. Open a PR and tag the core maintainers.

## Pull request checklist
- [ ] Template validation passes
- [ ] New templates include metadata, explanations, program map, precomputed state
- [ ] Execution scenarios include args for live mode (if used)
- [ ] UI updates include screenshots or a short demo clip
