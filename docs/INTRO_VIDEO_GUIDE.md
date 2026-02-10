# Intro Video Creation Guide

## Complete Technical Documentation for Video Production

This document provides everything you need to create an intro/demo video for Solana Playground, including architecture, tech stack, and how everything works under the hood.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Tech Stack](#tech-stack)
4. [Key Features & How They Work](#key-features--how-they-work)
5. [Data Flow & Parsing](#data-flow--parsing)
6. [Video Script Outline](#video-script-outline)
7. [Technical Talking Points](#technical-talking-points)

---

## Project Overview

**Solana Playground** is an interactive learning platform for Solana/Anchor development that makes code explorable, explainable, and executable.

### Core Philosophy
- **Learning-first**: Every feature teaches Solana concepts
- **Interactive**: Edit, run, and see results in real-time
- **Safe**: Sandboxed execution, no wallet needed
- **Visual**: See state changes, program structure, and execution flow

---

## Architecture Deep Dive

### Monorepo Structure (Turborepo)

```
solana-playground/
├── apps/
│   ├── web/              # Next.js 14 frontend (React)
│   ├── api/              # Express.js API service
│   └── runner/           # Solana program execution service
├── packages/
│   ├── types/            # Shared TypeScript types & Zod schemas
│   ├── solana/           # Program templates + metadata
│   ├── db/               # Database schema (Drizzle ORM)
│   ├── auth/             # Authentication utilities
│   └── config/           # Shared configs (TS, ESLint, Tailwind)
```

### Why This Architecture?

1. **Separation of Concerns**: Frontend, API, and execution are separate services
2. **Code Sharing**: Types and configs shared via packages
3. **Scalability**: Each service can scale independently
4. **Type Safety**: Shared types ensure consistency across services

---

## Tech Stack

### Frontend (`apps/web`)

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Next.js 14** | React framework | Server components, API routes, optimal performance |
| **React 18** | UI library | Component-based, hooks, concurrent features |
| **TypeScript** | Type safety | Catches errors at compile time |
| **Monaco Editor** | Code editor | VS Code's editor, syntax highlighting, completions |
| **Zustand** | State management | Lightweight, no boilerplate, TypeScript-friendly |
| **Framer Motion** | Animations | Smooth transitions, gestures |
| **Tailwind CSS** | Styling | Utility-first, fast development |
| **tRPC** | Type-safe APIs | End-to-end type safety, no code generation |
| **Supabase** | Auth & Database | OAuth, PostgreSQL, real-time |

### Backend (`apps/api`)

| Technology | Purpose |
|------------|---------|
| **Express.js** | HTTP server |
| **tRPC** | Type-safe RPC |
| **Google Gemini AI** | Code explanations & completions |
| **Drizzle ORM** | Database queries |

### Execution (`apps/runner`)

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Solana CLI** | Program compilation |
| **Local Validator** | Sandboxed execution |

---

## Key Features & How They Work

### 1. Code Editor (Monaco)

**Location**: `apps/web/components/panels/CodePanel.tsx`

**How it works**:
- Monaco Editor (VS Code's editor) embedded in React
- Custom Solana themes (dark, light, grid, matrix)
- Real-time syntax highlighting for Rust
- Line-by-line decorations for breakpoints, execution, selection

**Key Code**:
```typescript
// Register Solana completion provider
registerSolanaCompletionProvider(monaco);

// Register AI inline completion
monaco.languages.registerInlineCompletionsProvider("rust", {
  provideInlineCompletions: async (model, position) => {
    const completion = await generateCodeCompletion(prefix, suffix);
    return { items: [{ insertText: completion }] };
  }
});
```

**What to show in video**:
- Type `msg!` → Tab completion appears
- Type `ctx.accounts.` → Context-aware suggestions
- Type code → AI ghost text appears

---

### 2. Template System

**Location**: `packages/solana/templates/`

**Structure**:
```
template-name/
├── program/
│   └── lib.rs           # Rust/Anchor program code
├── metadata.json        # Template metadata (name, difficulty, concepts)
├── line-explanations.json  # Line-by-line explanations
├── program-map.json      # Program structure (instructions, accounts, PDAs)
├── precomputed-state.json # Execution results
└── function-specs.json   # Function specifications
```

**How templates are loaded**:
1. API route (`apps/web/app/api/templates/route.ts`) scans `packages/solana/templates/`
2. Reads `metadata.json` for each template
3. Returns list to frontend
4. Frontend loads full template on demand

**Parsing**:
- Templates are JSON files (not compiled)
- Frontend parses JSON and renders in editor
- Explanations mapped to line numbers
- Program map parsed for visualization

---

### 3. Line-by-Line Explanations

**Location**: `apps/web/components/panels/StatePanel.tsx`

**How it works**:
1. User clicks/hovers over code line
2. Frontend looks up explanation in `line-explanations.json`
3. Displays: **What** (summary), **Why** (reasoning), **Concepts** (Solana concepts)
4. Falls back to AI (Gemini) if no explanation exists

**Data Structure**:
```json
{
  "line": 7,
  "summary": "Defines the initialize instruction",
  "why": "Every Anchor program needs an entry point",
  "concepts": ["Instructions", "Programs"]
}
```

**What to show**:
- Click line 7 → Explanation panel opens
- Shows structured explanation
- Highlights related Solana concepts

---

### 4. Program Map Visualization

**Location**: `apps/web/components/panels/MapPanel.tsx`

**How it works**:
- Parses `program-map.json` which contains:
  - **Instructions**: All program functions
  - **Accounts**: Account structures
  - **PDAs**: Program Derived Addresses
  - **CPI Calls**: Cross-program invocations
  - **Flow**: Execution flow graph

**Visualization**:
- Interactive graph showing program structure
- Click instruction → Highlights related accounts
- Shows data flow between components

**Data Structure**:
```json
{
  "instructions": [
    {
      "name": "initialize",
      "accounts": ["payer", "data_account"],
      "lineRange": [7, 12]
    }
  ],
  "accounts": [...],
  "cpiCalls": [...]
}
```

---

### 5. Execution System

**Location**: `apps/runner/` + `apps/web/components/panels/ExecutionPanel.tsx`

**How it works**:

**Precomputed Mode** (Default):
1. Templates include `precomputed-state.json`
2. Contains execution results (account states, logs)
3. Instant display, no compilation needed
4. Perfect for learning (consistent results)

**Live Mode** (Future):
1. Frontend sends code to API
2. API forwards to Runner service
3. Runner compiles Rust → BPF
4. Executes on local validator
5. Returns results (accounts, logs, errors)

**Execution Flow**:
```
User clicks "Run"
  ↓
Frontend → API → Runner
  ↓
Runner compiles program
  ↓
Executes on local validator
  ↓
Returns account states, logs
  ↓
Frontend visualizes results
```

**What to show**:
- Click "Run" → Execution panel shows results
- See account states before/after
- View execution logs
- See state changes in real-time

---

### 6. AI-Powered Features

**Location**: `apps/web/app/actions/ai.ts`

**Two AI Features**:

#### A. Code Explanations (Fallback)
- If template has no explanation for a line
- Calls Gemini API with code context
- Returns explanation in structured format

#### B. Code Completion
- As you type, sends prefix + suffix to Gemini
- Gemini returns code suggestion
- Displays as "ghost text" in editor
- Press Tab to accept

**Prompt Engineering**:
```typescript
const prompt = `You are a Solana/Anchor code completion assistant.
- ONLY suggest valid Solana code
- Use Anchor patterns
- Keep completions concise (1-5 lines)
- No explanations, just code`;
```

---

### 7. State Management (Zustand)

**Stores**:
- `playground.ts` - Code, selected line, template
- `layout.ts` - Panels, sidebar, zen mode
- `programs.ts` - User programs, active program
- `execution.ts` - Execution state, breakpoints
- `settings.ts` - Theme, explanations enabled

**Why Zustand**:
- No boilerplate (unlike Redux)
- TypeScript-first
- Small bundle size
- Simple API

**Example**:
```typescript
const { code, setCode } = usePlaygroundStore(
  (state) => ({
    code: state.code,
    setCode: state.setCode,
  })
);
```

---

### 8. Authentication (Supabase)

**Flow**:
1. User clicks "Sign in with Google"
2. Redirects to Google OAuth
3. Google redirects to `/auth/callback`
4. Supabase exchanges code for session
5. Session stored in cookies
6. User authenticated

**Protected Routes**:
- Creating new programs requires auth
- Saving code requires auth
- Viewing templates: No auth needed (public)

**Implementation**:
- `apps/web/components/providers/AuthProvider.tsx` - Auth context
- `apps/web/middleware.ts` - Route protection
- Supabase handles OAuth, sessions, user management

---

## Data Flow & Parsing

### Template Loading Flow

```
1. User opens /playground/hello-solana
   ↓
2. Frontend calls /api/templates/hello-solana
   ↓
3. API reads packages/solana/templates/hello-solana/
   ↓
4. Parses JSON files:
   - metadata.json → Template info
   - program/lib.rs → Code
   - line-explanations.json → Explanations
   - program-map.json → Structure
   - precomputed-state.json → Execution results
   ↓
5. Returns combined Template object
   ↓
6. Frontend stores in Zustand
   ↓
7. Renders in Monaco editor
```

### Code Editing Flow

```
1. User types in editor
   ↓
2. Monaco onChange event fires
   ↓
3. Updates Zustand store (playground.code)
   ↓
4. If custom program → Updates program store
   ↓
5. Auto-save hook debounces (2 seconds)
   ↓
6. If user logged in → Saves to database
   ↓
7. Updates UI ("Saving..." → "Saved")
```

### Execution Flow

```
1. User clicks "Run" in Execution panel
   ↓
2. Frontend sends execution request to API
   ↓
3. API forwards to Runner service
   ↓
4. Runner:
   - Compiles Rust code → BPF bytecode
   - Starts local Solana validator
   - Executes program
   - Captures account states, logs
   ↓
5. Runner returns results
   ↓
6. API returns to frontend
   ↓
7. Frontend visualizes:
   - Account states (before/after)
   - Execution logs
   - State diffs
```

---

## Video Script Outline

### Part 1: Introduction (0:00 - 0:30)
- **Hook**: "Learn Solana development through interactive, explorable code"
- **Problem**: Solana is hard to learn - code is opaque, state is hidden
- **Solution**: Solana Playground makes everything visible and explainable

### Part 2: Architecture Overview (0:30 - 1:00)
- **Monorepo structure**: Frontend, API, Runner
- **Tech stack**: Next.js, React, Monaco, Zustand, Supabase
- **Why**: Separation of concerns, type safety, scalability

### Part 3: Core Features Demo (1:00 - 3:00)

#### Feature 1: Code Editor (1:00 - 1:30)
- Show Monaco editor
- Demonstrate tab completion (Tier 1, 2, 3)
- Show AI ghost text
- Explain: "Real VS Code editor, but for Solana"

#### Feature 2: Line Explanations (1:30 - 2:00)
- Click on code line
- Explanation panel opens
- Show structured explanation (What, Why, Concepts)
- Explain: "Every line explained, no guessing"

#### Feature 3: Program Map (2:00 - 2:30)
- Open Program Map panel
- Show visual structure
- Click instruction → See accounts
- Explain: "See your program's architecture at a glance"

#### Feature 4: Execution (2:30 - 3:00)
- Click "Run"
- Show account states before/after
- Show execution logs
- Explain: "See exactly what happens when code runs"

### Part 4: Technical Deep Dive (3:00 - 4:00)

#### Template System (3:00 - 3:20)
- Show template structure
- Explain JSON parsing
- Show how explanations map to lines

#### AI Integration (3:20 - 3:40)
- Explain Gemini API integration
- Show code completion in action
- Explain prompt engineering

#### State Management (3:40 - 4:00)
- Show Zustand stores
- Explain data flow
- Show how panels communicate

### Part 5: Advanced Features (4:00 - 4:30)
- Mobile responsive design
- Onboarding guide
- Theme customization
- Dashboard integration

### Part 6: Conclusion (4:30 - 5:00)
- Recap key features
- Call to action: "Try it at [URL]"
- Open source: "Contributions welcome"

---

## Technical Talking Points

### For Architecture Section

**"We use a monorepo architecture with Turborepo"**
- Explain: "All code in one repo, but separate services"
- Benefits: Shared types, single build, easy refactoring

**"Frontend is Next.js 14 with React Server Components"**
- Explain: "Server components for performance, client components for interactivity"
- Show: Code editor is client component (needs interactivity)

**"State management with Zustand"**
- Explain: "Lightweight, no boilerplate, TypeScript-first"
- Show: Simple store example

### For Features Section

**"Monaco Editor - VS Code's editor"**
- Explain: "Same editor as VS Code, but embedded"
- Benefits: Syntax highlighting, completions, debugging

**"Templates are JSON files"**
- Explain: "Not compiled, just data"
- Benefits: Easy to edit, version control friendly

**"Precomputed execution results"**
- Explain: "Results baked into templates"
- Benefits: Instant feedback, consistent results

**"AI-powered completions"**
- Explain: "Gemini AI understands Solana patterns"
- Show: Context-aware suggestions

### For Parsing Section

**"How we parse templates"**
1. API scans `packages/solana/templates/`
2. Reads `metadata.json` for each
3. Frontend loads full template on demand
4. Parses JSON into TypeScript types
5. Renders in UI

**"How explanations work"**
1. User clicks line number
2. Frontend looks up line in `line-explanations.json`
3. If found → Display explanation
4. If not → Call Gemini API
5. Cache result for future

**"How program map is built"**
1. Template includes `program-map.json`
2. Contains instructions, accounts, PDAs, CPI calls
3. Frontend parses into graph structure
4. Renders with interactive visualization

---

## Code Examples to Show

### 1. Template Structure
```bash
packages/solana/templates/hello-solana/
├── program/lib.rs          # The actual Rust code
├── metadata.json           # Template info
├── line-explanations.json  # Line-by-line explanations
└── program-map.json        # Program structure
```

### 2. State Management
```typescript
// Simple Zustand store
const usePlaygroundStore = create((set) => ({
  code: "",
  setCode: (code) => set({ code }),
}));
```

### 3. AI Completion
```typescript
// AI completion provider
monaco.languages.registerInlineCompletionsProvider("rust", {
  provideInlineCompletions: async (model, position) => {
    const completion = await generateCodeCompletion(prefix, suffix);
    return { items: [{ insertText: completion }] };
  }
});
```

### 4. Template Parsing
```typescript
// Load template
const template = await loadTemplate("hello-solana");
// Returns: { code, explanations, programMap, ... }
```

---

## Visual Elements to Highlight

1. **Code Editor**: Show Monaco editor with syntax highlighting
2. **Completion Menu**: Show tab completion in action
3. **Explanation Panel**: Show structured explanation
4. **Program Map**: Show visual graph
5. **Execution Results**: Show before/after account states
6. **Mobile View**: Show responsive design
7. **Onboarding**: Show interactive guide

---

## Key Metrics to Mention

- **24 Templates**: Curated Solana programs
- **3 Completion Tiers**: Static, context-aware, AI-powered
- **5 Panels**: Code, Map, Explanation, Execution, Inspector
- **Type-Safe**: End-to-end TypeScript
- **Open Source**: Contributions welcome

---

## Production Checklist

- [ ] Record screen showing each feature
- [ ] Add voiceover explaining architecture
- [ ] Show code examples (Monaco, Zustand, templates)
- [ ] Demonstrate AI completion
- [ ] Show mobile responsive design
- [ ] Include onboarding flow
- [ ] Add call-to-action at end

---

## Additional Resources

- **Architecture Docs**: `docs/01_ROOT_LEVEL_AND_CONFIGURATION.md`
- **Web App Docs**: `docs/02_WEB_APPLICATION.md`
- **API Docs**: `docs/03_API_SERVICE.md`
- **Runner Docs**: `docs/04_RUNNER_SERVICE.md`
- **Packages Docs**: `docs/05_SHARED_PACKAGES.md`

---

## Summary

**Solana Playground** is built with:
- **Next.js 14** for the frontend
- **Monaco Editor** for code editing
- **Zustand** for state management
- **Supabase** for auth & database
- **Gemini AI** for completions & explanations
- **Turborepo** for monorepo management

**Everything is type-safe, open-source, and designed for learning.**

