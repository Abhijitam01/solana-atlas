"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionResultSchema = exports.ExecutionRequestSchema = exports.PrecomputedStateSchema = exports.ExecutionScenarioSchema = exports.AccountStateAfterSchema = exports.AccountStateSchema = void 0;
const zod_1 = require("zod");
exports.AccountStateSchema = zod_1.z.object({
    address: zod_1.z.string(),
    label: zod_1.z.string(),
    owner: zod_1.z.string(),
    lamports: zod_1.z.number(),
    dataSize: zod_1.z.number(),
    data: zod_1.z.record(zod_1.z.unknown()).optional(),
});
exports.AccountStateAfterSchema = exports.AccountStateSchema.extend({
    changes: zod_1.z.array(zod_1.z.string()),
});
exports.ExecutionScenarioSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    instruction: zod_1.z.string(),
    args: zod_1.z.array(zod_1.z.unknown()).optional(),
    accountsBefore: zod_1.z.array(exports.AccountStateSchema),
    accountsAfter: zod_1.z.array(exports.AccountStateAfterSchema),
    logs: zod_1.z.array(zod_1.z.string()),
    computeUnits: zod_1.z.number(),
});
exports.PrecomputedStateSchema = zod_1.z.object({
    scenarios: zod_1.z.array(exports.ExecutionScenarioSchema),
});
exports.ExecutionRequestSchema = zod_1.z.object({
    templateId: zod_1.z.string(),
    scenario: zod_1.z.string(),
    instruction: zod_1.z.string(),
    args: zod_1.z.array(zod_1.z.unknown()).optional(),
});
exports.ExecutionResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    scenario: zod_1.z.string(),
    accountsBefore: zod_1.z.array(exports.AccountStateSchema),
    accountsAfter: zod_1.z.array(exports.AccountStateAfterSchema),
    logs: zod_1.z.array(zod_1.z.string()),
    computeUnits: zod_1.z.number(),
    trace: zod_1.z
        .array(zod_1.z.object({
        program: zod_1.z.string(),
        depth: zod_1.z.number(),
        status: zod_1.z.enum(["invoke", "success", "failed"]),
        logs: zod_1.z.array(zod_1.z.string()),
    }))
        .default([]),
    error: zod_1.z.string().optional(),
});
