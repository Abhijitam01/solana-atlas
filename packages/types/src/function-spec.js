"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionSpecSchema = void 0;
const zod_1 = require("zod");
exports.FunctionSpecSchema = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    lineRange: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]),
    does: zod_1.z.string(),
    why: zod_1.z.string(),
    breaksIfRemoved: zod_1.z.string(),
    concepts: zod_1.z.array(zod_1.z.string()),
    securityImplications: zod_1.z.string().optional(),
});
