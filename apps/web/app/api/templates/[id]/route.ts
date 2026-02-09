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
  // Use process.cwd() which we know works with our symlink
  // apps/web/packages/solana/templates -> ../../../packages/solana/templates
  // OR ../packages/solana/templates if in Vercel root
  
  let templatesDir;
  const cwd = process.cwd();
  
  if (cwd.includes('apps/web') || cwd.includes('apps\\web')) {
    templatesDir = join(cwd, 'packages/solana/templates');
  } else {
    // Vercel / root context
    templatesDir = join(cwd, 'packages/solana/templates');
  }
  
  const basePath = join(templatesDir, id);
  console.log(`Loading template locally from ${basePath}`);

  try {
     const [code, metadata, explanations, programMap, precomputedState, functionSpecs] =
      await Promise.all([
        readFile(join(basePath, "program/lib.rs"), "utf-8"),
        readJSON(join(basePath, "metadata.json")).then((data) => TemplateMetadataSchema.parse(data)),
        readJSON(join(basePath, "line-explanations.json")).then((data) => z.array(LocalLineExplanationSchema).parse(data)),
        readJSON(join(basePath, "program-map.json")).then((data) => ProgramMapSchema.parse(data)),
        readJSON(join(basePath, "precomputed-state.json")).then((data) => PrecomputedStateSchema.parse(data)),
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
     console.error("Local load failed:", error);
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
      return NextResponse.json(cached.data);
    }

    // Use local implementation
    const template = await loadTemplateLocal(id);
    console.log(`Loaded template ${id}`);
    
    // Update cache
    templateCache.set(id, { data: template, timestamp: Date.now() });
    
    return NextResponse.json(template);
  } catch (error) {
    console.error(`Error loading template ${params.id}:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Template not found' },
      { status: 404 }
    );
  }
}
