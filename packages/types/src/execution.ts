import { z } from "zod";

export const AccountStateSchema = z.object({
  address: z.string(),
  label: z.string(),
  owner: z.string(),
  lamports: z.number(),
  dataSize: z.number(),
  data: z.record(z.unknown()).optional(),
});

export const AccountStateAfterSchema = AccountStateSchema.extend({
  changes: z.array(z.string()),
});

export const ExecutionScenarioSchema = z.object({
  name: z.string(),
  description: z.string(),
  instruction: z.string(),
  args: z.array(z.unknown()).optional(),
  accountsBefore: z.array(AccountStateSchema),
  accountsAfter: z.array(AccountStateAfterSchema),
  logs: z.array(z.string()),
  computeUnits: z.number(),
});

export const PrecomputedStateSchema = z.object({
  scenarios: z.array(ExecutionScenarioSchema),
});

export type AccountState = z.infer<typeof AccountStateSchema>;
export type AccountStateAfter = z.infer<typeof AccountStateAfterSchema>;
export type ExecutionScenario = z.infer<typeof ExecutionScenarioSchema>;
export type PrecomputedState = z.infer<typeof PrecomputedStateSchema>;

export const ExecutionRequestSchema = z.object({
  templateId: z.string(),
  scenario: z.string(),
  instruction: z.string(),
  args: z.array(z.unknown()).optional(),
});

export const ExecutionResultSchema = z.object({
  success: z.boolean(),
  scenario: z.string(),
  accountsBefore: z.array(AccountStateSchema),
  accountsAfter: z.array(AccountStateAfterSchema),
  logs: z.array(z.string()),
  computeUnits: z.number(),
  trace: z
    .array(
      z.object({
        program: z.string(),
        depth: z.number(),
        status: z.enum(["invoke", "success", "failed"]),
        logs: z.array(z.string()),
      })
    )
    .default([]),
  error: z.string().optional(),
});

export type ExecutionRequest = z.infer<typeof ExecutionRequestSchema>;
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;
