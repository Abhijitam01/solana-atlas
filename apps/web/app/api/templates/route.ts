import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

// Simple in-memory cache for serverless
let templatesCache: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function findTemplatesDir(): Promise<string> {
  const cwd = process.cwd();
  const possiblePaths = [
    // PRIMARY: From apps/web - go up two levels to root, then into packages (shared location)
    join(cwd, '..', '..', 'packages', 'solana', 'templates'),
    // From root directory
    join(cwd, 'packages', 'solana', 'templates'),
    // Standalone build (production) - templates should be copied to .next/standalone
    join(cwd, 'packages', 'solana', 'templates'),
    join(cwd, '..', 'packages', 'solana', 'templates'),
  ];
  
  // Find the first path that exists as a directory
  for (const path of possiblePaths) {
    try {
      const { stat } = await import('fs/promises');
      const stats = await stat(path);
      if (stats.isDirectory()) {
        // Directory exists - return it (even if empty, it's a valid templates directory)
        return path;
      }
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

// Featured templates - the 13 templates to show initially in playground
const FEATURED_TEMPLATES = [
  'hello-solana',
  'account-init',
  'pda-vault',
  'token-mint',
  'nft-mint',
  'pda-escrow',
  'instruction-basics',
  'cpi-calls',
  'error-handling-patterns',
  'metadata-updates',
  'staking-pool',
  'multisig-treasury',
  'vesting-stream',
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const featuredOnly = searchParams.get('featured') === 'true';

    // Check cache
    if (templatesCache && Date.now() - templatesCache.timestamp < CACHE_TTL) {
      const cached = templatesCache.data;
      if (featuredOnly) {
        return NextResponse.json(cached.filter((t) => FEATURED_TEMPLATES.includes(t.id)));
      }
      return NextResponse.json(cached);
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
            featured: FEATURED_TEMPLATES.includes(templateId),
          };
        } catch (error) {
          console.error(`Error loading template metadata for ${id} at ${join(templatesDir, id, 'metadata.json')}:`, error);
          return null;
        }
      })
    );

    let templates = loadedTemplates.filter((t): t is NonNullable<typeof t> => t !== null);
    
    // Sort: featured first, then by name
    templates.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });
    
    // Update cache
    templatesCache = { data: templates, timestamp: Date.now() };
    
    // Return featured only if requested
    if (featuredOnly) {
      return NextResponse.json(templates.filter((t) => t.featured));
    }
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
