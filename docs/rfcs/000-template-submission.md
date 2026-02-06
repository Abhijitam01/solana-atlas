# RFC 000: Template Submission & Validation

## Summary
Define a consistent process for adding new learning templates that are schema-valid and execution-ready.

## Problem
Templates currently have no standardized submission flow. This slows reviews, introduces schema drift, and makes execution failures harder to triage.

## Proposal
- Require new templates to use the TemplateAuthoring CLI scaffold.
- Validate templates in CI using shared schemas.
- Standardize metadata fields to power learning paths and analytics.

## Detailed Design
- Use `solana-template init <template-id>` to scaffold.
- Ensure the following files exist:
  - `metadata.json`
  - `explanations.json`
  - `program-map.json`
  - `precomputed-state.json`
  - `program/lib.rs`
- Optional but encouraged: `function-specs.json`.
- CI runs `solana-template validate` to enforce schema compliance.

## Impact
- Higher template consistency
- Faster onboarding for contributors
- Better analytics and UX wiring

## Rollout
- Add CLI and CI validation.
- Update docs and CONTRIBUTING.
- Require RFCs for new templates after rollout.

## Risks
- Initial contributor friction (mitigated by CLI scaffold)
