import { z } from "zod";

export const LineExplanationSchema = z.object({
  lineNumber: z.number(),
  what: z.string(),
  why: z.string(),
  solanaConcept: z.string().optional(),
  rustConcept: z.string().optional(),
  whatBreaksIfRemoved: z.string().optional(),
  isImportant: z.boolean().default(false),
  relatedLines: z.array(z.number()).optional(),
});

export type LineExplanation = z.infer<typeof LineExplanationSchema>;

