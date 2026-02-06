# Runtime Entry Points

## Web App
Entry: `apps/web/app/layout.tsx` and `apps/web/app/page.tsx`

- `layout.tsx` wires global providers and fonts
- `page.tsx` is the home experience listing templates
- `/playground/[templateId]` is the interactive playground route

## API
Entry: `apps/api/src`

Routes are organized by domain. The app is designed to be stateless, depending on shared packages for data and configuration.

## Runner
Entry: `apps/runner/src`

This service captures execution and state to power the UI’s live and precomputed displays.
