import OpenAI from "openai";

let groqClient: OpenAI | null = null;

export function getGroqClient(): OpenAI {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables");
  }

  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }

  return groqClient;
}

// Model constants
export const GROQ_MODELS = {
  /** Fast model for code completions */
  FAST: "llama-3.1-8b-instant",
  /** Powerful model for explanations, analysis, diagram generation */
  VERSATILE: "llama-3.3-70b-versatile",
} as const;
