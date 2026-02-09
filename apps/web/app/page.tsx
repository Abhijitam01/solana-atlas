"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  BookOpen,
  Zap,
  ArrowRight,
  Play,
  Code2,
  ChevronRight,
  Server,
  Shield,
  Beaker,
  Github,
  Twitter,
  MessageSquare,
  Sparkles,
  Terminal,
  Layers,
  Activity,
  Lock,
} from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";

// Enhanced animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
};

// Feature card data
const features = [
  {
    icon: Terminal,
    title: "Line-by-Line Explanations",
    description: "Understand what each line does and why it exists with contextual insights.",
    gradient: "from-[#14F195] to-[#00D18C]",
  },
  {
    icon: Activity,
    title: "State Visualization",
    description: "See account data transform in real-time before and after execution.",
    gradient: "from-[#9945FF] to-[#7C3AED]",
  },
  {
    icon: Zap,
    title: "Instant Execution",
    description: "Live feedback with real Solana runtime logic in your browser.",
    gradient: "from-[#14F195] to-[#9945FF]",
  },
  {
    icon: Layers,
    title: "Built for Flow",
    description: "Breakpoints, zen mode, and step-by-step execution for deep learning.",
    gradient: "from-[#00D18C] to-[#14F195]",
  },
];

// Template data
const templates = [
  {
    id: "account-init",
    title: "Account Initialization",
    difficulty: "Beginner",
    description: "Learn how to create and initialize Solana accounts.",
    color: "#14F195",
  },
  {
    id: "hello-solana",
    title: "Hello Solana",
    difficulty: "Beginner",
    description: "Your first Solana program with basic logging.",
    color: "#14F195",
  },
  {
    id: "governance-dao",
    title: "Governance DAO",
    difficulty: "Advanced",
    description: "Build a decentralized voting system.",
    color: "#9945FF",
  },
  {
    id: "nft-mint",
    title: "NFT Minting",
    difficulty: "Intermediate",
    description: "Create and mint NFTs on Solana.",
    color: "#00D18C",
  },
  {
    id: "pda-vault",
    title: "PDA Vault",
    difficulty: "Intermediate",
    description: "Secure token storage with program-derived addresses.",
    color: "#00D18C",
  },
  {
    id: "amm-swap",
    title: "Token Swap AMM",
    difficulty: "Advanced",
    description: "Implement automated market maker logic.",
    color: "#9945FF",
  },
];

// How it works steps
const steps = [
  { 
    number: "01", 
    title: "Choose a template", 
    description: "Pick from curated Solana patterns and examples",
    icon: Code2,
  },
  { 
    number: "02", 
    title: "Read with context", 
    description: "Understand every line with inline explanations",
    icon: BookOpen,
  },
  { 
    number: "03", 
    title: "Run & visualize", 
    description: "See state changes and execution flow live",
    icon: Activity,
  },
  { 
    number: "04", 
    title: "Experiment freely", 
    description: "Modify code and re-run in safe sandbox",
    icon: Sparkles,
  },
];

// Stats
const stats = [
  { label: "Templates", value: "20+" },
  { label: "Execution Time", value: "<100ms" },
  { label: "Code Examples", value: "500+" },
  { label: "Developers", value: "10k+" },
];

// Animated background particles
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs with animation */}
      <motion.div
        className="absolute top-0 -left-1/4 w-[800px] h-[800px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #14F195 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #9945FF 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-[700px] h-[700px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #00D18C 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -50, 0],
          y: [0, -100, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
    </div>
  );
}

