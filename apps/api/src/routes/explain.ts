import { Router } from "express";
import { explainLines } from "../services/gemini";
import { loadTemplate } from "@solana-playground/solana";
import { z } from "zod";
import { asyncHandler } from "../middleware/error-handler";
import { getCachedOrCompute, cacheKeys } from "../services/cache";
import { explainRateLimit } from "../middleware/rate-limit";

const ExplainRequestSchema = z.object({
  lineNumbers: z
    .array(z.number().int().positive())
    .min(1)
    .max(10, "Maximum 10 lines at a time"),
});

const TemplateIdSchema = z.object({
  id: z.string().min(1).max(100),
});

export const explainRouter = Router();

explainRouter.post(
  "/:id/explain",
  explainRateLimit,
  asyncHandler(async (req, res) => {
    const { id } = TemplateIdSchema.parse({ id: req.params.id });
    const body = ExplainRequestSchema.parse(req.body);

    const template = await loadTemplate(id);
    
    // Sort line numbers for consistent cache keys
    const sortedLines = [...body.lineNumbers].sort((a, b) => a - b);
    const cacheKey = cacheKeys.explanation(id, sortedLines.join(","));

    const explanations = await getCachedOrCompute(
      cacheKey,
      () =>
        explainLines({
          templateId: id,
          lineNumbers: sortedLines,
          code: template.code,
          context: {
            programMap: template.programMap,
            existingExplanations: template.explanations,
          },
        }),
      30 * 60 * 1000 // 30 minutes for explanations
    );

    res.json(explanations);
  })
);

