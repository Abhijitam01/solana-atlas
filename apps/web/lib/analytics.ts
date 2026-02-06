const normalizeApiUrl = (raw: string) => {
  const trimmed = raw.replace(/\/+$/, "");
  return trimmed.endsWith("/analytics") ? trimmed.slice(0, -"/analytics".length) : trimmed;
};

const API_URL = normalizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
);

const SESSION_KEY = "solana-playground-session";
const COHORT_KEY = "solana-playground-cohort";
const FIRST_TX_START_KEY = "solana-playground-first-tx-start";
const FIRST_TX_DONE_KEY = "solana-playground-first-tx-done";

export type AnalyticsEventInput = {
  event: string;
  templateId?: string;
  stepId?: string;
  success?: boolean;
  durationMs?: number;
  metadata?: Record<string, unknown>;
};

export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const generated = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  window.localStorage.setItem(SESSION_KEY, generated);
  return generated;
}

export function getCohortId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(COHORT_KEY);
}

export function setCohortId(cohortId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COHORT_KEY, cohortId);
}

export function markFirstTxStart() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(FIRST_TX_START_KEY)) return;
  window.localStorage.setItem(FIRST_TX_START_KEY, Date.now().toString());
  void trackEvent({ event: "first_tx_start" });
}

export function markFirstTxSuccess() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(FIRST_TX_DONE_KEY)) return;
  const startedAt = Number(window.localStorage.getItem(FIRST_TX_START_KEY) || 0);
  const durationMs = startedAt ? Date.now() - startedAt : undefined;
  window.localStorage.setItem(FIRST_TX_DONE_KEY, "true");
  void trackEvent({ event: "first_tx_success", durationMs });
}

export async function trackEvent(input: AnalyticsEventInput): Promise<void> {
  if (typeof window === "undefined") return;
  const sessionId = getSessionId();
  if (!sessionId) return;

  const payload = {
    sessionId,
    cohortId: getCohortId() || undefined,
    event: input.event,
    templateId: input.templateId,
    stepId: input.stepId,
    success: input.success,
    durationMs: input.durationMs,
    metadata: input.metadata,
  };

  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(`${API_URL}/analytics/events`, blob);
    return;
  }

  try {
    await fetch(`${API_URL}/analytics/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch (error) {
    console.warn("Analytics event failed", error);
  }
}
