import { z } from "zod";
export declare const LineExplanationSchema: z.ZodObject<{
    line: z.ZodNumber;
    type: z.ZodEnum<["instruction", "account", "macro", "logic", "security"]>;
    summary: z.ZodString;
    why: z.ZodOptional<z.ZodString>;
    risk: z.ZodOptional<z.ZodString>;
    concepts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    line: number;
    type: "instruction" | "account" | "macro" | "logic" | "security";
    summary: string;
    why?: string | undefined;
    risk?: string | undefined;
    concepts?: string[] | undefined;
}, {
    line: number;
    type: "instruction" | "account" | "macro" | "logic" | "security";
    summary: string;
    why?: string | undefined;
    risk?: string | undefined;
    concepts?: string[] | undefined;
}>;
export type LineExplanation = z.infer<typeof LineExplanationSchema>;
//# sourceMappingURL=explanation.d.ts.map
