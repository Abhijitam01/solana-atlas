import { z } from "zod";

export const FillInTheBlankExerciseSchema = z.object({
  type: z.literal("fill-in-the-blank"),
  id: z.string(),
  templateId: z.string(),
  code: z.string(), // Code with blanks marked as {{blank_1}}, {{blank_2}}, etc.
  blanks: z.array(
    z.object({
      id: z.string(),
      correctAnswer: z.string(),
      hint: z.string().optional(),
      explanation: z.string().optional(),
    })
  ),
  instructions: z.string(),
});

export const CodeCompletionExerciseSchema = z.object({
  type: z.literal("code-completion"),
  id: z.string(),
  templateId: z.string(),
  code: z.string(), // Code with completion points marked
  completions: z.array(
    z.object({
      line: z.number(),
      column: z.number(),
      correctAnswer: z.string(),
      options: z.array(z.string()).optional(), // For multiple choice
    })
  ),
  instructions: z.string(),
});

export const MultipleChoiceExerciseSchema = z.object({
  type: z.literal("multiple-choice"),
  id: z.string(),
  templateId: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(), // Index of correct option
  explanation: z.string().optional(),
});

export const ExerciseSchema = z.discriminatedUnion("type", [
  FillInTheBlankExerciseSchema,
  CodeCompletionExerciseSchema,
  MultipleChoiceExerciseSchema,
]);

export type FillInTheBlankExercise = z.infer<typeof FillInTheBlankExerciseSchema>;
export type CodeCompletionExercise = z.infer<typeof CodeCompletionExerciseSchema>;
export type MultipleChoiceExercise = z.infer<typeof MultipleChoiceExerciseSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;

export const ExerciseSubmissionSchema = z.object({
  exerciseId: z.string(),
  answers: z.record(z.string()), // Map of blank IDs or completion IDs to answers
  selectedOption: z.number().optional(), // For multiple choice
});

export type ExerciseSubmission = z.infer<typeof ExerciseSubmissionSchema>;

export interface ExerciseResult {
  correct: boolean;
  score: number; // 0-100
  feedback: string;
  correctAnswers?: Record<string, string>;
}

