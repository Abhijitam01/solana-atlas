"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineExplanationSchema = void 0;
const zod_1 = require("zod");
exports.LineExplanationSchema = zod_1.z.object({
    lineNumber: zod_1.z.number(),
    what: zod_1.z.string(),
    why: zod_1.z.string(),
    solanaConcept: zod_1.z.string().optional(),
    rustConcept: zod_1.z.string().optional(),
    whatBreaksIfRemoved: zod_1.z.string().optional(),
    isImportant: zod_1.z.boolean().default(false),
    relatedLines: zod_1.z.array(zod_1.z.number()).optional(),
});