// Floating code snippet component
function FloatingCodeSnippet() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="relative"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-[#14F195] to-[#9945FF] rounded-2xl opacity-20 blur-xl" />
      <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
        {/* Window controls */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-xs text-white/40 font-mono">program.rs</span>
        </div>
        
        {/* Code content */}
        <div className="p-6 font-mono text-sm">
          <pre className="text-white/60">
            <code>
              <span className="text-[#9945FF]">use</span> <span className="text-[#14F195]">anchor_lang</span>::prelude::*;{"\n"}
              {"\n"}
              <span className="text-white/40">{"// Initialize vault account"}</span>{"\n"}
              <span className="text-[#9945FF]">pub fn</span> <span className="text-[#14F195]">initialize</span>({"\n"}
              {"    "}ctx: Context{"<"}Initialize{">"},{"\n"}
              {"    "}amount: <span className="text-[#00D18C]">u64</span>{"\n"}
              {") -> "}Result{"<"}(){">"} {"{"}{"\n"}
              {"    "}<span className="text-white/40">{"// Verify authority"}</span>{"\n"}
              {"    "}<span className="text-[#14F195]">msg!</span>(<span className="text-[#fbbf24]">{"\"Initializing...\""}</span>);{"\n"}
              {"    "}Ok(())
            </code>
          </pre>
          <motion.span
            className="inline-block w-2 h-4 bg-[#14F195] ml-1"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function SolanaAtlasLanding() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  // Smooth scroll progress for potential scroll-linked animations
  useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden">
      {/* Animated cursor follower */}
      <motion.div
        className="fixed w-64 h-64 pointer-events-none z-0 mix-blend-screen"
        animate={{
          x: mousePosition.x - 128,
          y: mousePosition.y - 128,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.1,
        }}
      >
        <div className="w-full h-full bg-[#14F195] opacity-10 blur-[100px] rounded-full" />
      </motion.div>

      {/* Animated Background */}
      <AnimatedBackground />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#14F195] to-[#9945FF] rounded-xl blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#14F195] to-[#9945FF] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-black" strokeWidth={2} />
              </div>
            </div>
            <span className="font-bold text-xl tracking-tight">Solana Atlas</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
              Features
            </a>
            <a href="#templates" className="text-sm text-white/60 hover:text-white transition-colors">
              Templates
            </a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
              How it works
            </a>
          </div>

          <div className="flex items-center gap-4">
            <AuthButton />
            <Link
              href="/playground/hello-solana"
              className="group relative px-6 py-2.5 rounded-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#14F195] to-[#00D18C] opacity-100 group-hover:opacity-90 transition-opacity" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#14F195] to-[#00D18C] opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
              <span className="relative flex items-center gap-2 text-black font-semibold text-sm">
                Launch App
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </motion.nav>

      <main>
        {/* ===== HERO SECTION ===== */}
        <section ref={heroRef} className="relative pt-40 pb-32 px-6 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left column - Text content */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
              >
                <motion.div
                  variants={fadeUp}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#14F195]/20 bg-[#14F195]/5 mb-8"
                >
                  <Sparkles className="w-4 h-4 text-[#14F195]" />
                  <span className="text-sm text-[#14F195] font-medium">Interactive Learning Platform</span>
                </motion.div>
                
                <motion.h1
                  variants={fadeUp}
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-8"
                >
                  Build on Solana
                  <br />
                  <span className="bg-gradient-to-r from-[#14F195] via-[#00D18C] to-[#9945FF] bg-clip-text text-transparent">
                    with confidence
                  </span>
                </motion.h1>
                
                <motion.p
                  variants={fadeUp}
                  className="text-xl text-white/60 leading-relaxed mb-10 max-w-lg"
                >
                  Interactive atlas with live execution, state visualization, 
                  and line-by-line explanations. Learn Solana by actually running programs.
                </motion.p>
                
                <motion.div
                  variants={fadeUp}
                  className="flex flex-wrap items-center gap-4"
                >
                  <Link
                    href="/signup"
                    className="group relative px-8 py-4 rounded-xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#14F195] to-[#00D18C]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#14F195] to-[#00D18C] opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                    <span className="relative flex items-center gap-2 text-black font-bold">
                      <Play className="w-5 h-5" />
                      Start Building
                    </span>
                  </Link>
                  <a
                    href="#templates"
                    className="group px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all font-semibold"
                  >
                    Explore Templates
                  </a>
                </motion.div>

                {/* Stats */}
                <motion.div
                  variants={fadeUp}
                  className="grid grid-cols-4 gap-8 mt-16 pt-8 border-t border-white/10"
                >
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-2xl font-bold bg-gradient-to-r from-[#14F195] to-[#00D18C] bg-clip-text text-transparent mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-white/40">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right column - Floating code */}
              <div className="hidden lg:block">
                <FloatingCodeSnippet />
              </div>
            </div>
          </div>
        </section>

        {/* ===== FEATURES SECTION ===== */}
        <section id="features" className="relative py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
                <Zap className="w-4 h-4 text-[#14F195]" />
                <span className="text-sm text-white/60">Features</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Everything you need
                <br />
                <span className="text-white/40">to master Solana</span>
              </h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={scaleIn}
                  className="group relative"
                >
                  <div className="absolute -inset-px bg-gradient-to-b from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative h-full p-8 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/5 hover:bg-white/[0.05] transition-all">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                      <feature.icon className="w-6 h-6 text-black" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-white/60 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===== PLAYGROUND PREVIEW ===== */}
        <section className="relative py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                See it in action
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                A development environment designed for understanding, not just writing code.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-[#14F195]/20 to-[#9945FF]/20 rounded-3xl blur-3xl" />
              <div className="relative rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl overflow-hidden">
                {/* Editor Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                      <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                      <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="text-sm text-white/40 font-mono ml-4">pda_vault.rs</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 text-xs rounded-lg bg-[#14F195]/10 text-[#14F195] font-semibold border border-[#14F195]/20">
                      PDA Vault Template
                    </span>
                  </div>
                </div>

                {/* Editor Content */}
                <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                  {/* Code Panel */}
                  <div className="lg:col-span-3 p-8 font-mono text-sm">
                    <pre className="text-white/70 leading-loose">
                      <code>
                        <span className="text-[#9945FF]">use</span> <span className="text-[#14F195]">anchor_lang</span>::prelude::*;{"\n"}
                        {"\n"}
                        <span className="text-white/30">{"// Declare program ID"}</span>{"\n"}
                        <span className="text-[#9945FF]">declare_id!</span>(<span className="text-[#fbbf24]">{"\"Fg6P...n4Zq\""}</span>);{"\n"}
                        {"\n"}
                        <span className="text-[#9945FF]">#[program]</span>{"\n"}
                        <span className="text-[#9945FF]">pub mod</span> <span className="text-[#14F195]">pda_vault</span> {"{"}{"\n"}
                        {"    "}<span className="text-[#9945FF]">use super</span>::*;{"\n"}
                        {"\n"}
                        {"    "}<span className="text-[#9945FF]">pub fn</span> <span className="text-[#14F195]">initialize</span>({"\n"}
                        {"        "}ctx: Context{"<"}Initialize{">"},{"\n"}
                        {"    "}) -{">"} Result{"<"}(){">"} {"{"}{"\n"}
                        {"        "}<span className="text-white/30">{"// Init vault"}</span>{"\n"}
                        {"        "}<span className="text-[#14F195]">msg!</span>(<span className="text-[#fbbf24]">{"\"Vault created\""}</span>);{"\n"}
                        {"        "}Ok(())
                      </code>
                    </pre>
                  </div>

                  {/* State Panel */}
                  <div className="lg:col-span-2 p-8 bg-white/[0.01]">
                    <div className="mb-8">
                      <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Live State
                      </h4>
                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-white/60">vault_account</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#14F195]/20 text-[#14F195] font-medium">
                              Active
                            </span>
                          </div>
                          <span className="text-sm font-mono text-white">Initialized ✓</span>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-sm text-white/60 block mb-1">authority</span>
                          <span className="text-sm font-mono text-[#14F195]">Fg6P...n4Zq</span>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                          <span className="text-sm text-white/60 block mb-1">balance</span>
                          <span className="text-sm font-mono text-white">0.00 SOL</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Terminal className="w-3 h-3" />
                        Execution Log
                      </h4>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="flex items-start gap-2 text-[#14F195]">
                          <span>✓</span>
                          <span>Program invoked</span>
                        </div>
                        <div className="flex items-start gap-2 text-[#14F195]">
                          <span>✓</span>
                          <span>Account created</span>
                        </div>
                        <div className="flex items-start gap-2 text-[#14F195]">
                          <span>✓</span>
                          <span>PDA derived</span>
                        </div>
                        <div className="flex items-start gap-2 text-white/40">
                          <span>→</span>
                          <span>Awaiting deposit...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== TEMPLATES SECTION ===== */}
        <section id="templates" className="relative py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
                <Code2 className="w-4 h-4 text-[#14F195]" />
                <span className="text-sm text-white/60">Templates</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Start from a template
              </h2>
              <p className="text-xl text-white/60 max-w-2xl mx-auto">
                Curated examples covering essential Solana development patterns.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  variants={scaleIn}
                >
                  <Link
                    href={`/playground/${template.id}`}
                    className="group relative block h-full"
                  >
                    <div className="absolute -inset-px bg-gradient-to-b from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative h-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${template.color}20, ${template.color}10)`,
                            border: `1px solid ${template.color}30`,
                          }}
                        >
                          <Code2 className="w-6 h-6" style={{ color: template.color }} />
                        </div>
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            template.difficulty === "Beginner"
                              ? "bg-[#14F195]/10 text-[#14F195] border border-[#14F195]/20"
                              : template.difficulty === "Intermediate"
                              ? "bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20"
                              : "bg-[#9945FF]/10 text-[#9945FF] border border-[#9945FF]/20"
                          }`}
                        >
                          {template.difficulty}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-[#14F195] transition-colors">
                        {template.title}
                      </h3>
                      <p className="text-white/60 mb-4">{template.description}</p>
                      <div className="flex items-center gap-2 text-sm text-white/40 group-hover:text-[#14F195] transition-colors">
                        <span>Explore template</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===== HOW IT WORKS SECTION ===== */}
        <section id="how-it-works" className="relative py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
                <Layers className="w-4 h-4 text-[#14F195]" />
                <span className="text-sm text-white/60">Process</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Simple learning path
              </h2>
              <p className="text-xl text-white/60">
                From curiosity to mastery in four steps.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  variants={scaleIn}
                  className="relative"
                >
                  <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group">
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-[#14F195] to-[#00D18C] flex items-center justify-center font-mono font-bold text-black">
                      {step.number}
                    </div>
                    <step.icon className="w-10 h-10 text-[#14F195] mb-6 mt-4" strokeWidth={1.5} />
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-white/60">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ChevronRight className="w-6 h-6 text-white/10" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===== TRUST SECTION ===== */}
        <section className="relative py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Built for developers
              </h2>
              <p className="text-xl text-white/60">
                Safe, secure, and designed for experimentation.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { icon: Server, text: "Local validator", desc: "Run programs locally" },
                { icon: Shield, text: "No wallet", desc: "Zero setup required" },
                { icon: Lock, text: "No mainnet risk", desc: "Safe sandbox" },
                { icon: Beaker, text: "Test freely", desc: "Experiment safely" },
              ].map((point, index) => (
                <motion.div
                  key={index}
                  variants={scaleIn}
                  className="p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center"
                >
                  <point.icon className="w-8 h-8 text-[#14F195] mx-auto mb-3" strokeWidth={1.5} />
                  <div className="font-semibold mb-1">{point.text}</div>
                  <div className="text-sm text-white/40">{point.desc}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===== FINAL CTA ===== */}
        <section className="relative py-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8">
                Start building on Solana
                <br />
                <span className="text-white/40">today.</span>
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/playground/hello-solana"
                  className="group relative px-8 py-4 rounded-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#14F195] to-[#00D18C]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#14F195] to-[#00D18C] opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                  <span className="relative flex items-center gap-2 text-black font-bold">
                    <Play className="w-5 h-5" />
                    Open Playground
                  </span>
                </Link>
                <a
                  href="#templates"
                  className="px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all font-semibold"
                >
                  View Templates
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="relative border-t border-white/10 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* Brand column */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14F195] to-[#9945FF] flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-black" strokeWidth={2} />
                </div>
                <span className="font-bold text-lg">Solana Atlas</span>
              </Link>
              <p className="text-sm text-white/40 mb-6">
                Interactive learning environment for Solana development.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Product column */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#templates" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                <li><Link href="/playground/hello-solana" className="hover:text-white transition-colors">Playground</Link></li>
              </ul>
            </div>

            {/* Resources column */}
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Examples</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>

            {/* Company column */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              © 2024 Solana Atlas. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}