"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseSubmissionSchema = exports.ExerciseSchema = exports.MultipleChoiceExerciseSchema = exports.CodeCompletionExerciseSchema = exports.FillInTheBlankExerciseSchema = void 0;
const zod_1 = require("zod");
exports.FillInTheBlankExerciseSchema = zod_1.z.object({
    type: zod_1.z.literal("fill-in-the-blank"),
    id: zod_1.z.string(),
    templateId: zod_1.z.string(),
    code: zod_1.z.string(), // Code with blanks marked as {{blank_1}}, {{blank_2}}, etc.
    blanks: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        correctAnswer: zod_1.z.string(),
        hint: zod_1.z.string().optional(),
        explanation: zod_1.z.string().optional(),
    })),
    instructions: zod_1.z.string(),
});
exports.CodeCompletionExerciseSchema = zod_1.z.object({
    type: zod_1.z.literal("code-completion"),
    id: zod_1.z.string(),
    templateId: zod_1.z.string(),
    code: zod_1.z.string(), // Code with completion points marked
    completions: zod_1.z.array(zod_1.z.object({
        line: zod_1.z.number(),
        column: zod_1.z.number(),
        correctAnswer: zod_1.z.string(),
        options: zod_1.z.array(zod_1.z.string()).optional(), // For multiple choice
    })),
    instructions: zod_1.z.string(),
});
exports.MultipleChoiceExerciseSchema = zod_1.z.object({
    type: zod_1.z.literal("multiple-choice"),
    id: zod_1.z.string(),
    templateId: zod_1.z.string(),
    question: zod_1.z.string(),
    options: zod_1.z.array(zod_1.z.string()),
    correctAnswer: zod_1.z.number(), // Index of correct option
    explanation: zod_1.z.string().optional(),
});
exports.ExerciseSchema = zod_1.z.discriminatedUnion("type", [
    exports.FillInTheBlankExerciseSchema,
    exports.CodeCompletionExerciseSchema,
    exports.MultipleChoiceExerciseSchema,
]);
exports.ExerciseSubmissionSchema = zod_1.z.object({
    exerciseId: zod_1.z.string(),
    answers: zod_1.z.record(zod_1.z.string()), // Map of blank IDs or completion IDs to answers
    selectedOption: zod_1.z.number().optional(), // For multiple choice
});
