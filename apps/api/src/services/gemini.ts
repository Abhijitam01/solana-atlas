import OpenAI from "openai";
import type { LineExplanation, ProgramMap } from "@solana-playground/types";

const GROQ_MODELS = {
  VERSATILE: "llama-3.3-70b-versatile",
} as const;

const SYSTEM_PROMPT = `You are a Solana educator. You explain code clearly and concisely.
Rules:
- Return ONLY valid JSON matching the schema
- Focus on Solana-specific concepts
- Explain for intermediate developers
- Be precise, not chatty
- Reference specific Solana documentation when relevant

Return an array of LineExplanation objects with this structure:
{
  "line": number,
  "type": "instruction | account | macro | logic | security",
  "summary": string,
  "why": string (optional),
  "risk": string (optional),
  "concepts": string[] (optional)
}`;

interface ExplainRequest {
  templateId: string;
  lineNumbers: number[];
  code: string;
  context: {
    programMap: ProgramMap;
    existingExplanations: LineExplanation[];
  };
}

function getGroqClient(): OpenAI {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

export async function explainLines(
  request: ExplainRequest
): Promise<LineExplanation[]> {
  const client = getGroqClient();

  const codeLines = request.code.split("\n");
  const selectedCode = request.lineNumbers
    .map((lineNum) => {
      const line = codeLines[lineNum - 1];
      return `${lineNum}: ${line}`;
    })
    .join("\n");

  const userPrompt = `Explain these lines from a Solana Anchor program:

\`\`\`rust
${selectedCode}
\`\`\`

Program context:
- Instructions: ${request.context.programMap.instructions
    .map((instruction: ProgramMap["instructions"][number]) => instruction.name)
    .join(", ")}
- Accounts: ${request.context.programMap.accounts
    .map((account: ProgramMap["accounts"][number]) => account.name)
    .join(", ")}

Return ONLY the JSON array, no markdown, no code blocks.`;

  try {
    const response = await client.chat.completions.create({
      model: GROQ_MODELS.VERSATILE,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2048,
      temperature: 0.3,
    });

    let text = response.choices[0]?.message?.content?.trim() || "";

    // Try to extract JSON from the response
    if (text.startsWith("```json")) {
      text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/```\n?/g, "");
    }

    const explanations = JSON.parse(text) as LineExplanation[];
    return explanations;
  } catch (error) {
    console.error("Groq API error:", error);
    throw new Error("Failed to generate explanation");
  }
}
