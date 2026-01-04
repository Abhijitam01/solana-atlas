import { Router } from "express";
import { executeProgram } from "../services/runner-client";
import { ExecutionRequestSchema } from "@solana-playground/types";
import { asyncHandler } from "../middleware/error-handler";
import { executeRateLimit } from "../middleware/rate-limit";

export const executeRouter = Router();

executeRouter.post(
  "/",
  executeRateLimit,
  asyncHandler(async (req, res) => {
    const body = ExecutionRequestSchema.parse(req.body);
    const result = await executeProgram(body);
    res.json(result);
  })
);

