import express from "express";
import cors from "cors";
import helmet from "helmet";
import { templatesRouter } from "./routes/templates";
import { explainRouter } from "./routes/explain";
import { executeRouter } from "./routes/execute";
import { authRouter } from "./routes/auth";
import { progressRouter } from "./routes/progress";
import { exercisesRouter } from "./routes/exercises";
import { errorHandler } from "./middleware/error-handler";
import { generalRateLimit } from "./middleware/rate-limit";
import { requestLogger } from "./middleware/logging";

export function createApp() {
  const app = express();

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable for API
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(express.json({ limit: "10mb" }));

  app.use(requestLogger);
  app.use(generalRateLimit);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/metrics", (_req, res) => {
    const { metrics } = require("./services/metrics");
    res.json(metrics.getMetrics());
  });

  app.use("/auth", authRouter);
  app.use("/progress", progressRouter);
  app.use("/exercises", exercisesRouter);
  app.use("/templates", templatesRouter);
  app.use("/templates", explainRouter);
  app.use("/execute", executeRouter);

  app.use((req, res) => {
    res.status(404).json({
      error: "Not Found",
      message: `Route ${req.method} ${req.path} not found`,
    });
  });

  app.use(errorHandler);

  return app;
}

const app = createApp();
export default app;


