import { z } from "zod";

export const LineExplanationSchema = z.object({
  line: z.number(),
  type: z.enum(["instruction", "account", "macro", "logic", "security"]),
  summary: z.string(),
  why: z.string().optional(),
  risk: z.string().optional(),
  concepts: z.array(z.string()).optional(),
});

export type LineExplanation = z.infer<typeof LineExplanationSchema>;
