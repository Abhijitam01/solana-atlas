"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

interface FillInBlankProps {
  content: {
    code: string;
    blanks: Array<{
      id: string;
      line: number;
      column: number;
      length: number;
      hint?: string;
    }>;
  };
  solution: Record<string, string>;
  onComplete: (correct: boolean) => void;
}

export function FillInBlank({ content, solution, onComplete }: FillInBlankProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerChange = (blankId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const allCorrect = content.blanks.every(
      (blank) => answers[blank.id]?.trim().toLowerCase() === solution[blank.id]?.trim().toLowerCase()
    );
    onComplete(allCorrect);
  };

  const lines = content.code.split("\n");

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <div className="font-mono text-sm space-y-1">
          {lines.map((line, lineIndex) => {
            const lineBlanks = content.blanks.filter((b) => b.line === lineIndex + 1);
            if (lineBlanks.length === 0) {
              return (
                <div key={lineIndex} className="text-foreground">
                  {line}
                </div>
              );
            }

            let lastIndex = 0;
            const elements: React.ReactNode[] = [];

            lineBlanks.forEach((blank) => {
              // Add text before blank
              if (blank.column > lastIndex) {
                elements.push(
                  <span key={`text-${blank.id}`} className="text-foreground">
                    {line.substring(lastIndex, blank.column - 1)}
                  </span>
                );
              }

              // Add blank input
              const currentAnswer = answers[blank.id] || "";
              const isCorrect =
                submitted &&
                currentAnswer.trim().toLowerCase() === solution[blank.id]?.trim().toLowerCase();
              const isWrong = submitted && !isCorrect && currentAnswer.trim() !== "";

              elements.push(
                <input
                  key={blank.id}
                  type="text"
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(blank.id, e.target.value)}
                  disabled={submitted}
                  className={`inline-block px-2 py-1 mx-1 text-sm font-mono rounded border ${
                    submitted
                      ? isCorrect
                        ? "bg-success-light border-success text-success"
                        : isWrong
                        ? "bg-destructive-light border-destructive text-destructive"
                        : "bg-muted border-border"
                      : "bg-background border-border focus:border-primary"
                  } ${blank.length ? `w-${blank.length * 8}` : "w-24"}`}
                  placeholder="___"
                  style={{ minWidth: `${Math.max(blank.length * 8, 60)}px` }}
                />
              );

              lastIndex = blank.column + blank.length - 1;
            });

            // Add remaining text
            if (lastIndex < line.length) {
              elements.push(
                <span key={`text-end-${lineIndex}`} className="text-foreground">
                  {line.substring(lastIndex)}
                </span>
              );
            }

            return (
              <div key={lineIndex} className="flex items-center gap-1 flex-wrap">
                {elements}
                {lineBlanks.map((blank) => {
                  const currentAnswer = answers[blank.id] || "";
                  const isCorrect =
                    submitted &&
                    currentAnswer.trim().toLowerCase() ===
                      solution[blank.id]?.trim().toLowerCase();
                  if (submitted && isCorrect) {
                    return (
                      <Check
                        key={`check-${blank.id}`}
                        className="w-4 h-4 text-success inline-block"
                      />
                    );
                  }
                  return null;
                })}
              </div>
            );
          })}
        </div>
      </div>

      {content.blanks.map((blank) => (
        <div key={blank.id} className="text-xs text-muted-foreground">
          {blank.hint && (
            <div className="mb-1">
              <span className="font-semibold">Hint for blank {blank.id}:</span> {blank.hint}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={submitted || content.blanks.some((b) => !answers[b.id]?.trim())}
        className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Check className="w-4 h-4" />
        Submit Answer
      </button>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-muted/30 border border-border"
        >
          <div className="text-sm font-semibold mb-2">Solution:</div>
          <div className="space-y-1 text-xs font-mono">
            {Object.entries(solution).map(([id, value]) => (
              <div key={id} className="flex items-center gap-2">
                <span className="text-muted-foreground">{id}:</span>
                <span className="text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

