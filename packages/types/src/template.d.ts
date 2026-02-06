import { z } from "zod";
export declare const TemplateMetadataSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    difficulty: z.ZodEnum<["beginner", "intermediate"]>;
    learningGoals: z.ZodArray<z.ZodString, "many">;
    solanaConcepts: z.ZodArray<z.ZodString, "many">;
    estimatedTime: z.ZodString;
    prerequisites: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    description: string;
    difficulty: "beginner" | "intermediate";
    learningGoals: string[];
    solanaConcepts: string[];
    estimatedTime: string;
    prerequisites?: string[] | undefined;
}, {
    id: string;
    name: string;
    description: string;
    difficulty: "beginner" | "intermediate";
    learningGoals: string[];
    solanaConcepts: string[];
    estimatedTime: string;
    prerequisites?: string[] | undefined;
}>;
export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>;
//# sourceMappingURL=template.d.ts.map