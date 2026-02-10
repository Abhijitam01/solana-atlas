"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export async function generateAIResponse(prompt: string) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response");
  }
}

export async function generateCodeCompletion(prefix: string, suffix: string) {
  if (!apiKey) {
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a Solana/Anchor program code completion assistant specialized in Rust.
Complete the code based on the context provided.

PREFIX (code before cursor):
${prefix}

SUFFIX (code after cursor):
${suffix}

Rules:
- ONLY suggest valid Solana program Rust code using Anchor framework patterns
- Use correct Anchor macros: #[program], #[account], #[derive(Accounts)], #[error_code], #[event]
- Use correct Anchor types: Account, Signer, Program, SystemAccount, UncheckedAccount
- Use correct Anchor constraints: init, mut, has_one, seeds, bump, constraint, close
- Use proper CPI patterns: CpiContext::new(), CpiContext::new_with_signer()
- Use Solana SDK types: Pubkey, AccountInfo, Clock, Rent, SystemProgram
- Keep completions concise (1-5 lines max)
- Follow Solana best practices (rent exemption, proper error handling with Result<()>)
- Do NOT suggest non-Solana Rust code, general-purpose code, or add explanations

Respond ONLY with the missing code. No markdown, no backticks, no explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.replaceAll('```', '').replace(/^rust\n/i, '').trim();
  } catch (error) {
    console.error("Error generating code completion:", error);
    return null;
  }
}
