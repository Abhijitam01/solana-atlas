"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Lock, BookOpen, Rocket } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export function Hero() {
  const { user } = useAuth();
  const router = useRouter();

  const handlePrimaryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Auth-aware funnel: if not logged in, send to signup with redirect back to playground.
    if (!user) {
      e.preventDefault();
      const next = encodeURIComponent("/playground/hello-solana");
      router.push(`/signup?next=${next}`);
    }
    // If logged in, the href will take them directly to the playground.
  };

  return (
    <section className="relative pt-32 pb-24 px-6 flex items-center justify-center bg-[#0A0A0A] text-[#FAFAFA] border-b border-[#262626]">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="max-w-[800px] w-full text-center relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-6 flex justify-center">
            <span className="px-3 py-1 text-xs font-mono text-[#14F195] border border-[#14F195]/20 bg-[#14F195]/5 rounded uppercase tracking-wider">
              v1.0 Public Beta
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-[48px] leading-[1.1] sm:text-[64px] font-bold tracking-tight mb-6 text-white"
          >
            The Solana Playground <br className="hidden sm:block" />
            <span className="text-[#A3A3A3]">you needed.</span>
          </motion.h1>
          
          <motion.p
            variants={fadeUp}
            className="text-[18px] leading-[28px] text-[#A3A3A3] mb-10 max-w-[600px] mx-auto"
          >
            Run real Solana programs. Watch state transform. 
            Understand execution—not just syntax.
            Zero setup. No wallet. Open source.
          </motion.p>
          
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-4 mb-12"
          >
            <Link
              href="/playground/hello-solana"
              onClick={handlePrimaryClick}
              className="bg-[#FAFAFA] text-[#0A0A0A] px-8 py-3 rounded text-sm font-semibold hover:bg-white transition-colors"
            >
              Open Playground
            </Link>
            <a
              href="#examples"
              className="bg-transparent text-[#A3A3A3] border border-[#262626] px-8 py-3 rounded text-sm font-medium hover:text-[#FAFAFA] hover:border-[#525252] transition-colors"
            >
              Browse Examples
            </a>
          </motion.div>

          {/* Fast Facts - Grid Style */}
          <motion.div
            variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#262626] border border-[#262626] rounded-lg overflow-hidden max-w-2xl mx-auto"
          >
            {[
              { icon: Zap, text: "Zero setup" },
              { icon: Lock, text: "Sandboxed" },
              { icon: BookOpen, text: "Open source" },
              { icon: Rocket, text: "Active dev" },
            ].map((fact, i) => (
              <div key={i} className="flex items-center justify-center gap-2 py-3 bg-[#0A0A0A] text-xs text-[#737373] hover:text-[#A3A3A3] transition-colors">
                <fact.icon className="w-3 h-3" />
                {fact.text}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
