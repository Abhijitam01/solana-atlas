#!/usr/bin/env node
const { readdir, readFile, writeFile, stat, access } = require('fs/promises');
const { join } = require('path');

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function buildChecklist(metadata) {
  const tasks = [];
  const name = metadata.name || "this program";
  const learningGoals = Array.isArray(metadata.learningGoals)
    ? metadata.learningGoals.filter((goal) => typeof goal === "string" && goal.trim().length > 0)
    : [];

  if (learningGoals.length >= 1) {
    tasks.push(`Review the learning goal: ${learningGoals[0]}.`);
  } else if (metadata.description) {
    tasks.push(`Understand the behavior described in the metadata: ${metadata.description}`);
  } else {
    tasks.push(`Familiarize yourself with ${name}.`);
  }

  if (learningGoals.length >= 2) {
    tasks.push(`Try to achieve: ${learningGoals[1]}.`);
  }

  tasks.push(`Implement the core logic for ${name}.`);
  tasks.push("Run `anchor test` (or `cargo test`) to ensure the program compiles and passes tests.");
  tasks.push("Deploy or simulate on Devnet/local validator to verify runtime behavior.");

  return tasks;
}

async function main() {
  const templatesDir = join(__dirname, "..", "packages", "solana", "templates");
  const entries = await readdir(templatesDir, { withFileTypes: true });
  let created = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const templateDir = join(templatesDir, entry.name);
    const metadataPath = join(templateDir, "metadata.json");
    const checklistPath = join(templateDir, "checklist.json");

    if (!(await fileExists(metadataPath))) {
      console.warn(`Skipping ${entry.name}: metadata.json missing`);
      continue;
    }

    if (await fileExists(checklistPath)) {
      console.log(`Skipping ${entry.name}: checklist already exists`);
      continue;
    }

    const metadataRaw = await readFile(metadataPath, "utf-8");
    let metadata;
    try {
      metadata = JSON.parse(metadataRaw);
    } catch (error) {
      console.warn(`Skipping ${entry.name}: invalid metadata.json`);
      continue;
    }

    const checklist = buildChecklist(metadata);
    await writeFile(checklistPath, JSON.stringify(checklist, null, 2) + "\n");
    console.log(`Created checklist for ${entry.name}`);
    created++;
  }

  console.log(`Generated ${created} checklist${created === 1 ? "" : "s"}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
