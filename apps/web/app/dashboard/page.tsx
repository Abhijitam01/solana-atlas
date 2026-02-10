"use client";

import { TrendingUp, Clock, Target, Award, BookOpen, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { PathProgressComponent, PathProgress } from "@/components/learning/PathProgress";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { trpc } from "@/lib/trpc-client";
import { AppHeader } from "@/components/AppHeader";

// Mock data for features not yet tracked
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

const mockPreviewStats = {
  totalTimeSpent: 120, // minutes — preview data
  conceptsMastered: 5,  // preview data
  currentStreak: 3,     // preview data
  achievements: [
    { id: "first-step", name: "First Steps", description: "Completed your first template" },
    { id: "week-warrior", name: "Week Warrior", description: "3 day learning streak" },
  ],
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: userCode } = trpc.code.getMyCode.useQuery(undefined, { enabled: !!user });
  const programCount = userCode?.length ?? 0;
  const favoriteCount = userCode?.filter(c => c.isFavorite).length ?? 0;
  const timeSpentHours = Math.floor(mockPreviewStats.totalTimeSpent / 60);
  const timeSpentMinutes = mockPreviewStats.totalTimeSpent % 60;

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA]">
      <AppHeader />
      {/* Header Section */}
      <section className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 border-b border-[#262626]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="flex-1"
            >
              <motion.div variants={fadeUp} className="mb-3 sm:mb-4">
                <span className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-mono text-[#14F195] border border-[#14F195]/20 bg-[#14F195]/5 rounded uppercase tracking-wider inline-block">
                  Dashboard
                </span>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                className="text-[32px] leading-[1.1] sm:text-[48px] md:text-[64px] font-bold tracking-tight mb-4 sm:mb-6 text-white"
              >
                Welcome back
              </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-[14px] sm:text-[16px] md:text-[18px] leading-[22px] sm:leading-[28px] text-[#A3A3A3] mb-2 max-w-[600px]"
            >
              Track your progress across Solana Atlas.
            </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0A0A0A]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#262626] border border-[#262626] rounded-lg overflow-hidden mb-12 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#0A0A0A] p-4 sm:p-6 hover:bg-[#111111] transition-colors group relative"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-[#1A1A1A] border border-[#262626] flex items-center justify-center text-[#FAFAFA]">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#14F195]" />
              </div>
              <div className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-[#FAFAFA] mb-1">
                {programCount}
              </div>
              <div className="text-xs sm:text-sm text-[#737373]">Saved Programs</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0A0A0A] p-4 sm:p-6 hover:bg-[#111111] transition-colors group relative"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-[#1A1A1A] border border-[#262626] flex items-center justify-center text-[#FAFAFA]">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#14F195]" />
              </div>
              <div className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-[#FAFAFA] mb-1">
                {timeSpentHours > 0
                  ? `${timeSpentHours}h ${timeSpentMinutes}m`
                  : `${timeSpentMinutes}m`}
              </div>
              <div className="text-xs sm:text-sm text-[#737373]">Time Spent</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0A0A0A] p-4 sm:p-6 hover:bg-[#111111] transition-colors group relative"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-[#1A1A1A] border border-[#262626] flex items-center justify-center text-[#FAFAFA]">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#14F195]" />
              </div>
              <div className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-[#FAFAFA] mb-1">
                {favoriteCount}
              </div>
              <div className="text-xs sm:text-sm text-[#737373]">Favorites</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#0A0A0A] p-4 sm:p-6 hover:bg-[#111111] transition-colors group relative"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-[#1A1A1A] border border-[#262626] flex items-center justify-center text-[#FAFAFA]">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#14F195]" />
              </div>
              <div className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-[#FAFAFA] mb-1">
                {mockPreviewStats.currentStreak}
              </div>
              <div className="text-xs sm:text-sm text-[#737373]">Day Streak <span className="text-[8px] text-[#14F195]/60 ml-1">PREVIEW</span></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Learning Paths Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0A0A0A] border-t border-[#262626]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4 sm:gap-6 border-b border-[#262626] pb-6 sm:pb-8">
            <h2 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-[#FAFAFA] leading-tight">
              Learning Paths
            </h2>
            <Link 
              href="/paths" 
              className="text-[#A3A3A3] text-xs sm:text-sm hover:text-[#FAFAFA] transition-colors"
            >
              View all paths →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#262626] border border-[#262626] rounded-lg overflow-hidden">
            {mockProgress.map((progress, index) => (
              <motion.div
                key={progress.pathId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-[#0A0A0A] hover:bg-[#111111] transition-colors"
              >
                <PathProgressComponent progress={progress} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#0A0A0A] border-t border-[#262626]">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4 sm:gap-6 border-b border-[#262626] pb-6 sm:pb-8">
            <div>
              <h2 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold text-[#FAFAFA] leading-tight flex items-center gap-2 sm:gap-3">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-[#F59E0B]" />
                Achievements
              </h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#262626] border border-[#262626] rounded-lg overflow-hidden">
            {mockPreviewStats.achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-[#0A0A0A] p-4 sm:p-6 hover:bg-[#111111] transition-colors group relative"
              >
                <div className="relative z-10">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-[#1A1A1A] border border-[#262626] flex items-center justify-center text-[#F59E0B] flex-shrink-0">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-[#FAFAFA] mb-1 sm:mb-2">
                        {achievement.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

