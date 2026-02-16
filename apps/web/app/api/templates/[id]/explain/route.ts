import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient, GROQ_MODELS } from '@/lib/groq';
import { loadTemplate } from '@solana-playground/solana';
import { z } from 'zod';

const ExplainRequestSchema = z.object({
  lineNumbers: z
    .array(z.number().int().positive())
    .min(1)
    .max(10, 'Maximum 10 lines at a time'),
});

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

// Simple rate limiting (per-user would need more infrastructure)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Simple rate limiting
    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      return NextResponse.json(
        { error: 'Too many requests, please wait' },
        { status: 429 }
      );
    }
    lastRequestTime = now;

    const { id } = params;
    
    if (!id || id.length > 100) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = ExplainRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { lineNumbers } = parsed.data;
    
    // Load template
    const template = await loadTemplate(id);
    
    // Check for precomputed explanations first
    const precomputed = template.explanations.filter(
      (exp: any) => lineNumbers.includes(exp.line)
    );
    
    if (precomputed.length === lineNumbers.length) {
      return NextResponse.json(precomputed);
    }

    // Generate with Groq for missing lines
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    const client = getGroqClient();

    const codeLines = template.code.split('\n');
    const selectedCode = lineNumbers
      .map((lineNum: number) => {
        const line = codeLines[lineNum - 1];
        return `${lineNum}: ${line}`;
      })
      .join('\n');

    const userPrompt = `Explain these lines from a Solana Anchor program:

\`\`\`rust
${selectedCode}
\`\`\`

Program context:
- Instructions: ${template.programMap?.instructions?.map((i: any) => i.name).join(', ') || 'N/A'}
- Accounts: ${template.programMap?.accounts?.map((a: any) => a.name).join(', ') || 'N/A'}

Return ONLY the JSON array, no markdown, no code blocks.`;

    const response = await client.chat.completions.create({
      model: GROQ_MODELS.VERSATILE,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2048,
      temperature: 0.3,
    });

    let text = response.choices[0]?.message?.content?.trim() || '';

    // Clean up JSON
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '');
    }

    const explanations = JSON.parse(text);
    return NextResponse.json(explanations);
  } catch (error) {
    console.error('Error generating explanation:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
