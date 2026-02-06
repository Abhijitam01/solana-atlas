"use client";

import { CheckCircle2, Lock, Circle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export interface PathStep {
  id: string;
  templateId: string;
  title: string;
  description: string;
  completed: boolean;
  locked: boolean;
  order: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  steps: PathStep[];
  progress: number;
  completed: boolean;
}

interface LearningPathProps {
  path: LearningPath;
  onStepClick?: (step: PathStep) => void;
}

export function LearningPathComponent({ path, onStepClick }: LearningPathProps) {
  const completedSteps = path.steps.filter((s) => s.completed).length;
  const progressPercentage = (completedSteps / path.steps.length) * 100;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-card border border-border">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-1">{path.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant={
                  path.difficulty === "beginner"
                    ? "success"
                    : path.difficulty === "intermediate"
                    ? "warning"
                    : "destructive"
                }
                size="sm"
              >
                {path.difficulty}
              </Badge>
              <Badge variant="info" size="sm">
                {path.estimatedTime}
              </Badge>
              <Badge variant="default" size="sm">
                {path.steps.length} steps
              </Badge>
            </div>
          </div>
          {path.completed && (
            <Badge variant="success" size="sm">
              Completed
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground font-semibold">
              {completedSteps} / {path.steps.length}
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
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {path.steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={step.locked ? "#" : `/playground/${step.templateId}`}
              onClick={(e) => {
                if (step.locked) {
                  e.preventDefault();
                } else if (onStepClick) {
                  e.preventDefault();
                  onStepClick(step);
                }
              }}
              className={`block p-4 rounded-lg border transition-all duration-fast ${
                step.completed
                  ? "bg-success-light/30 border-success"
                  : step.locked
                  ? "bg-muted/30 border-border opacity-50 cursor-not-allowed"
                  : "bg-card border-border hover:border-primary hover:bg-primary-light/10"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : step.locked ? (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">
                      Step {step.order}: {step.title}
                    </span>
                    {step.completed && (
                      <Badge variant="success" size="sm">Completed</Badge>
                    )}
                    {step.locked && (
                      <Badge variant="default" size="sm">Locked</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {!step.locked && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

