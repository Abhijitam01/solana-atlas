"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTemplate = loadTemplate;
exports.listTemplates = listTemplates;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const zod_1 = require("zod");
const types_1 = require("@solana-playground/types");
const getTemplatesDir = () => {
    if (typeof __dirname !== "undefined") {
        return (0, path_1.join)(__dirname, "../templates");
    }
    // Fallback for build output
    return (0, path_1.join)(process.cwd(), "packages/solana/templates");
};
const TEMPLATES_DIR = getTemplatesDir();
async function readJSON(path) {
    try {
        const content = await (0, promises_1.readFile)(path, "utf-8");
        return JSON.parse(content);
    }
    catch (error) {
        throw new Error(`Failed to read JSON file at ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
}
async function loadTemplate(id) {
    if (!id || typeof id !== "string") {
        throw new Error("Template ID must be a non-empty string");
    }
    // Sanitize template ID to prevent path traversal
    if (id.includes("..") || id.includes("/") || id.includes("\\")) {
        throw new Error("Invalid template ID");
    }
    const basePath = (0, path_1.join)(TEMPLATES_DIR, id);
    try {
        const [code, metadata, explanations, programMap, precomputedState, functionSpecs] = await Promise.all([
            (0, promises_1.readFile)((0, path_1.join)(basePath, "program/lib.rs"), "utf-8").catch((err) => {
                throw new Error(`Failed to read program code: ${err instanceof Error ? err.message : String(err)}`);
            }),
            readJSON((0, path_1.join)(basePath, "metadata.json"))
                .then((data) => types_1.TemplateMetadataSchema.parse(data))
                .catch((err) => {
                throw new Error(`Invalid metadata: ${err instanceof Error ? err.message : String(err)}`);
            }),
            readJSON((0, path_1.join)(basePath, "explanations.json"))
                .then((data) => zod_1.z.array(types_1.LineExplanationSchema).parse(data))
                .catch((err) => {
                throw new Error(`Invalid explanations: ${err instanceof Error ? err.message : String(err)}`);
            }),
            readJSON((0, path_1.join)(basePath, "program-map.json"))
                .then((data) => types_1.ProgramMapSchema.parse(data))
                .catch((err) => {
                throw new Error(`Invalid program map: ${err instanceof Error ? err.message : String(err)}`);
            }),
            readJSON((0, path_1.join)(basePath, "precomputed-state.json"))
                .then((data) => types_1.PrecomputedStateSchema.parse(data))
                .catch((err) => {
                throw new Error(`Invalid precomputed state: ${err instanceof Error ? err.message : String(err)}`);
            }),
            readJSON((0, path_1.join)(basePath, "function-specs.json"))
                .then((data) => zod_1.z.array(types_1.FunctionSpecSchema).parse(data))
                .catch((err) => {
                if (err instanceof Error && err.message.includes("ENOENT")) {
                    return [];
                }
                throw new Error(`Invalid function specs: ${err instanceof Error ? err.message : String(err)}`);
            }),
        ]);
        return {
            id,
            code,
            metadata,
            explanations,
            programMap,
            functionSpecs,
            precomputedState,
        };
    }
    catch (error) {
        if (error instanceof Error && error.message.includes("ENOENT")) {
            throw new Error(`Template "${id}" not found`);
        }
        throw error;
    }
}
async function listTemplates() {
    try {
        const entries = await (0, promises_1.readdir)(TEMPLATES_DIR, { withFileTypes: true });
        return entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
            .sort();
    }
    catch (error) {
        throw new Error(`Failed to list templates: ${error instanceof Error ? error.message : String(error)}`);
    }
}
