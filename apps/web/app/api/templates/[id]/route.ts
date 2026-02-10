import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';
import {
  TemplateMetadataSchema,
  ProgramMapSchema,
  PrecomputedStateSchema,
  FunctionSpecSchema,
} from '@solana-playground/types';

// Simple in-memory cache
const templateCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

async function readJSON<T>(path: string): Promise<T> {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`Failed to read JSON file at ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const LocalLineExplanationSchema = z.object({
  line: z.number(),
  type: z.enum(["instruction", "account", "macro", "logic", "security"]),
  summary: z.string(),
  why: z.string().optional(),
  risk: z.string().optional(),
  concepts: z.array(z.string()).optional(),
});

// Local implementation of loadTemplate to ensure correct path resolution
async function loadTemplateLocal(id: string) {
  // Try multiple possible paths for template resolution
  // This handles different deployment scenarios (local dev, Vercel, Railway, etc.)
  
  const cwd = process.cwd();
  const possiblePaths = [
    // PRIMARY: From apps/web - go up two levels to root, then into packages (shared location)
    join(cwd, '..', '..', 'packages', 'solana', 'templates'),
    // From root directory
    join(cwd, 'packages', 'solana', 'templates'),
    // Standalone build (production) - templates should be copied to .next/standalone
    join(cwd, 'packages', 'solana', 'templates'),
    join(cwd, '..', 'packages', 'solana', 'templates'),
    // FALLBACK: Local development (if running from root) - deprecated, use packages/solana/templates
    join(cwd, 'apps', 'web', 'packages', 'solana', 'templates'),
  ];
  
  let templatesDir: string | null = null;
  
  // Find the first path that exists as a directory
  for (const path of possiblePaths) {
    try {
      const { stat } = await import('fs/promises');
      const stats = await stat(path);
      if (stats.isDirectory()) {
        // Directory exists - use it (even if empty, it's a valid templates directory)
        templatesDir = path;
        break;
      }
    } catch {
      // Path doesn't exist, try next one
      continue;
    }
  }
  
  if (!templatesDir) {
    throw new Error(
      `Templates directory not found. Tried paths: ${possiblePaths.join(', ')}. CWD: ${cwd}`
    );
  }
  
  // Handle nested template paths like "beginner/hello-anchor"
  // Sanitize the id to prevent path traversal
  const sanitizedId = id.replace(/\.\./g, '').replace(/^\//, '');
  let basePath: string | null = null;
  
  // Templates are in flat structure (no categories)
  const templateSearchPaths = [
    // Direct path (flat structure)
    join(templatesDir, sanitizedId),
  ];
  
  // Find the first path that contains a valid template
  for (const path of templateSearchPaths) {
    try {
      const testMetadataPath = join(path, 'metadata.json');
      await readFile(testMetadataPath, 'utf-8');
      basePath = path;
      break;
    } catch {
      continue;
    }
  }
  
  if (!basePath) {
    throw new Error(
      `Template "${id}" not found. Searched paths: ${templateSearchPaths.join(', ')}`
    );
  }
  
  console.log(`Loading template "${id}" from ${basePath} (CWD: ${cwd})`);

  try {
     const [code, metadata, explanations, programMap, precomputedState, functionSpecs] =
      await Promise.all([
        readFile(join(basePath, "program/lib.rs"), "utf-8").catch((err) => {
          throw new Error(`Failed to read program code from ${join(basePath, "program/lib.rs")}: ${err instanceof Error ? err.message : String(err)}`);
        }),
        readJSON(join(basePath, "metadata.json")).then((data) => TemplateMetadataSchema.parse(data)).catch((err) => {
          throw new Error(`Failed to parse metadata.json: ${err instanceof Error ? err.message : String(err)}`);
        }),
        readJSON(join(basePath, "line-explanations.json")).then((data) => z.array(LocalLineExplanationSchema).parse(data)).catch((err) => {
          throw new Error(`Failed to parse line-explanations.json: ${err instanceof Error ? err.message : String(err)}`);
        }),
        readJSON(join(basePath, "program-map.json")).then((data) => ProgramMapSchema.parse(data)).catch((err) => {
          throw new Error(`Failed to parse program-map.json: ${err instanceof Error ? err.message : String(err)}`);
        }),
        readJSON(join(basePath, "precomputed-state.json")).then((data) => PrecomputedStateSchema.parse(data)).catch((err) => {
          throw new Error(`Failed to parse precomputed-state.json: ${err instanceof Error ? err.message : String(err)}`);
        }),
        readJSON(join(basePath, "function-specs.json"))
          .then((data) => z.array(FunctionSpecSchema).parse(data))
          .catch(() => []), 
      ]);

    return {
      id,
      code,
      metadata,
      explanations,
      programMap,
      functionSpecs,
      precomputedState,
    };
  } catch (error) {
     console.error(`Local load failed for template "${id}" at ${basePath}:`, error);
     throw error;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id || id.length > 100) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    // Check cache
    const cached = templateCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`Returning cached template ${id}`);
      return NextResponse.json(cached.data);
    }

    // Use local implementation
    const template = await loadTemplateLocal(id);
    console.log(`Successfully loaded template ${id}`);
    
    // Update cache
    templateCache.set(id, { data: template, timestamp: Date.now() });
    
    return NextResponse.json(template);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error loading template ${params.id}:`, errorMessage);
    return NextResponse.json(
      { 
        error: errorMessage,
        templateId: params.id,
        hint: 'Make sure the template exists and all required files are present'
      },
      { status: 404 }
    );
  }
}
