"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramMapSchema = exports.FlowStepSchema = exports.CpiCallSchema = exports.AccountDefinitionSchema = exports.AccountFieldSchema = exports.InstructionSchema = exports.AccountInfoSchema = void 0;
const zod_1 = require("zod");
exports.AccountInfoSchema = zod_1.z.object({
    name: zod_1.z.string(),
    isMut: zod_1.z.boolean(),
    isSigner: zod_1.z.boolean(),
    isPda: zod_1.z.boolean(),
    seeds: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.InstructionSchema = zod_1.z.object({
    name: zod_1.z.string(),
    lineStart: zod_1.z.number(),
    lineEnd: zod_1.z.number(),
    accounts: zod_1.z.array(exports.AccountInfoSchema),
    description: zod_1.z.string(),
});
exports.AccountFieldSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.string(),
    description: zod_1.z.string(),
});
exports.AccountDefinitionSchema = zod_1.z.object({
    name: zod_1.z.string(),
    lineStart: zod_1.z.number(),
    lineEnd: zod_1.z.number(),
    fields: zod_1.z.array(exports.AccountFieldSchema),
});
exports.CpiCallSchema = zod_1.z.object({
    program: zod_1.z.string(),
    instruction: zod_1.z.string(),
    line: zod_1.z.number(),
});
exports.FlowStepSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    lineRange: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]).optional(),
    concepts: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.ProgramMapSchema = zod_1.z.object({
    flow: zod_1.z.array(exports.FlowStepSchema).optional().default([]),
    instructions: zod_1.z.array(exports.InstructionSchema),
    accounts: zod_1.z.array(exports.AccountDefinitionSchema),
    cpiCalls: zod_1.z.array(exports.CpiCallSchema).optional(),
});
