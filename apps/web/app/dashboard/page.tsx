"use client";

import { TrendingUp, Clock, Target, Award, BookOpen, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { PathProgressComponent, PathProgress } from "@/components/learning/PathProgress";

// Mock data - in real implementation, this would come from API
const mockProgress: PathProgress[] = [
  {
    pathId: "beginner-path",
    pathTitle: "Solana Fundamentals",
    totalSteps: 3,
    completedSteps: 2,
    currentStep: 3,
    timeSpent: 45,
    conceptsMastered: ["Accounts", "Programs", "Transactions"],
    lastActivity: new Date(),
  },
];

const mockStats = {
  templatesCompleted: 2,
  totalTimeSpent: 120, // minutes
  conceptsMastered: 5,
  currentStreak: 3,
  achievements: [
    { id: "first-step", name: "First Steps", description: "Completed your first template" },
    { id: "week-warrior", name: "Week Warrior", description: "3 day learning streak" },
  ],
};

export default function DashboardPage() {
  const timeSpentHours = Math.floor(mockStats.totalTimeSpent / 60);
  const timeSpentMinutes = mockStats.totalTimeSpent % 60;

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA]">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-sm text-[#A3A3A3] mb-1">
            Dashboard preview with sample data – real tracking coming soon.
          </p>
          <p className="text-sm text-[#737373]">
            Track your learning progress and achievements across Solana Playground.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-lg bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {mockStats.templatesCompleted}
            </div>
            <div className="text-xs text-muted-foreground">Templates Completed</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-lg bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-info" />
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {timeSpentHours > 0
                ? `${timeSpentHours}h ${timeSpentMinutes}m`
                : `${timeSpentMinutes}m`}
            </div>
            <div className="text-xs text-muted-foreground">Time Spent</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-lg bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-warning" />
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {mockStats.conceptsMastered}
            </div>
            <div className="text-xs text-muted-foreground">Concepts Mastered</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-lg bg-card border border-border"
          >
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-5 h-5 text-warning" />
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {mockStats.currentStreak}
            </div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </motion.div>
        </div>

        {/* Learning Paths Progress */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Learning Paths</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockProgress.map((progress, index) => (
              <motion.div
                key={progress.pathId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <PathProgressComponent progress={progress} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-warning" />
            Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockStats.achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-4 rounded-lg bg-card border border-border"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-warning-light">
                    <Award className="w-5 h-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {achievement.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

