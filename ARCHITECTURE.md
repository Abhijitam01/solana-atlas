# Architecture Documentation

## Overview

The Solana Developer Playground is a monorepo built with Turborepo and pnpm, designed to teach Solana programming through interactive, explorable code.

## System Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Next.js Frontend            │
│  ┌─────────┐ ┌─────────┐ ┌──────┐│
│  │  Code   │ │   Map    │ │State ││
│  │  Panel  │ │  Panel   │ │Panel ││
│  └─────────┘ └─────────┘ └──────┘│
└──────┬──────────────────────────────┘
       │
       │ HTTP/REST
       ▼
┌─────────────────────────────────────┐
│         Express API                 │
│  ┌──────────┐  ┌──────────┐       │
│  │Templates │  │  Gemini  │       │
│  │  Route   │  │ Service  │       │
│  └──────────┘  └──────────┘       │
│  ┌──────────┐                      │
│  │ Execute  │                      │
│  │  Route   │                      │
│  └─────┬────┘                      │
└────────┼────────────────────────────┘
         │
         │ HTTP
         ▼
┌─────────────────────────────────────┐
│      Runner Service                 │
│  ┌──────────────────────────────┐  │
│  │  solana-test-validator      │  │
│  │  (isolated execution)       │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Package Structure

### `packages/types`

Shared TypeScript types and Zod schemas for:
- Template metadata
- Line explanations
- Execution results
- Program maps

Used by all apps to ensure type safety across the monorepo.

### `packages/solana`

Template loader and program templates:
- `loadTemplate(id)`: Loads a template with all metadata
- `listTemplates()`: Returns all available template IDs
- `templates/`: Directory containing all program templates

Each template includes:
- `program/lib.rs`: Anchor program code
- `metadata.json`: Learning goals, concepts, difficulty
- `explanations.json`: Line-by-line explanations
- `program-map.json`: Extracted structure (instructions, accounts, CPIs)
- `precomputed-state.json`: Pre-run execution results

### `packages/config`

Shared configuration:
- TypeScript configs (base, nextjs, node)
- ESLint config
- Tailwind config

## Application Services

### `apps/web` - Next.js Frontend

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS
- Monaco Editor
- Zustand (state management)
- TanStack Query (server state)

**Key Components:**
- `CodePanel`: Monaco editor with line highlighting
- `MapPanel`: Program structure visualization
- `StatePanel`: Explanations and account state

**State Management:**
- Zustand store (`stores/playground.ts`) manages:
  - Current template
  - Selected/hovered lines
  - Execution mode (precomputed/live)
  - Current explanation

**Data Flow:**
1. User selects template → `useTemplate()` hook fetches from API
2. User clicks line → Zustand updates `selectedLine`
3. `StatePanel` reacts to `selectedLine` → shows explanation
4. `CodePanel` highlights line based on `selectedLine`

### `apps/api` - Express API

**Routes:**
- `GET /templates`: List all templates
- `GET /templates/:id`: Get full template data
- `POST /templates/:id/explain`: Get AI explanation for lines
- `POST /execute`: Trigger live execution (proxies to runner)
- `GET /health`: Health check

**Services:**
- `gemini.ts`: Integration with Google Gemini API for explanations
- `runner-client.ts`: HTTP client for runner service

**Data Flow:**
1. Frontend requests template → API loads from `@solana-playground/solana`
2. Frontend requests explanation → API calls Gemini with context
3. Frontend requests execution → API proxies to runner service

### `apps/runner` - Sandbox Execution

**Purpose:**
Isolated service for executing Solana programs safely.

**Components:**
- `executor.ts`: Main execution logic
- `validator.ts`: Manages `solana-test-validator` process
- `sandbox.ts`: Resource limits and safety measures

**Safety:**
- 30-second execution timeout
- Memory limits (512MB)
- No outbound network
- Ephemeral accounts

**Status:**
V1 has placeholder implementation. Full execution requires:
- Solana CLI installation
- Program compilation
- Transaction building
- Account state capture

## Data Models

### Template

```typescript
interface Template {
  id: string;
  code: string;
  metadata: TemplateMetadata;
  explanations: LineExplanation[];
  programMap: ProgramMap;
  precomputedState: PrecomputedState;
}
```

### LineExplanation

```typescript
interface LineExplanation {
  lineNumber: number;
  what: string;
  why: string;
  solanaConcept?: string;
  rustConcept?: string;
  whatBreaksIfRemoved?: string;
  isImportant: boolean;
  relatedLines?: number[];
}
```

### ExecutionResult

```typescript
interface ExecutionResult {
  success: boolean;
  scenario: string;
  accountsBefore: AccountState[];
  accountsAfter: AccountStateAfter[];
  logs: string[];
  computeUnits: number;
  error?: string;
}
```

## Security Considerations

### V1 (Current)

- **Read-only templates**: No user code execution
- **Pre-computed results**: No runtime execution
- **Isolated runner**: Separate service boundary
- **No wallet connection**: No private keys

### Future (V2+)

- **Sandbox isolation**: Docker containers per execution
- **Resource limits**: CPU, memory, time
- **Network restrictions**: No outbound calls
- **Rate limiting**: Prevent abuse
- **Input validation**: Strict schema validation

## Deployment

### Development

```bash
pnpm install
pnpm dev  # Runs all services
```

### Production

- **Web + API**: DigitalOcean App Platform
- **Runner**: DigitalOcean Droplet (needs persistent process)

See `DEPLOYMENT.md` for detailed instructions.

## Performance Considerations

- **Template loading**: Cached in API service
- **Explanations**: Cached in frontend (TanStack Query)
- **Pre-computed state**: Instant display, no computation
- **Live execution**: Async, with timeout

## Future Enhancements

- **Caching**: Redis for template metadata
- **CDN**: Static assets (templates, images)
- **Database**: User progress, custom templates
- **WebSockets**: Real-time execution updates
- **Queue**: Background execution processing

