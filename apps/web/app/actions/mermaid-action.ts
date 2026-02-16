"use server";

import { getGroqClient, GROQ_MODELS } from "@/lib/groq";

const MERMAID_SYSTEM_PROMPT = `You are a Solana program architecture visualizer. You generate Mermaid diagram definitions from Solana/Anchor Rust code.

Rules:
- Return ONLY the raw Mermaid diagram definition, no markdown code blocks, no explanations
- Create a flowchart (using flowchart TD) that shows:
  - Program entry points (instructions)
  - Account structs and their relationships
  - CPI calls to other programs
  - Data flow between accounts and instructions
- Use descriptive node labels
- Use appropriate Mermaid arrow types:
  - --> for flow/calls
  - -.-> for optional/conditional flows
  - ==> for important/main flows
- Use subgraphs to group related elements (e.g., "Accounts", "Instructions")
- Keep the diagram clean and readable
- Use proper Mermaid syntax (quote labels with special characters)`;

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
        content: `Generate a Mermaid diagram for this Solana Anchor program:\n\n\`\`\`rust\n${code}\n\`\`\`\n\nReturn ONLY the Mermaid diagram definition. No markdown, no code blocks, no explanations.`,
      },
    ],
    max_tokens: 2048,
    temperature: 0.3,
  });

  let text = response.choices[0]?.message?.content?.trim() || "";

  // Clean up - remove markdown code block wrappers if present
  if (text.startsWith("```mermaid")) {
    text = text.replace(/```mermaid\n?/g, "").replace(/```\n?$/g, "");
  } else if (text.startsWith("```")) {
    text = text.replace(/```\n?/g, "");
  }

  return text.trim();
}
