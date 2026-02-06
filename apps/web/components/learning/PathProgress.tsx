"use client";

import { Clock, Target, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";

export interface PathProgress {
  pathId: string;
  pathTitle: string;
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  timeSpent: number; // in minutes
  conceptsMastered: string[];
  lastActivity: Date;
}

interface PathProgressProps {
  progress: PathProgress;
}

export function PathProgressComponent({ progress }: PathProgressProps) {
  const progressPercentage = (progress.completedSteps / progress.totalSteps) * 100;
  const timeSpentHours = Math.floor(progress.timeSpent / 60);
  const timeSpentMinutes = progress.timeSpent % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg bg-card border border-border"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">
            {progress.pathTitle}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              {timeSpentHours > 0
                ? `${timeSpentHours}h ${timeSpentMinutes}m`
                : `${timeSpentMinutes}m`}{" "}
              spent
            </span>
          </div>
        </div>
        <Badge variant="info" size="sm">
          {progress.completedSteps} / {progress.totalSteps}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground font-semibold">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-2 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-foreground">Current Step</span>
          </div>
          <div className="text-sm font-bold text-foreground">
            {progress.currentStep} / {progress.totalSteps}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-3 h-3 text-success" />
            <span className="text-xs font-semibold text-foreground">Concepts</span>
          </div>
          <div className="text-sm font-bold text-foreground">
            {progress.conceptsMastered.length}
          </div>
        </div>
      </div>

      {/* Concepts Mastered */}
      {progress.conceptsMastered.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            Concepts Mastered
          </div>
          <div className="flex flex-wrap gap-1">
            {progress.conceptsMastered.map((concept) => (
              <Badge key={concept} variant="success" size="sm">
                {concept}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

