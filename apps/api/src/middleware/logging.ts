import { Request, Response, NextFunction } from "express";
import { metrics } from "../services/metrics";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      timestamp: new Date().toISOString(),
    };

    // Record metrics
    metrics.recordRequest(req.method, res.statusCode, duration);
    if (res.statusCode >= 400) {
      metrics.recordError(`HTTP_${res.statusCode}`);
    }

    // Log to console (in production, this would go to a logging service)
    console.log(JSON.stringify(logData));
  });

  next();
}

