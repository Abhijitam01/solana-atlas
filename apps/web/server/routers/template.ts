import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import fs from 'fs';
import path from 'path';

// Templates are stored in packages/solana/templates/ (flat structure, no categories)
const TEMPLATES_DIR = path.join(process.cwd(), '../../packages/solana/templates');

// Helper to read template metadata (flat structure)
const getTemplateMetadata = (templateId: string) => {
  const metadataPath = path.join(TEMPLATES_DIR, templateId, 'metadata.json');
  if (!fs.existsSync(metadataPath)) return null;
  
  try {
    const content = fs.readFileSync(metadataPath, 'utf-8');
    const metadata = JSON.parse(content);
    return { ...metadata, id: templateId };
  } catch (e) {
    console.error(`Failed to parse metadata for ${templateId}`, e);
    return null;
  }
};

// Helper to read all files in a template
const getTemplateFiles = (templateId: string) => {
    const programDir = path.join(TEMPLATES_DIR, templateId, 'program');
    const libRsPath = path.join(programDir, 'lib.rs');
    
    if (!fs.existsSync(libRsPath)) return null;
    
    const libRs = fs.readFileSync(libRsPath, 'utf-8');
    
    // We also need the other JSON files
    const baseDir = path.join(TEMPLATES_DIR, templateId);
    const readJson = (filename: string) => {
        const p = path.join(baseDir, filename);
        return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) : {};
    };

    return {
        code: libRs,
        lineExplanations: readJson('line-explanations.json'),
        programMap: readJson('program-map.json'),
        precomputedState: readJson('precomputed-state.json'),
        functionSpecs: readJson('function-specs.json'),
    };
};

export const templateRouter = router({
  getAll: publicProcedure
    .query(async () => {
      const templates: Array<{ id: string; name?: string; description?: string; difficulty?: string; [key: string]: any }> = [];

      if (!fs.existsSync(TEMPLATES_DIR)) {
        console.warn(`Templates directory not found: ${TEMPLATES_DIR}`);
        return templates;
      }

      const templateDirs = fs.readdirSync(TEMPLATES_DIR);
      for (const templateId of templateDirs) {
        // Skip hidden files/dirs and category folders (if any remain)
        if (templateId.startsWith('.') || templateId === 'beginner' || templateId === 'intermediate' || templateId === 'expert') continue;
        
        const templatePath = path.join(TEMPLATES_DIR, templateId);
        if (fs.statSync(templatePath).isDirectory()) {
          const metadata = getTemplateMetadata(templateId);
          if (metadata) {
            templates.push(metadata);
          }
        }
      }

      return templates;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
       const potentialPath = path.join(TEMPLATES_DIR, input.id);
       
       if (fs.existsSync(potentialPath) && fs.statSync(potentialPath).isDirectory()) {
           const metadata = getTemplateMetadata(input.id);
           const files = getTemplateFiles(input.id);
           
           if (!metadata || !files) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to load template files' });
           }

           // Construct response to match store expectations
           return {
               id: input.id,
               metadata: metadata, // nested metadata
               ...files,
               // lineExplanations are returned as part of keys in files
           };
       }

       throw new TRPCError({ code: 'NOT_FOUND', message: `Template ${input.id} not found` });
    }),
});
