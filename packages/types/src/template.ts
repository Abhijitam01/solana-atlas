import { z } from "zod";

export const TemplateMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  difficulty: z.enum(["beginner", "intermediate"]),
  learningGoals: z.array(z.string()),
  solanaConcepts: z.array(z.string()),
  estimatedTime: z.string(),
  prerequisites: z.array(z.string()).optional(),
});

export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>;

