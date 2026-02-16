"use server";

import { getGroqClient, GROQ_MODELS } from "@/lib/groq";
import { z } from "zod";
import pRetry from "p-retry";
import { LRUCache } from "lru-cache";

// ============================================================================
// CONFIGURATION
// ============================================================================

const config = {
  maxRetries: 3,
  retryDelay: 1000,
  
  // Rate limiting (per user)
  rateLimits: {
    completion: {
      maxRequests: 50,        // 50 requests
      windowMs: 60 * 1000,    // per minute
    },
    response: {
      maxRequests: 20,        // 20 requests
      windowMs: 60 * 1000,    // per minute
    },
  },
  
  // Caching
  cache: {
    ttl: 60 * 60 * 1000,     // 1 hour
    max: 1000,                // Max 1000 entries
  },
  
  // Completion settings
  completion: {
    model: GROQ_MODELS.FAST,
    maxOutputTokens: 150,
    temperature: 0.2,
    topP: 0.8,
    contextLines: 15,
  },
  
  // Response settings
  response: {
    model: GROQ_MODELS.VERSATILE,
    maxOutputTokens: 2048,
    temperature: 0.7,
  },
} as const;

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CompletionInputSchema = z.object({
  prefix: z.string().max(10000, "Prefix too long"),
  suffix: z.string().max(2000, "Suffix too long"),
  userId: z.string().optional(),
});

const ResponseInputSchema = z.object({
  prompt: z.string().min(1).max(5000, "Prompt too long"),
  userId: z.string().optional(),
});

// ============================================================================
// CACHING LAYER
// ============================================================================

// In-memory LRU cache (fallback)
const memoryCache = new LRUCache<string, string>({
  max: config.cache.max,
  ttl: config.cache.ttl,
});

class CacheService {
  async get(key: string): Promise<string | null> {
    // Try Vercel KV first (if available)
    if (process.env.KV_REST_API_URL) {
      try {
        const { kv } = await import("@vercel/kv");
        const cached = await kv.get<string>(key);
        if (cached) {
          console.log(`[Cache] HIT: ${key}`);
          return cached;
        }
      } catch (error) {
        console.warn("[Cache] Vercel KV error, falling back to memory", error);
      }
    }

    // Fallback to memory cache
    const cached = memoryCache.get(key);
    if (cached) {
      console.log(`[Cache] Memory HIT: ${key}`);
      return cached;
    }

    console.log(`[Cache] MISS: ${key}`);
    return null;
  }

  async set(key: string, value: string): Promise<void> {
    // Set in Vercel KV (if available)
    if (process.env.KV_REST_API_URL) {
      try {
        const { kv } = await import("@vercel/kv");
        await kv.set(key, value, { ex: Math.floor(config.cache.ttl / 1000) });
      } catch (error) {
        console.warn("[Cache] Vercel KV set error", error);
      }
    }

    // Always set in memory cache
    memoryCache.set(key, value);
  }
}

const cache = new CacheService();

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

class RateLimiter {
  private getRateLimitKey(userId: string | undefined, type: string): string {
    return `ratelimit:${userId || "anonymous"}:${type}`;
  }

  check(userId: string | undefined, type: "completion" | "response"): boolean {
    const key = this.getRateLimitKey(userId, type);
    const now = Date.now();
    const limit = config.rateLimits[type];

    let entry = rateLimitStore.get(key);

    // Reset if window expired
    if (!entry || now > entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + limit.windowMs,
      };
    }

    // Check if exceeded
    if (entry.count >= limit.maxRequests) {
      console.warn(`[RateLimit] EXCEEDED for ${key}: ${entry.count}/${limit.maxRequests}`);
      return false;
    }

    // Increment and store
    entry.count++;
    rateLimitStore.set(key, entry);

    // Cleanup old entries (prevent memory leak)
    if (rateLimitStore.size > 10000) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (now > v.resetAt) {
          rateLimitStore.delete(k);
        }
      }
    }

    return true;
  }

  getRemainingRequests(userId: string | undefined, type: "completion" | "response"): number {
    const key = this.getRateLimitKey(userId, type);
    const entry = rateLimitStore.get(key);
    const limit = config.rateLimits[type];

    if (!entry || Date.now() > entry.resetAt) {
      return limit.maxRequests;
    }

    return Math.max(0, limit.maxRequests - entry.count);
  }
}

const rateLimiter = new RateLimiter();

