import type { Template } from "@solana-playground/types";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // Default 5 minutes
    this.defaultTTL = defaultTTL;
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp;
      if (age > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}

// Singleton cache instance
export const cache = new MemoryCache();

// Cache key generators
export const cacheKeys = {
  template: (id: string) => `template:${id}`,
  templateList: () => "templates:list",
  explanation: (templateId: string, lineNumbers: string) =>
    `explanation:${templateId}:${lineNumbers}`,
  execution: (templateId: string, scenario: string) =>
    `execution:${templateId}:${scenario}`,
};

// Cache helpers
export async function getCachedOrCompute<T>(
  key: string,
  compute: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await compute();
  cache.set(key, data, ttl);
  return data;
}

// Template-specific cache helpers
export async function getCachedTemplate(
  id: string,
  loadFn: () => Promise<Template>
): Promise<Template> {
  return getCachedOrCompute(
    cacheKeys.template(id),
    loadFn,
    10 * 60 * 1000 // 10 minutes for templates
  );
}

export async function getCachedTemplateList(
  computeFn: () => Promise<Array<{ id: string; name: string; description: string; difficulty: string }>>
): Promise<Array<{ id: string; name: string; description: string; difficulty: string }>> {
  return getCachedOrCompute(
    cacheKeys.templateList(),
    computeFn,
    5 * 60 * 1000 // 5 minutes for template list
  );
}

