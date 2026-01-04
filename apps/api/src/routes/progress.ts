import { Router } from "express";
import { z } from "zod";
import { db, userProgress } from "@solana-playground/db";
import { authMiddleware, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/error-handler";
import { eq, and } from "drizzle-orm";

export const progressRouter = Router();

const UpdateProgressSchema = z.object({
  templateId: z.string().min(1),
  completed: z.boolean().optional(),
  timeSpentSeconds: z.number().int().positive().optional(),
  linesExplained: z.number().int().nonnegative().optional(),
});

progressRouter.use(authMiddleware);

progressRouter.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    if (!db || !req.userId) {
      return res.status(503).json({
        error: "Service Unavailable",
        message: "Database not configured",
      });
    }

    const userProgressList = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, req.userId));

    res.json(userProgressList);
  })
);

progressRouter.get(
  "/:templateId",
  asyncHandler(async (req: AuthRequest, res) => {
    if (!db || !req.userId) {
      return res.status(503).json({
        error: "Service Unavailable",
        message: "Database not configured",
      });
    }

    const { templateId } = req.params;
    if (!templateId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Template ID is required",
      });
    }

    const [progress] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, req.userId),
          eq(userProgress.templateId, templateId)
        )
      )
      .limit(1);

    if (!progress) {
      return res.status(404).json({
        error: "Not Found",
        message: "Progress not found",
      });
    }

    res.json(progress);
  })
);

progressRouter.post(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    if (!db || !req.userId) {
      return res.status(503).json({
        error: "Service Unavailable",
        message: "Database not configured",
      });
    }

    const body = UpdateProgressSchema.parse(req.body);

    // Check if progress exists
    const [existing] = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, req.userId),
          eq(userProgress.templateId, body.templateId)
        )
      )
      .limit(1);

    if (existing) {
      // Update existing
      const [updated] = await db
        .update(userProgress)
        .set({
          completed: body.completed ?? existing.completed,
          timeSpentSeconds:
            (existing.timeSpentSeconds || 0) + (body.timeSpentSeconds || 0),
          linesExplained: body.linesExplained ?? existing.linesExplained,
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userProgress.id, existing.id))
        .returning();

      res.json(updated);
    } else {
      // Create new
      const [newProgress] = await db
        .insert(userProgress)
        .values({
          userId: req.userId,
          templateId: body.templateId,
          completed: body.completed ?? false,
          timeSpentSeconds: body.timeSpentSeconds ?? 0,
          linesExplained: body.linesExplained ?? 0,
        })
        .returning();

      res.status(201).json(newProgress);
    }
  })
);

