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

const templates = readdirSync(templatesDir).filter((entry) =>
  existsSync(join(templatesDir, entry, "metadata.json"))
);

const health = templates.map((id) => {
  const base = join(templatesDir, id);
  const codePath = join(base, "program/lib.rs");
  const metadataPath = join(base, "metadata.json");
  const explanationsPath = join(base, "line-explanations.json");
  const programMapPath = join(base, "program-map.json");
  const precomputedPath = join(base, "precomputed-state.json");

  let totalLines = 0;
  let explainedLines = 0;
  let missingLines = 0;

  if (existsSync(codePath) && existsSync(explanationsPath)) {
    const code = readFileSync(codePath, "utf-8");
    const nonEmpty = getNonEmptyLines(code);
    totalLines = nonEmpty.length;
    const explanations = readJSON(explanationsPath);
    const explained = new Set(explanations.map((e) => e.line));
    explainedLines = explained.size;
    missingLines = nonEmpty.filter((entry) => !explained.has(entry.number)).length;
  }

  const metadata = existsSync(metadataPath) ? readJSON(metadataPath) : null;

  return {
    templateId: id,
    metadata,
    lineCoverage: { totalLines, explainedLines, missingLines },
    hasProgramMap: existsSync(programMapPath),
    hasPrecomputedState: existsSync(precomputedPath),
  };
});

console.log(JSON.stringify(health, null, 2));
