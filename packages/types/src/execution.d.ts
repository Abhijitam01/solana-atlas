import { z } from "zod";
export declare const AccountStateSchema: z.ZodObject<{
    address: z.ZodString;
    label: z.ZodString;
    owner: z.ZodString;
    lamports: z.ZodNumber;
    dataSize: z.ZodNumber;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    address: string;
    label: string;
    owner: string;
    lamports: number;
    dataSize: number;
    data?: Record<string, unknown> | undefined;
}, {
    address: string;
    label: string;
    owner: string;
    lamports: number;
    dataSize: number;
    data?: Record<string, unknown> | undefined;
}>;
export declare const AccountStateAfterSchema: z.ZodObject<{
    address: z.ZodString;
    label: z.ZodString;
    owner: z.ZodString;
    lamports: z.ZodNumber;
    dataSize: z.ZodNumber;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
} & {
    changes: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    address: string;
    label: string;
    owner: string;
    lamports: number;
    dataSize: number;
    changes: string[];
    data?: Record<string, unknown> | undefined;
}, {
    address: string;
    label: string;
    owner: string;
    lamports: number;
    dataSize: number;
    changes: string[];
    data?: Record<string, unknown> | undefined;
}>;
export declare const ExecutionScenarioSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    instruction: z.ZodString;
    args: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
    accountsBefore: z.ZodArray<z.ZodObject<{
        address: z.ZodString;
        label: z.ZodString;
        owner: z.ZodString;
        lamports: z.ZodNumber;
        dataSize: z.ZodNumber;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        data?: Record<string, unknown> | undefined;
    }, {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        data?: Record<string, unknown> | undefined;
    }>, "many">;
    accountsAfter: z.ZodArray<z.ZodObject<{
        address: z.ZodString;
        label: z.ZodString;
        owner: z.ZodString;
        lamports: z.ZodNumber;
        dataSize: z.ZodNumber;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    } & {
        changes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        changes: string[];
        data?: Record<string, unknown> | undefined;
    }, {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        changes: string[];
        data?: Record<string, unknown> | undefined;
    }>, "many">;
    logs: z.ZodArray<z.ZodString, "many">;
    computeUnits: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    instruction: string;
    accountsBefore: {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        data?: Record<string, unknown> | undefined;
    }[];
    accountsAfter: {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        changes: string[];
        data?: Record<string, unknown> | undefined;
    }[];
    logs: string[];
    computeUnits: number;
    args?: unknown[] | undefined;
}, {
    name: string;
    description: string;
    instruction: string;
    accountsBefore: {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        data?: Record<string, unknown> | undefined;
    }[];
    accountsAfter: {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        changes: string[];
        data?: Record<string, unknown> | undefined;
    }[];
    logs: string[];
    computeUnits: number;
    args?: unknown[] | undefined;
}>;
export declare const PrecomputedStateSchema: z.ZodObject<{
    scenarios: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        instruction: z.ZodString;
        args: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
        accountsBefore: z.ZodArray<z.ZodObject<{
            address: z.ZodString;
            label: z.ZodString;
            owner: z.ZodString;
            lamports: z.ZodNumber;
            dataSize: z.ZodNumber;
            data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        }, "strip", z.ZodTypeAny, {
            address: string;
            label: string;
            owner: string;
            lamports: number;
            dataSize: number;
            data?: Record<string, unknown> | undefined;
        }, {
            address: string;
            label: string;
            owner: string;
            lamports: number;
            dataSize: number;
            data?: Record<string, unknown> | undefined;
        }>, "many">;
        accountsAfter: z.ZodArray<z.ZodObject<{
            address: z.ZodString;
            label: z.ZodString;
            owner: z.ZodString;
            lamports: z.ZodNumber;
            dataSize: z.ZodNumber;
            data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        } & {
            changes: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            address: string;
            label: string;
            owner: string;
            lamports: number;
            dataSize: number;
            changes: string[];
            data?: Record<string, unknown> | undefined;
        }, {
            address: string;
            label: string;
            owner: string;
            lamports: number;
            dataSize: number;
            changes: string[];
            data?: Record<string, unknown> | undefined;
        }>, "many">;
        logs: z.ZodArray<z.ZodString, "many">;
        computeUnits: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        instruction: string;
        accountsBefore: {
            address: string;
            label: string;
            owner: string;
            lamports: number;
            dataSize: number;
            data?: Record<string, unknown> | undefined;
        }[];
        accountsAfter: {
            address: string;
            label: string;
            owner: string;
            lamports: number;
            dataSize: number;
            changes: string[];
            data?: Record<string, unknown> | undefined;
        }[];
        logs: string[];
        computeUnits: number;
        args?: unknown[] | undefined;
    }, {
        name: string;
        description: string;
        instruction: string;
        accountsBefore: {
            address: string;
            label: string;
            owner: string;
            lamports: number;
            dataSize: number;
            data?: Record<string, unknown> | undefined;
        }[];
        accountsAfter: {
            address: string;
            label: string;
            owner: string;
            lamports: number;
            dataSize: number;
            changes: string[];
            data?: Record<string, unknown> | undefined;
        }[];
        logs: string[];
        computeUnits: number;
        args?: unknown[] | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    scenarios: {
        name: string;
        description: string;
        instruction: string;
        accountsBefore: {
            address: string;
            label: string;
            owner: string;
            lamports: number;
            dataSize: number;
            data?: Record<string, unknown> | undefined;
        }[];
        accountsAfter: {
            address: string;
            label: string;
            owner: string;
            lamports: number;
            dataSize: number;
            changes: string[];
            data?: Record<string, unknown> | undefined;
        }[];
        logs: string[];
        computeUnits: number;
        args?: unknown[] | undefined;
    }[];
}, {
    scenarios: {
        name: string;
        description: string;
        instruction: string;
        accountsBefore: {
            address: string;
            label: string;
            owner: string;
            lamports: number;
            dataSize: number;
            data?: Record<string, unknown> | undefined;
        }[];
        accountsAfter: {
            address: string;
            label: string;
            owner: string;
            lamports: number;
            dataSize: number;
            changes: string[];
            data?: Record<string, unknown> | undefined;
        }[];
        logs: string[];
        computeUnits: number;
        args?: unknown[] | undefined;
    }[];
}>;
export type AccountState = z.infer<typeof AccountStateSchema>;
export type AccountStateAfter = z.infer<typeof AccountStateAfterSchema>;
export type ExecutionScenario = z.infer<typeof ExecutionScenarioSchema>;
export type PrecomputedState = z.infer<typeof PrecomputedStateSchema>;
export declare const ExecutionRequestSchema: z.ZodObject<{
    templateId: z.ZodString;
    scenario: z.ZodString;
    instruction: z.ZodString;
    args: z.ZodOptional<z.ZodArray<z.ZodUnknown, "many">>;
}, "strip", z.ZodTypeAny, {
    instruction: string;
    templateId: string;
    scenario: string;
    args?: unknown[] | undefined;
}, {
    instruction: string;
    templateId: string;
    scenario: string;
    args?: unknown[] | undefined;
}>;
export declare const ExecutionResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    scenario: z.ZodString;
    accountsBefore: z.ZodArray<z.ZodObject<{
        address: z.ZodString;
        label: z.ZodString;
        owner: z.ZodString;
        lamports: z.ZodNumber;
        dataSize: z.ZodNumber;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        data?: Record<string, unknown> | undefined;
    }, {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        data?: Record<string, unknown> | undefined;
    }>, "many">;
    accountsAfter: z.ZodArray<z.ZodObject<{
        address: z.ZodString;
        label: z.ZodString;
        owner: z.ZodString;
        lamports: z.ZodNumber;
        dataSize: z.ZodNumber;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    } & {
        changes: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        changes: string[];
        data?: Record<string, unknown> | undefined;
    }, {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        changes: string[];
        data?: Record<string, unknown> | undefined;
    }>, "many">;
    logs: z.ZodArray<z.ZodString, "many">;
    computeUnits: z.ZodNumber;
    trace: z.ZodDefault<z.ZodArray<z.ZodObject<{
        program: z.ZodString;
        depth: z.ZodNumber;
        status: z.ZodEnum<["invoke", "success", "failed"]>;
        logs: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        status: "success" | "invoke" | "failed";
        logs: string[];
        program: string;
        depth: number;
    }, {
        status: "success" | "invoke" | "failed";
        logs: string[];
        program: string;
        depth: number;
    }>, "many">>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    accountsBefore: {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        data?: Record<string, unknown> | undefined;
    }[];
    accountsAfter: {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        changes: string[];
        data?: Record<string, unknown> | undefined;
    }[];
    logs: string[];
    computeUnits: number;
    scenario: string;
    success: boolean;
    trace: {
        status: "success" | "invoke" | "failed";
        logs: string[];
        program: string;
        depth: number;
    }[];
    error?: string | undefined;
}, {
    accountsBefore: {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        data?: Record<string, unknown> | undefined;
    }[];
    accountsAfter: {
        address: string;
        label: string;
        owner: string;
        lamports: number;
        dataSize: number;
        changes: string[];
        data?: Record<string, unknown> | undefined;
    }[];
    logs: string[];
    computeUnits: number;
    scenario: string;
    success: boolean;
    trace?: {
        status: "success" | "invoke" | "failed";
        logs: string[];
        program: string;
        depth: number;
    }[] | undefined;
    error?: string | undefined;
}>;
export type ExecutionRequest = z.infer<typeof ExecutionRequestSchema>;
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;
//# sourceMappingURL=execution.d.ts.map