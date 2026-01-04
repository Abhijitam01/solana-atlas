import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LineExplanation, ProgramMap } from "@solana-playground/types";

const SYSTEM_PROMPT = `You are a Solana educator. You explain code clearly and concisely.
Rules:
- Return ONLY valid JSON matching the schema
- Focus on Solana-specific concepts
- Explain for intermediate developers
- Be precise, not chatty
- Reference specific Solana documentation when relevant

Return an array of LineExplanation objects with this structure:
{
  "lineNumber": number,
  "what": string,
  "why": string,
  "solanaConcept": string (optional),
  "rustConcept": string (optional),
  "whatBreaksIfRemoved": string (optional),
  "isImportant": boolean,
  "relatedLines": number[] (optional)
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

export async function explainLines(
  request: ExplainRequest
): Promise<LineExplanation[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const codeLines = request.code.split("\n");
  const selectedCode = request.lineNumbers
    .map((lineNum) => {
      const line = codeLines[lineNum - 1];
      return `${lineNum}: ${line}`;
    })
    .join("\n");

  const prompt = `${SYSTEM_PROMPT}

Explain these lines from a Solana Anchor program:

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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const explanations = JSON.parse(jsonText) as LineExplanation[];
    return explanations;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate explanation");
  }
}

