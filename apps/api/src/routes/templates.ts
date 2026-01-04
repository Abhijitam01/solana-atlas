import { Router } from "express";
import { z } from "zod";
import { loadTemplate, listTemplates } from "@solana-playground/solana";
import { asyncHandler } from "../middleware/error-handler";
import {
  getCachedTemplate,
  getCachedTemplateList,
} from "../services/cache";

export const templatesRouter = Router();

const TemplateIdSchema = z.object({
  id: z.string().min(1).max(100),
});

templatesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const templates = await getCachedTemplateList(async () => {
      const templateIds = await listTemplates();
      const loadedTemplates = await Promise.all(
        templateIds.map(async (id) => {
          try {
            const template = await loadTemplate(id);
            return {
              id: template.id,
              name: template.metadata.name,
              description: template.metadata.description,
              difficulty: template.metadata.difficulty,
            };
          } catch (error) {
            console.error(`Error loading template ${id}:`, error);
            return null;
          }
        })
      );
      // Filter out failed template loads
      return loadedTemplates.filter(
        (t): t is NonNullable<typeof t> => t !== null
      );
    });
    res.json(templates);
  })
);

templatesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = TemplateIdSchema.parse({ id: req.params.id });
    const template = await getCachedTemplate(id, () => loadTemplate(id));
    res.json(template);
  })
);

