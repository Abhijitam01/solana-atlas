import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

// Simple in-memory cache for serverless
let templatesCache: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function findTemplatesDir(): Promise<string> {
  const cwd = process.cwd();
  const possiblePaths = [
    // Standalone build (production) - templates should be copied to .next/standalone
    join(cwd, 'packages/solana/templates'),
    join(cwd, '..', 'packages', 'solana', 'templates'),
    join(cwd, '..', '..', 'packages', 'solana', 'templates'),
    // Local development
    join(cwd, 'apps', 'web', 'packages', 'solana', 'templates'),
    // Root context
    join(process.cwd(), 'packages', 'solana', 'templates'),
  ];
  
  // Find the first path that exists
  for (const path of possiblePaths) {
    try {
      const testPath = join(path, 'hello-solana', 'metadata.json');
      await readFile(testPath, 'utf-8');
      return path;
    } catch {
      // Path doesn't exist, try next one
      continue;
    }
  }
  
  throw new Error(
    `Templates directory not found. Tried paths: ${possiblePaths.join(', ')}. CWD: ${cwd}`
  );
}

async function findTemplatesRecursive(dir: string, basePath: string = ''): Promise<string[]> {
  const templates: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.name.startsWith('_')) continue;
    
    const fullPath = join(dir, entry.name);
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
    
    if (entry.isDirectory()) {
      // Check if this directory contains a template (has metadata.json)
      try {
        const metadataPath = join(fullPath, 'metadata.json');
        await readFile(metadataPath, 'utf-8');
        // This is a template directory
        templates.push(relativePath);
      } catch {
        // Not a template directory, recurse into it
        const nestedTemplates = await findTemplatesRecursive(fullPath, relativePath);
        templates.push(...nestedTemplates);
      }
    }
  }
  
  return templates.sort();
}

async function listTemplatesLocal(): Promise<string[]> {
  try {
    const templatesDir = await findTemplatesDir();
    return await findTemplatesRecursive(templatesDir);
  } catch (error) {
    console.error(`Failed to list templates:`, error);
    return [];
  }
}

export async function GET() {
  try {
    // Check cache
    if (templatesCache && Date.now() - templatesCache.timestamp < CACHE_TTL) {
      return NextResponse.json(templatesCache.data);
    }

    const templateIds = await listTemplatesLocal();
    console.log(`Found ${templateIds.length} templates locally:`, templateIds.slice(0, 10));
    
    // We need to read metadata for each template
    const templatesDir = await findTemplatesDir();
    const loadedTemplates = await Promise.all(
      templateIds.map(async (id) => {
        try {
          // Handle nested paths like "beginner/hello-anchor"
          const metadataPath = join(templatesDir, id, 'metadata.json');
          const content = await readFile(metadataPath, 'utf-8');
          const metadata = JSON.parse(content);
          
          // Use the id from metadata if it exists, otherwise use the path-based id
          const templateId = metadata.id || id;
          
          return {
            id: templateId,
            name: metadata.name,
            description: metadata.description,
            difficulty: metadata.difficulty,
          };
        } catch (error) {
          console.error(`Error loading template metadata for ${id} at ${join(templatesDir, id, 'metadata.json')}:`, error);
          return null;
        }
      })
    );

    const templates = loadedTemplates.filter((t): t is NonNullable<typeof t> => t !== null);
    
    // Update cache
    templatesCache = { data: templates, timestamp: Date.now() };
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
