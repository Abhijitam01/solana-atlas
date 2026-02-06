const { readFileSync, readdirSync, existsSync } = require("fs");
const { join } = require("path");

const repoRoot = process.cwd();
const templatesDir = join(repoRoot, "packages/solana/templates");

const readJSON = (path) => {
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw);
};

const getNonEmptyLines = (code) =>
  code
    .split("\n")
    .map((line, idx) => ({ line, number: idx + 1 }))
    .filter(({ line }) => line.trim().length > 0);

const checkTemplate = (templateId) => {
  const issues = [];
  const base = join(templatesDir, templateId);
  const codePath = join(base, "program/lib.rs");
  const metadataPath = join(base, "metadata.json");
  const explanationsPath = join(base, "line-explanations.json");

  if (!existsSync(codePath)) {
    issues.push("Missing program/lib.rs");
  }
  if (!existsSync(metadataPath)) {
    issues.push("Missing metadata.json");
  }
  if (!existsSync(explanationsPath)) {
    issues.push("Missing line-explanations.json");
  }

  let totalLines = 0;
  let explainedLines = 0;
  let missingLines = [];

  if (existsSync(codePath) && existsSync(explanationsPath)) {
    const code = readFileSync(codePath, "utf-8");
    const nonEmpty = getNonEmptyLines(code);
    totalLines = nonEmpty.length;
    const explanations = readJSON(explanationsPath);
    const explained = new Set(explanations.map((e) => e.line));
    explainedLines = explained.size;
    missingLines = nonEmpty
      .map((entry) => entry.number)
      .filter((num) => !explained.has(num));

    if (missingLines.length > 0) {
      issues.push(`Missing explanations for lines: ${missingLines.join(", ")}`);
    }
  }

  return {
    templateId,
    ok: issues.length === 0,
    issues,
    stats: {
      totalLines,
      explainedLines,
      missingLines: missingLines.length,
    },
  };
};

const templates = readdirSync(templatesDir).filter((entry) =>
  existsSync(join(templatesDir, entry, "metadata.json"))
);

const results = templates.map(checkTemplate);
const failed = results.filter((r) => !r.ok);

for (const result of results) {
  const status = result.ok ? "OK" : "FAIL";
  console.log(`[${status}] ${result.templateId} (lines: ${result.stats.explainedLines}/${result.stats.totalLines})`);
  if (!result.ok) {
    for (const issue of result.issues) {
      console.log(`  - ${issue}`);
    }
  }
}

if (failed.length > 0) {
  console.error(`\nTemplate health check failed: ${failed.length} templates with issues.`);
  process.exit(1);
}

console.log("\nTemplate health check passed.");
