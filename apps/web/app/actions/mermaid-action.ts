"use server";

import { getGroqClient, GROQ_MODELS } from "@/lib/groq";

const MERMAID_SYSTEM_PROMPT = `You are a Solana program architecture visualizer. You generate valid Mermaid flowchart definitions from Solana/Anchor Rust code.

CRITICAL SYNTAX RULES — you MUST follow these exactly:
1. Start with: flowchart TD
2. Subgraphs use "end" keyword, NOT curly braces:
   subgraph Title
     nodeA --> nodeB
   end
3. Node IDs must be simple alphanumeric (no spaces, no dots, no special chars): initialize, update, myAccount
4. Labels with spaces or special chars must be in square brackets: initialize["Initialize Account"]
5. Arrow types: --> for flow, -.-> for optional, ==> for important
6. Do NOT use parentheses () in labels, use square brackets [] instead
7. Do NOT use colons : in node IDs
8. Do NOT use quotes in node IDs, only in labels inside brackets
9. Each line should have exactly one statement (one arrow or one node definition)
10. Keep it simple — max 15-20 nodes

Example of CORRECT syntax:
flowchart TD
  subgraph Instructions
    init["Initialize"]
    transfer["Transfer Tokens"]
  end
  subgraph Accounts
    user["User Account"]
    token["Token Account"]
  end
  init ==> user
  init --> token
  transfer --> user
  transfer --> token

Return ONLY the raw Mermaid definition. No markdown code blocks, no backticks, no explanations.`;

export async function generateMermaidDiagram(code: string): Promise<string> {
  if (!code || code.trim().length === 0) {
    throw new Error("No code provided");
  }

  const client = getGroqClient();

  const response = await client.chat.completions.create({
    model: GROQ_MODELS.VERSATILE,
    messages: [
      { role: "system", content: MERMAID_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Generate a Mermaid flowchart for this Solana Anchor program. Follow the syntax rules exactly.\n\n\`\`\`rust\n${code}\n\`\`\`\n\nReturn ONLY valid Mermaid syntax. No markdown, no code blocks.`,
      },
    ],
    max_tokens: 1500,
    temperature: 0.2,
  });

  let text = response.choices[0]?.message?.content?.trim() || "";

  // Clean up - remove markdown code block wrappers if present
  if (text.startsWith("```mermaid")) {
    text = text.replace(/```mermaid\n?/g, "").replace(/```\n?$/g, "");
  } else if (text.startsWith("```")) {
    text = text.replace(/^```\w*\n?/g, "").replace(/```\n?$/g, "");
  }

  // Sanitize common AI mistakes in Mermaid syntax
  text = sanitizeMermaidSyntax(text.trim());

  return text;
}

/**
 * Fix common Mermaid syntax mistakes that LLMs tend to make
 */
function sanitizeMermaidSyntax(input: string): string {
  let lines = input.split("\n");
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line === undefined) continue;

    // Skip empty lines
    if (!line.trim()) {
      result.push(line);
      continue;
    }

    // Fix: subgraph with curly braces → proper syntax
    // "subgraph Title {" → "subgraph Title"
    if (/^\s*subgraph\s+/.test(line) && line.trim().endsWith("{")) {
      line = line.replace(/\s*\{\s*$/, "");
    }

    // Fix: closing curly brace → "end"
    if (line.trim() === "}") {
      line = line.replace("}", "end");
    }

    // Fix: Remove parentheses in labels, replace with square brackets
    // node("Label") → node["Label"]
    line = line.replace(/(\w+)\(\"([^"]*)\"\)/g, '$1["$2"]');
    line = line.replace(/(\w+)\('([^']*)'\)/g, '$1["$2"]');

    // Fix: Remove colons from node IDs (e.g., module:name → module_name)
    // But don't touch the "subgraph" or "flowchart" directives
    if (!/^\s*(subgraph|flowchart|graph|end)/.test(line)) {
      // Replace colons in node IDs (before arrows)
      line = line.replace(/(\w+):(\w+)/g, "$1_$2");
    }

    // Fix: Handle "style" lines with problematic syntax — just remove them
    if (/^\s*style\s+/.test(line)) {
      continue; // Skip style directives as they often cause errors
    }

    // Fix: Handle "classDef" lines — skip as they can cause issues
    if (/^\s*classDef\s+/.test(line)) {
      continue;
    }

    // Fix: Handle lines with ":::" class references — strip them
    line = line.replace(/:::\w+/g, "");

    result.push(line);
  }

  return result.join("\n");
}
