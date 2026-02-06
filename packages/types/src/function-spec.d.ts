import { z } from "zod";
export declare const FunctionSpecSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    lineRange: z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>;
    does: z.ZodString;
    why: z.ZodString;
    breaksIfRemoved: z.ZodString;
    concepts: z.ZodArray<z.ZodString, "many">;
    securityImplications: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    why: string;
    title: string;
    lineRange: [number, number];
    concepts: string[];
    does: string;
    breaksIfRemoved: string;
    securityImplications?: string | undefined;
}, {
    id: string;
    why: string;
    title: string;
    lineRange: [number, number];
    concepts: string[];
    does: string;
    breaksIfRemoved: string;
    securityImplications?: string | undefined;
}>;
export type FunctionSpec = z.infer<typeof FunctionSpecSchema>;
//# sourceMappingURL=function-spec.d.ts.map