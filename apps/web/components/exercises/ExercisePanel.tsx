"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { FillInBlank } from "./FillInBlank";
import { CodeChallenge } from "./CodeChallenge";
import { Quiz } from "./Quiz";

export type ExerciseType = "fill-in-blank" | "code-challenge" | "quiz";

export interface Exercise {
  id: string;
  type: ExerciseType;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  content: any;
  solution?: any;
  hints?: string[];
}

interface ExercisePanelProps {
  exercise: Exercise;
  onComplete?: (exerciseId: string, result: boolean) => void;
}

export function ExercisePanel({ exercise, onComplete }: ExercisePanelProps) {
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleComplete = (correct: boolean) => {
    setIsCompleted(true);
    setIsCorrect(correct);
    if (onComplete) {
      onComplete(exercise.id, correct);
    }
  };

  const handleShowHint = () => {
    if (exercise.hints && hintIndex < exercise.hints.length) {
      setShowHint(true);
      setHintIndex((prev) => Math.min(prev + 1, exercise.hints!.length - 1));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel flex h-full flex-col"
    >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">{exercise.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              exercise.difficulty === "beginner"
                ? "success"
                : exercise.difficulty === "intermediate"
                ? "warning"
                : "destructive"
            }
            size="sm"
          >
            {exercise.difficulty}
          </Badge>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={isCorrect ? "text-success" : "text-destructive"}
            >
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-sm text-muted-foreground">{exercise.description}</div>

        {exercise.hints && exercise.hints.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleShowHint}
              disabled={hintIndex >= exercise.hints!.length}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-info-light text-info hover:bg-info-light/80 transition-colors disabled:opacity-50"
            >
              <Lightbulb className="w-3 h-3" />
              Show Hint ({hintIndex + 1}/{exercise.hints.length})
            </button>
          </div>
        )}

        <AnimatePresence>
          {showHint && exercise.hints && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-lg bg-warning-light border border-warning"
            >
              <div className="text-xs font-semibold text-warning mb-1">Hint:</div>
              <div className="text-sm text-foreground">{exercise.hints[hintIndex]}</div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-t border-border pt-4">
          {exercise.type === "fill-in-blank" && (
            <FillInBlank
              content={exercise.content}
              solution={exercise.solution}
              onComplete={handleComplete}
            />
          )}
          {exercise.type === "code-challenge" && (
            <CodeChallenge
              content={exercise.content}
              solution={exercise.solution}
              onComplete={handleComplete}
            />
          )}
          {exercise.type === "quiz" && (
            <Quiz
              content={exercise.content}
              solution={exercise.solution}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
