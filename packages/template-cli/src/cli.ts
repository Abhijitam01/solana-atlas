#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile, stat } from "fs/promises";
import { existsSync } from "fs";
import { join, resolve } from "path";
import { randomBytes } from "crypto";
import bs58 from "bs58";
import { z } from "zod";
import {
  TemplateMetadataSchema,
  LineExplanationSchema,
  ProgramMapSchema,
  PrecomputedStateSchema,
  FunctionSpecSchema,
} from "@solana-playground/types";

const HELP = `\nSolana Playground Template CLI\n\nUsage:\n  solana-template init <templateId> [--name "..."] [--description "..."] [--difficulty beginner|intermediate]\n  solana-template validate [templateId]\n  solana-template preview <templateId>\n\nOptions:\n  --root <path>   Repo root (defaults to cwd)\n  --help          Show this help\n`;

const argv = process.argv.slice(2);

function getOption(name: string): string | undefined {
  const idx = argv.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return argv[idx + 1];
}

function getRootDir(): string {
  const root = getOption("root");
  return resolve(root ?? process.cwd());
}

function getTemplatesDir(rootDir: string): string {
  return join(rootDir, "packages/solana/templates");
}

function sanitizeId(templateId: string): string {
  if (!templateId || typeof templateId !== "string") {
    throw new Error("Template ID is required");
  }
  if (templateId.includes("/") || templateId.includes("\\") || templateId.includes("..")) {
    throw new Error("Template ID cannot contain path separators");
  }
  return templateId;
}

async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

function createProgramId(): string {
  return bs58.encode(randomBytes(32));
}

function toProgramName(templateId: string): string {
  return templateId.replace(/-/g, "_");
}

async function initTemplate(templateId: string): Promise<void> {
  const rootDir = getRootDir();
  const templatesDir = getTemplatesDir(rootDir);
  const id = sanitizeId(templateId);
  const templateDir = join(templatesDir, id);

  if (existsSync(templateDir)) {
    throw new Error(`Template "${id}" already exists at ${templateDir}`);
  }

  const name = getOption("name") ?? id.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
  const description = getOption("description") ?? "Describe what this template teaches.";
  const difficulty = (getOption("difficulty") ?? "beginner") as "beginner" | "intermediate";

  const programId = createProgramId();
  const programName = toProgramName(id);

  await ensureDir(join(templateDir, "program"));

  const libRs = `use anchor_lang::prelude::*;\n\ndeclare_id!("${programId}");\n\n#[program]\npub mod ${programName} {\n    use super::*;\n\n    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {\n        Ok(())\n    }\n}\n\n#[derive(Accounts)]\npub struct Initialize {}\n`;

  const metadata = {
    id,
    name,
    description,
    difficulty,
    learningGoals: ["Add your first learning goal"],
    solanaConcepts: ["Add a Solana concept"],
    estimatedTime: "10 minutes",
    prerequisites: [],
  };

  const programMap = {
    flow: [],
    instructions: [],
    accounts: [],
    cpiCalls: [],
  };

  const precomputedState = {
    scenarios: [],
  };

  await writeFile(join(templateDir, "program", "lib.rs"), libRs, "utf-8");
  await writeFile(join(templateDir, "metadata.json"), JSON.stringify(metadata, null, 2), "utf-8");
  await writeFile(join(templateDir, "line-explanations.json"), "[]\n", "utf-8");
  await writeFile(join(templateDir, "program-map.json"), JSON.stringify(programMap, null, 2), "utf-8");
  await writeFile(join(templateDir, "precomputed-state.json"), JSON.stringify(precomputedState, null, 2), "utf-8");
  await writeFile(join(templateDir, "function-specs.json"), "[]\n", "utf-8");

  console.log(`Created template "${id}" at ${templateDir}`);
}

async function readJSON(path: string): Promise<unknown> {
  const raw = await readFile(path, "utf-8");
  return JSON.parse(raw);
}

