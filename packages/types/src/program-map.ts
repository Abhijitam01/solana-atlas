import { z } from "zod";

export const AccountInfoSchema = z.object({
  name: z.string(),
  isMut: z.boolean(),
  isSigner: z.boolean(),
  isPda: z.boolean(),
  seeds: z.array(z.string()).optional(),
});

export const InstructionSchema = z.object({
  name: z.string(),
  lineStart: z.number(),
  lineEnd: z.number(),
  accounts: z.array(AccountInfoSchema),
  description: z.string(),
});

export const AccountFieldSchema = z.object({
  name: z.string(),
  type: z.string(),
  description: z.string(),
});

export const AccountDefinitionSchema = z.object({
  name: z.string(),
  lineStart: z.number(),
  lineEnd: z.number(),
  fields: z.array(AccountFieldSchema),
});

export const CpiCallSchema = z.object({
  program: z.string(),
  instruction: z.string(),
  line: z.number(),
});

export const ProgramMapSchema = z.object({
  instructions: z.array(InstructionSchema),
  accounts: z.array(AccountDefinitionSchema),
  cpiCalls: z.array(CpiCallSchema).optional(),
});

export type AccountInfo = z.infer<typeof AccountInfoSchema>;
export type Instruction = z.infer<typeof InstructionSchema>;
export type AccountField = z.infer<typeof AccountFieldSchema>;
export type AccountDefinition = z.infer<typeof AccountDefinitionSchema>;
export type CpiCall = z.infer<typeof CpiCallSchema>;
export type ProgramMap = z.infer<typeof ProgramMapSchema>;

