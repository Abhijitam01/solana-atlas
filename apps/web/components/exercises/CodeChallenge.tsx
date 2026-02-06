"use client";

import "@/lib/monaco-setup";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Check, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";

interface CodeChallengeProps {
  content: {
    description: string;
    template: string;
    testCases: Array<{
      input: any;
      expectedOutput: any;
    }>;
  };
  solution: string;
  onComplete: (correct: boolean) => void;
}

export function CodeChallenge({ content, solution, onComplete }: CodeChallengeProps) {
  const [code, setCode] = useState(content.template);
  const [testResults, setTestResults] = useState<boolean[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleRunTests = () => {
    // TODO: Actually run tests against the code
    // For now, simulate test results
    const results = content.testCases.map(() => Math.random() > 0.3);
    setTestResults(results);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // TODO: Validate code against solution
    const isCorrect = code.trim().includes("// TODO") === false; // Simplified check
    onComplete(isCorrect);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-foreground">{content.description}</div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Editor
          height="300px"
          defaultLanguage="rust"
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "var(--font-mono)",
          }}
        />
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground">Test Cases:</div>
        {content.testCases.map((testCase, index) => {
          const passed = testResults[index];
          return (
            <div
              key={index}
              className="p-3 rounded-lg bg-muted/30 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">
                  Test Case {index + 1}
                </span>
                {testResults.length > index && (
                  <Badge variant={passed ? "success" : "destructive"} size="sm">
                    {passed ? "Passed" : "Failed"}
                  </Badge>
                )}
              </div>
              <div className="text-xs space-y-1 font-mono">
                <div>
                  <span className="text-muted-foreground">Input:</span>{" "}
                  <span className="text-foreground">
                    {JSON.stringify(testCase.input)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Expected:</span>{" "}
                  <span className="text-foreground">
                    {JSON.stringify(testCase.expectedOutput)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleRunTests}
          className="flex-1 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Run Tests
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitted}
          className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          Submit
        </button>
      </div>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-muted/30 border border-border"
        >
          <div className="text-sm font-semibold mb-2">Solution:</div>
          <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
            {solution}
          </pre>
        </motion.div>
      )}
    </div>
  );
}
