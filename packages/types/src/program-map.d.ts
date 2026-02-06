import { z } from "zod";
export declare const AccountInfoSchema: z.ZodObject<{
    name: z.ZodString;
    isMut: z.ZodBoolean;
    isSigner: z.ZodBoolean;
    isPda: z.ZodBoolean;
    seeds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isMut: boolean;
    isSigner: boolean;
    isPda: boolean;
    seeds?: string[] | undefined;
}, {
    name: string;
    isMut: boolean;
    isSigner: boolean;
    isPda: boolean;
    seeds?: string[] | undefined;
}>;
export declare const InstructionSchema: z.ZodObject<{
    name: z.ZodString;
    lineStart: z.ZodNumber;
    lineEnd: z.ZodNumber;
    accounts: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        isMut: z.ZodBoolean;
        isSigner: z.ZodBoolean;
        isPda: z.ZodBoolean;
        seeds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        isMut: boolean;
        isSigner: boolean;
        isPda: boolean;
        seeds?: string[] | undefined;
    }, {
        name: string;
        isMut: boolean;
        isSigner: boolean;
        isPda: boolean;
        seeds?: string[] | undefined;
    }>, "many">;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    lineStart: number;
    lineEnd: number;
    accounts: {
        name: string;
        isMut: boolean;
        isSigner: boolean;
        isPda: boolean;
        seeds?: string[] | undefined;
    }[];
}, {
    name: string;
    description: string;
    lineStart: number;
    lineEnd: number;
    accounts: {
        name: string;
        isMut: boolean;
        isSigner: boolean;
        isPda: boolean;
        seeds?: string[] | undefined;
    }[];
}>;
export declare const AccountFieldSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodString;
    description: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    type: string;
}, {
    name: string;
    description: string;
    type: string;
}>;
export declare const AccountDefinitionSchema: z.ZodObject<{
    name: z.ZodString;
    lineStart: z.ZodNumber;
    lineEnd: z.ZodNumber;
    fields: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        type: string;
    }, {
        name: string;
        description: string;
        type: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    name: string;
    lineStart: number;
    lineEnd: number;
    fields: {
        name: string;
        description: string;
        type: string;
    }[];
}, {
    name: string;
    lineStart: number;
    lineEnd: number;
    fields: {
        name: string;
        description: string;
        type: string;
    }[];
}>;
export declare const CpiCallSchema: z.ZodObject<{
    program: z.ZodString;
    instruction: z.ZodString;
    line: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    instruction: string;
    program: string;
    line: number;
}, {
    instruction: string;
    program: string;
    line: number;
}>;
export declare const FlowStepSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    lineRange: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    concepts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    title: string;
    lineRange?: [number, number] | undefined;
    concepts?: string[] | undefined;
}, {
    id: string;
    description: string;
    title: string;
    lineRange?: [number, number] | undefined;
    concepts?: string[] | undefined;
}>;
export declare const ProgramMapSchema: z.ZodObject<{
    flow: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodString;
        lineRange: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
        concepts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        description: string;
        title: string;
        lineRange?: [number, number] | undefined;
        concepts?: string[] | undefined;
    }, {
        id: string;
        description: string;
        title: string;
        lineRange?: [number, number] | undefined;
        concepts?: string[] | undefined;
    }>, "many">>>;
    instructions: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        lineStart: z.ZodNumber;
        lineEnd: z.ZodNumber;
        accounts: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            isMut: z.ZodBoolean;
            isSigner: z.ZodBoolean;
            isPda: z.ZodBoolean;
            seeds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            isMut: boolean;
            isSigner: boolean;
            isPda: boolean;
            seeds?: string[] | undefined;
        }, {
            name: string;
            isMut: boolean;
            isSigner: boolean;
            isPda: boolean;
            seeds?: string[] | undefined;
        }>, "many">;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        lineStart: number;
        lineEnd: number;
        accounts: {
            name: string;
            isMut: boolean;
            isSigner: boolean;
            isPda: boolean;
            seeds?: string[] | undefined;
        }[];
    }, {
        name: string;
        description: string;
        lineStart: number;
        lineEnd: number;
        accounts: {
            name: string;
            isMut: boolean;
            isSigner: boolean;
            isPda: boolean;
            seeds?: string[] | undefined;
        }[];
    }>, "many">;
    accounts: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        lineStart: z.ZodNumber;
        lineEnd: z.ZodNumber;
        fields: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodString;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            name: string;
            description: string;
            type: string;
        }, {
            name: string;
            description: string;
            type: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        lineStart: number;
        lineEnd: number;
        fields: {
            name: string;
            description: string;
            type: string;
        }[];
    }, {
        name: string;
        lineStart: number;
        lineEnd: number;
        fields: {
            name: string;
            description: string;
            type: string;
        }[];
    }>, "many">;
    cpiCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
        program: z.ZodString;
        instruction: z.ZodString;
        line: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        instruction: string;
        program: string;
        line: number;
    }, {
        instruction: string;
        program: string;
        line: number;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    accounts: {
        name: string;
        lineStart: number;
        lineEnd: number;
        fields: {
            name: string;
            description: string;
            type: string;
        }[];
    }[];
    flow: {
        id: string;
        description: string;
        title: string;
        lineRange?: [number, number] | undefined;
        concepts?: string[] | undefined;
    }[];
    instructions: {
        name: string;
        description: string;
        lineStart: number;
        lineEnd: number;
        accounts: {
            name: string;
            isMut: boolean;
            isSigner: boolean;
            isPda: boolean;
            seeds?: string[] | undefined;
        }[];
    }[];
    cpiCalls?: {
        instruction: string;
        program: string;
        line: number;
    }[] | undefined;
}, {
    accounts: {
        name: string;
        lineStart: number;
        lineEnd: number;
        fields: {
            name: string;
            description: string;
            type: string;
        }[];
    }[];
    instructions: {
        name: string;
        description: string;
        lineStart: number;
        lineEnd: number;
        accounts: {
            name: string;
            isMut: boolean;
            isSigner: boolean;
            isPda: boolean;
            seeds?: string[] | undefined;
        }[];
    }[];
    flow?: {
        id: string;
        description: string;
        title: string;
        lineRange?: [number, number] | undefined;
        concepts?: string[] | undefined;
    }[] | undefined;
    cpiCalls?: {
        instruction: string;
        program: string;
        line: number;
    }[] | undefined;
}>;
export type AccountInfo = z.infer<typeof AccountInfoSchema>;
export type Instruction = z.infer<typeof InstructionSchema>;
export type AccountField = z.infer<typeof AccountFieldSchema>;
export type AccountDefinition = z.infer<typeof AccountDefinitionSchema>;
export type CpiCall = z.infer<typeof CpiCallSchema>;
export type FlowStep = z.infer<typeof FlowStepSchema>;
export type ProgramMap = z.infer<typeof ProgramMapSchema>;
//# sourceMappingURL=program-map.d.ts.map