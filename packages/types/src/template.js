"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateMetadataSchema = void 0;
const zod_1 = require("zod");
exports.TemplateMetadataSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    difficulty: zod_1.z.enum(["beginner", "intermediate"]),
    learningGoals: zod_1.z.array(zod_1.z.string()),
    solanaConcepts: zod_1.z.array(zod_1.z.string()),
    estimatedTime: zod_1.z.string(),
    prerequisites: zod_1.z.array(zod_1.z.string()).optional(),
});