async function validateTemplate(templateId: string, rootDir: string): Promise<string[]> {
  const templatesDir = getTemplatesDir(rootDir);
  const id = sanitizeId(templateId);
  const basePath = join(templatesDir, id);
  const errors: string[] = [];

  const requiredFiles = [
    "metadata.json",
    "line-explanations.json",
    "program-map.json",
    "precomputed-state.json",
    "program/lib.rs",
  ];

  for (const file of requiredFiles) {
    const filePath = join(basePath, file);
    if (!existsSync(filePath)) {
      errors.push(`Missing required file: ${file}`);
    }
  }

  if (errors.length > 0) return errors;

  try {
    const metadata = TemplateMetadataSchema.parse(await readJSON(join(basePath, "metadata.json")));
    if (metadata.id !== id) {
      errors.push(`metadata.json id "${metadata.id}" does not match folder name "${id}"`);
    }
  } catch (error) {
    errors.push(`metadata.json invalid: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const explanations = await readJSON(join(basePath, "line-explanations.json"));
    z.array(LineExplanationSchema).parse(explanations);
  } catch (error) {
    errors.push(`line-explanations.json invalid: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const programMap = await readJSON(join(basePath, "program-map.json"));
    ProgramMapSchema.parse(programMap);
  } catch (error) {
    errors.push(`program-map.json invalid: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const precomputedState = await readJSON(join(basePath, "precomputed-state.json"));
    PrecomputedStateSchema.parse(precomputedState);
  } catch (error) {
    errors.push(`precomputed-state.json invalid: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (existsSync(join(basePath, "function-specs.json"))) {
    try {
      const specs = await readJSON(join(basePath, "function-specs.json"));
      z.array(FunctionSpecSchema).parse(specs);
    } catch (error) {
      errors.push(`function-specs.json invalid: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return errors;
}

async function validateAll(templateId?: string): Promise<void> {
  const rootDir = getRootDir();
  const templatesDir = getTemplatesDir(rootDir);

  const ids = templateId
    ? [sanitizeId(templateId)]
    : (await readdir(templatesDir, { withFileTypes: true }))
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();

  let hasErrors = false;

  for (const id of ids) {
    const errors = await validateTemplate(id, rootDir);
    if (errors.length === 0) {
      console.log(`✓ ${id}`);
      continue;
    }

    hasErrors = true;
    console.log(`✗ ${id}`);
    for (const error of errors) {
      console.log(`  - ${error}`);
    }
  }

  if (hasErrors) {
    process.exit(1);
  }
}

async function previewTemplate(templateId: string): Promise<void> {
  const rootDir = getRootDir();
  const templatesDir = getTemplatesDir(rootDir);
  const id = sanitizeId(templateId);
  const basePath = join(templatesDir, id);

  if (!existsSync(basePath)) {
    throw new Error(`Template "${id}" not found at ${basePath}`);
  }

  const metadata = TemplateMetadataSchema.parse(await readJSON(join(basePath, "metadata.json")));
  const explanations = z.array(LineExplanationSchema).parse(
    await readJSON(join(basePath, "line-explanations.json"))
  );
  const programMap = ProgramMapSchema.parse(await readJSON(join(basePath, "program-map.json")));
  const precomputed = PrecomputedStateSchema.parse(
    await readJSON(join(basePath, "precomputed-state.json"))
  );
  const functionSpecs = existsSync(join(basePath, "function-specs.json"))
    ? z.array(FunctionSpecSchema).parse(await readJSON(join(basePath, "function-specs.json")))
    : [];

  const libStat = await stat(join(basePath, "program", "lib.rs"));

  console.log(`\nTemplate: ${metadata.name} (${metadata.id})`);
  console.log(`Description: ${metadata.description}`);
  console.log(`Difficulty: ${metadata.difficulty}`);
  console.log(`Estimated time: ${metadata.estimatedTime}`);
  console.log(`Learning goals: ${metadata.learningGoals.length}`);
  console.log(`Solana concepts: ${metadata.solanaConcepts.length}`);
  console.log(`Program size: ${libStat.size} bytes`);
  console.log(`Explanations: ${explanations.length}`);
  console.log(`Function specs: ${functionSpecs.length}`);
  console.log(`Flow steps: ${programMap.flow?.length ?? 0}`);
  console.log(`Instructions: ${programMap.instructions.length}`);
  console.log(`Accounts: ${programMap.accounts.length}`);
  console.log(`Scenarios: ${precomputed.scenarios.length}`);
  console.log("");
}

async function main(): Promise<void> {
  const command = argv[0];

  if (!command || command === "--help" || command === "help") {
    console.log(HELP);
    return;
  }

  if (command === "init") {
    const templateId = argv[1];
    if (!templateId) {
      throw new Error("Template ID is required for init");
    }
    await initTemplate(templateId);
    return;
  }

  if (command === "validate") {
    const templateId = argv[1];
    await validateAll(templateId);
    return;
  }

  if (command === "preview") {
    const templateId = argv[1];
    if (!templateId) {
      throw new Error("Template ID is required for preview");
    }
    await previewTemplate(templateId);
    return;
  }

  console.log(HELP);
  process.exit(1);
}

main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
