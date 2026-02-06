"use client";

import { useState } from "react";
import { BookOpen, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { LearningPathComponent } from "@/components/learning/LearningPath";
import { useLearningPathStore, deriveLearningPaths } from "@/stores/learning-path";

export default function LearningPathsPage() {
  const { completedSteps } = useLearningPathStore();
  const paths = deriveLearningPaths(completedSteps);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<
    "all" | "beginner" | "intermediate" | "advanced"
  >("all");

  const filteredPaths = paths.filter((path) => {
    const matchesSearch =
      path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      path.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === "all" || path.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Learning Paths
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow structured learning paths to master Solana development step by step
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search learning paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus-ring transition-all duration-fast"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <select
                value={difficultyFilter}
                onChange={(e) =>
                  setDifficultyFilter(
                    e.target.value as "all" | "beginner" | "intermediate" | "advanced"
                  )
                }
                className="pl-10 pr-8 py-3 rounded-lg border border-border bg-card text-foreground focus-ring transition-all duration-fast appearance-none cursor-pointer"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Learning Paths */}
        <div className="max-w-4xl mx-auto space-y-6">
          {filteredPaths.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No learning paths found
            </div>
          ) : (
            filteredPaths.map((path, index) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <LearningPathComponent path={path} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