// ============================================================================
// TELEMETRY / OBSERVABILITY
// ============================================================================

interface TelemetryEvent {
  type: "completion" | "response" | "error";
  success: boolean;
  latency: number;
  tokensUsed?: number;
  errorType?: string;
  cached?: boolean;
  timestamp: number;
}

class Telemetry {
  private events: TelemetryEvent[] = [];
  private maxEvents = 1000;

  log(event: Omit<TelemetryEvent, "timestamp">) {
    this.events.push({
      ...event,
      timestamp: Date.now(),
    });

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Telemetry]", event);
    }
  }

  getStats(since?: number) {
    const events = since
      ? this.events.filter((e) => e.timestamp > since)
      : this.events;

    const total = events.length;
    const successful = events.filter((e) => e.success).length;
    const cached = events.filter((e) => e.cached).length;
    const avgLatency =
      events.reduce((sum, e) => sum + e.latency, 0) / (total || 1);

    const errorsByType = events
      .filter((e) => !e.success)
      .reduce((acc, e) => {
        const type = e.errorType || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      total,
      successful,
      cached,
      cacheHitRate: total > 0 ? (cached / total) * 100 : 0,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgLatency,
      errorsByType,
    };
  }
}

const telemetry = new Telemetry();

// ============================================================================
// GROQ CLIENT
// ============================================================================

class GroqLLMClient {
  async generateWithRetry(
    prompt: string,
    settings: {
      model: string;
      maxOutputTokens: number;
      temperature: number;
      topP?: number;
    }
  ): Promise<string> {
    return pRetry(
      async () => {
        const client = getGroqClient();
        const response = await client.chat.completions.create({
          model: settings.model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: settings.maxOutputTokens,
          temperature: settings.temperature,
          top_p: settings.topP,
        });

        const text = response.choices[0]?.message?.content;
        if (!text) {
          throw new Error("Empty response from Groq");
        }
        return text;
      },
      {
        retries: config.maxRetries,
        minTimeout: config.retryDelay,
        maxTimeout: config.retryDelay * 4,
        onFailedAttempt: (error) => {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(
            `[Groq] Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`,
            errorMessage
          );
        },
      }
    );
  }
}

const groqLLMClient = new GroqLLMClient();

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

