import { Router } from "express";
import { ExerciseSubmissionSchema } from "@solana-playground/exercises";
import { asyncHandler } from "../middleware/error-handler";

export const exercisesRouter = Router();

// TODO: Load exercises from database or file system
// For now, return placeholder
exercisesRouter.get(
  "/:templateId",
  asyncHandler(async (req, res) => {
    const { templateId: _templateId } = req.params;
    // Placeholder - would load exercises for template
    res.json([]);
  })
);

exercisesRouter.post(
  "/validate",
  asyncHandler(async (req, res) => {
    ExerciseSubmissionSchema.parse(req.body);
    
    // TODO: Load exercise from database
    // For now, return placeholder
    res.json({
      correct: false,
      score: 0,
      feedback: "Exercise validation not yet implemented",
    });
  })
);

