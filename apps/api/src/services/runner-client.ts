import type { ExecutionRequest, ExecutionResult } from "@solana-playground/types";

const RUNNER_URL = process.env.RUNNER_URL || "http://localhost:3002";

export async function executeProgram(
  request: ExecutionRequest
): Promise<ExecutionResult> {
  const response = await fetch(`${RUNNER_URL}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Runner error: ${error}`);
  }

  const result = (await response.json()) as ExecutionResult;
  return result;
}

