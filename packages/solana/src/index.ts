import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { z } from "zod";
import type { Template } from "@solana-playground/types";
import {
  TemplateMetadataSchema,
  LineExplanationSchema,
  ProgramMapSchema,
  PrecomputedStateSchema,
  FunctionSpecSchema,
} from "@solana-playground/types";

const getTemplatesDir = () => {
  // If running in Next.js dev server (apps/web context)
  if (process.cwd().includes("apps/web") || process.cwd().includes("apps\\web")) {
    return join(process.cwd(), "../../packages/solana/templates");
  }

  // If __dirname is defined (compiled TS or Node context)
  if (typeof __dirname !== "undefined") {
    // Check if we are in dist/solana/src (compiled package)
    if (__dirname.includes("dist")) {
      return join(__dirname, "../../../templates");
    }
    // Check if we are in src (source package)
    return join(__dirname, "../templates");
  }

  // Fallback for Vercel / standalone build where CWD is root
  return join(process.cwd(), "packages/solana/templates");
};

const TEMPLATES_DIR = getTemplatesDir();

async function readJSON<T>(path: string): Promise<T> {
  try {
    const content = await readFile(path, "utf-8");
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error(`Failed to read JSON file at ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function loadTemplate(id: string): Promise<Template> {
  if (!id || typeof id !== "string") {
    throw new Error("Template ID must be a non-empty string");
  }

  // Sanitize template ID to prevent path traversal
  if (id.includes("..") || id.includes("/") || id.includes("\\")) {
    throw new Error("Invalid template ID");
  }

  const basePath = join(TEMPLATES_DIR, id);

  try {
    const [code, metadata, explanations, programMap, precomputedState, functionSpecs] =
      await Promise.all([
        readFile(join(basePath, "program/lib.rs"), "utf-8").catch((err) => {
          throw new Error(`Failed to read program code: ${err instanceof Error ? err.message : String(err)}`);
        }),
        readJSON(join(basePath, "metadata.json"))
          .then((data) => TemplateMetadataSchema.parse(data))
          .catch((err) => {
            throw new Error(`Invalid metadata: ${err instanceof Error ? err.message : String(err)}`);
          }),
        readJSON(join(basePath, "line-explanations.json"))
          .then((data) => z.array(LineExplanationSchema).parse(data))
          .catch((err) => {
            throw new Error(`Invalid explanations: ${err instanceof Error ? err.message : String(err)}`);
          }),
        readJSON(join(basePath, "program-map.json"))
          .then((data) => ProgramMapSchema.parse(data))
          .catch((err) => {
            throw new Error(`Invalid program map: ${err instanceof Error ? err.message : String(err)}`);
          }),
        readJSON(join(basePath, "precomputed-state.json"))
          .then((data) => PrecomputedStateSchema.parse(data))
          .catch((err) => {
            throw new Error(`Invalid precomputed state: ${err instanceof Error ? err.message : String(err)}`);
          }),
        readJSON(join(basePath, "function-specs.json"))
          .then((data) => z.array(FunctionSpecSchema).parse(data))
          .catch((err) => {
            if (err instanceof Error && err.message.includes("ENOENT")) {
              return [];
            }
            throw new Error(`Invalid function specs: ${err instanceof Error ? err.message : String(err)}`);
          }),
      ]);

    // Enforce 100% explanation coverage for non-empty lines
    const codeLines = code.split("\n");
    const explainedLines = new Set(explanations.map((entry) => entry.line));
    const missingLines = codeLines
      .map((line, idx) => ({ line, number: idx + 1 }))
      .filter(({ line }) => line.trim().length > 0)
      .filter(({ number }) => !explainedLines.has(number))
      .map(({ number }) => number);

    if (missingLines.length > 0) {
      throw new Error(
        `Template "${id}" is missing line explanations for lines: ${missingLines.join(", ")}`
      );
    }

    return {
      id,
      code,
      metadata,
      explanations,
      programMap,
      functionSpecs,
      precomputedState,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      throw new Error(`Template "${id}" not found at ${basePath} (CWD: ${process.cwd()}, __dirname: ${typeof __dirname !== 'undefined' ? __dirname : 'undefined'})`);
    }
    throw error;
  }
}

export async function listTemplates(): Promise<string[]> {
  try {
    const entries = await readdir(TEMPLATES_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    throw new Error(`Failed to list templates: ${error instanceof Error ? error.message : String(error)}`);
  }
}
