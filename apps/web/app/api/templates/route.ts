import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

// Simple in-memory cache for serverless
let templatesCache: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function listTemplatesLocal(): Promise<string[]> {
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

  try {
    const entries = await readdir(templatesDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    console.error(`Failed to list templates from ${templatesDir}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    // Check cache
    if (templatesCache && Date.now() - templatesCache.timestamp < CACHE_TTL) {
      // return NextResponse.json(templatesCache.data);
    }

    const templateIds = await listTemplatesLocal();
    console.log(`Found ${templateIds.length} templates locally`);
    
    // We need to read metadata for each template
    const loadedTemplates = await Promise.all(
      templateIds.map(async (id) => {
        try {
          // Use process.cwd() logic again to find the file
          let templatesDir;
          const cwd = process.cwd();
          
          if (cwd.includes('apps/web') || cwd.includes('apps\\web')) {
             templatesDir = join(cwd, 'packages/solana/templates');
          } else {
             templatesDir = join(cwd, 'packages/solana/templates');
          }
          
          const metadataPath = join(templatesDir, id, 'metadata.json');
          const content = await import('fs/promises').then(fs => fs.readFile(metadataPath, 'utf-8'));
          const metadata = JSON.parse(content);
          
          return {
            id: id,
            name: metadata.name,
            description: metadata.description,
            difficulty: metadata.difficulty,
          };
        } catch (error) {
          console.error(`Error loading template metadata for ${id}:`, error);
          return null;
        }
      })
    );

    const templates = loadedTemplates.filter((t): t is NonNullable<typeof t> => t !== null);
    
    // Update cache
    templatesCache = { data: templates, timestamp: Date.now() };
    
    return NextResponse.json({
      cwd: process.cwd(),
      dirname: typeof __dirname !== 'undefined' ? __dirname : 'undefined',
      templates: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