function sanitizeInput(input: string): string {
  // Remove potential prompt injection attempts
  const cleaned = input
    .replace(/\bignore\s+previous\s+instructions\b/gi, "")
    .replace(/\bignore\s+all\s+previous\b/gi, "")
    .replace(/\bforget\s+everything\b/gi, "")
    .replace(/\bact\s+as\b/gi, "")
    .replace(/\bpretend\s+to\s+be\b/gi, "")
    .trim();

  return cleaned;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function buildCompletionPrompt(prefix: string, suffix: string): string {
  return `You are a Solana/Anchor program code completion assistant specialized in Rust.
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
- Keep completions concise (1-3 lines max, prefer single line)
- Follow Solana best practices (rent exemption, proper error handling with Result<()>)
- Do NOT suggest non-Solana Rust code, general-purpose code, or add explanations
- Do NOT repeat code that already exists
- Do NOT include function signatures or struct definitions unless clearly incomplete

Respond ONLY with the missing code. No markdown, no backticks, no explanations, no comments.`;
}

function cleanCompletionResponse(text: string): string | null {
  // Remove markdown
  let cleaned = text
    .replace(/```rust\n?/gi, "")
    .replace(/```\n?/g, "")
    .replace(/^rust\n?/i, "")
    .trim();

  // Remove explanatory text
  const lines = cleaned.split("\n");
  const codeLines = lines.filter((line) => {
    const trimmed = line.trim();
    return (
      trimmed.length > 0 &&
      !trimmed.toLowerCase().startsWith("here") &&
      !trimmed.toLowerCase().startsWith("this") &&
      !trimmed.toLowerCase().startsWith("the code") &&
      !trimmed.match(/^(note|tip|example):/i)
    );
  });

  cleaned = codeLines.join("\n").trim();

  // Limit to 3 lines (reduced from 5)
  const finalLines = cleaned.split("\n").slice(0, 3);
  return finalLines.join("\n").trim() || null;
}

function categorizeError(error: any): string {
  const message = error?.message?.toLowerCase() || "";

  if (message.includes("api_key") || message.includes("authentication")) {
    return "invalid_api_key";
  }
  if (message.includes("quota") || message.includes("rate limit")) {
    return "quota_exceeded";
  }
  if (message.includes("safety") || message.includes("blocked")) {
    return "content_blocked";
  }
  if (message.includes("timeout") || message.includes("timed out")) {
    return "timeout";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "network_error";
  }
  if (message.includes("validation")) {
    return "validation_error";
  }

  return "unknown_error";
}

// ============================================================================
// PUBLIC API - CODE COMPLETION
// ============================================================================

export async function generateCodeCompletion(
  prefix: string,
  suffix: string,
  userId?: string
) {
  const startTime = Date.now();

  try {
    // Validate input
    const input = CompletionInputSchema.parse({
      prefix: sanitizeInput(prefix),
      suffix: sanitizeInput(suffix),
      userId,
    });

    // Check rate limit
    if (!rateLimiter.check(userId, "completion")) {
      const remaining = rateLimiter.getRemainingRequests(userId, "completion");
      console.warn(`[AI Completion] Rate limited. Remaining: ${remaining}`);
      
      telemetry.log({
        type: "completion",
        success: false,
        latency: Date.now() - startTime,
        errorType: "rate_limit",
      });
      
      return null;
    }

    // Check cache
    const cacheKey = `completion:${input.prefix.slice(-200)}:${input.suffix.slice(0, 200)}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      telemetry.log({
        type: "completion",
        success: true,
        latency: Date.now() - startTime,
        cached: true,
      });
      return cached;
    }

    // Extract context
    const prefixLines = input.prefix.split("\n");
    const lastLines = prefixLines
      .slice(Math.max(0, prefixLines.length - config.completion.contextLines))
      .join("\n");

    // Build prompt
    const prompt = buildCompletionPrompt(lastLines, input.suffix.substring(0, 500));

    // Generate completion
    const text = await groqLLMClient.generateWithRetry(prompt, {
      model: config.completion.model,
      maxOutputTokens: config.completion.maxOutputTokens,
      temperature: config.completion.temperature,
      topP: config.completion.topP,
    });

    // Clean response
    const cleaned = cleanCompletionResponse(text);

    // Cache result
    if (cleaned) {
      await cache.set(cacheKey, cleaned);
    }

    telemetry.log({
      type: "completion",
      success: true,
      latency: Date.now() - startTime,
      cached: false,
    });

    return cleaned;
  } catch (error: any) {
    const errorType = categorizeError(error);
    
    telemetry.log({
      type: "completion",
      success: false,
      latency: Date.now() - startTime,
      errorType,
    });

    console.error("[AI Completion] Error:", errorType, error.message);
    return null;
  }
}

// ============================================================================
// PUBLIC API - AI RESPONSE
// ============================================================================

export async function generateAIResponse(prompt: string, userId?: string) {
  const startTime = Date.now();

  try {
    // Validate input
    const input = ResponseInputSchema.parse({
      prompt: sanitizeInput(prompt),
      userId,
    });

    // Check rate limit
    if (!rateLimiter.check(userId, "response")) {
      const remaining = rateLimiter.getRemainingRequests(userId, "response");
      throw new Error(`Rate limit exceeded. Try again in a moment. (Remaining: ${remaining})`);
    }

    // Check cache
    const cacheKey = `response:${input.prompt}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      telemetry.log({
        type: "response",
        success: true,
        latency: Date.now() - startTime,
        cached: true,
      });
      return cached;
    }

    // Generate response
    const text = await groqLLMClient.generateWithRetry(input.prompt, {
      model: config.response.model,
      maxOutputTokens: config.response.maxOutputTokens,
      temperature: config.response.temperature,
    });

    // Cache result
    await cache.set(cacheKey, text);

    telemetry.log({
      type: "response",
      success: true,
      latency: Date.now() - startTime,
      cached: false,
    });

    return text;
  } catch (error: any) {
    const errorType = categorizeError(error);
    
    telemetry.log({
      type: "response",
      success: false,
      latency: Date.now() - startTime,
      errorType,
    });

    console.error("[AI Response] Error:", errorType, error.message);
    throw new Error(`Failed to generate AI response: ${errorType}`);
  }
}

// ============================================================================
// ADMIN API - TELEMETRY
// ============================================================================

export async function getAITelemetry(sinceMinutes?: number) {
  const since = sinceMinutes
    ? Date.now() - sinceMinutes * 60 * 1000
    : undefined;
  
  return telemetry.getStats(since);
}

// ============================================================================
// EXPORTS
// ============================================================================

export { rateLimiter, telemetry };
