import { z } from "zod";

export const FunctionSpecSchema = z.object({
  id: z.string(),
  title: z.string(),
  lineRange: z.tuple([z.number(), z.number()]),
  does: z.string(),
  why: z.string(),
  breaksIfRemoved: z.string(),
  concepts: z.array(z.string()),
  securityImplications: z.string().optional(),
});

export type FunctionSpec = z.infer<typeof FunctionSpecSchema>;
