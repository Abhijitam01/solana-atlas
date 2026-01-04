import { Router } from "express";
import { z } from "zod";
import { db, users, userSessions } from "@solana-playground/db";
import { hashPassword, verifyPassword, generateToken } from "@solana-playground/auth";
import { asyncHandler } from "../middleware/error-handler";
import { eq } from "drizzle-orm";

export const authRouter = Router();

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post(
  "/signup",
  asyncHandler(async (req, res) => {
    if (!db) {
      return res.status(503).json({
        error: "Service Unavailable",
        message: "Database not configured",
      });
    }

    const body = SignupSchema.parse(req.body);

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({
        error: "Conflict",
        message: "User with this email already exists",
      });
    }

    // Create user
    const passwordHash = await hashPassword(body.password);
    const [newUser] = await db
      .insert(users)
      .values({
        email: body.email,
        passwordHash,
      })
      .returning();

    if (!newUser) {
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to create user",
      });
    }

    // Generate token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
    });

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.insert(userSessions).values({
      userId: newUser.id,
      token,
      expiresAt,
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
      },
      token,
    });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    if (!db) {
      return res.status(503).json({
        error: "Service Unavailable",
        message: "Database not configured",
      });
    }

    const body = LoginSchema.parse(req.body);

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email))
      .limit(1);

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isValid = await verifyPassword(body.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.insert(userSessions).values({
      userId: user.id,
      token,
      expiresAt,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    });
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    if (!db) {
      return res.status(503).json({
        error: "Service Unavailable",
        message: "Database not configured",
      });
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      await db.delete(userSessions).where(eq(userSessions.token, token));
    }

    res.json({ message: "Logged out successfully" });
  })
);

