"use client";

import Link from "next/link";
import { type ComponentType, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Rocket,
  Sparkles,
  LineChart,
  Gauge,
  Boxes,
  Cpu,
  Waves,
  PlayCircle,
} from "lucide-react";
import {
  fadeInStagger,
  floatingGlow,
  parallaxY,
  prefersReducedMotion,
} from "@/components/landing/animations";

const features = [
  {
    title: "GSAP-grade smoothness",
    description: "Micro-interactions, parallax, and scroll magic tuned for Solana devs.",
    icon: Sparkles,
    accent: "from-emerald-500/20 to-amber-400/10",
  },
  {
    title: "Execution-aware UI",
    description: "Live program runs, state diffs, and transaction views in one flow.",
    icon: Cpu,
    accent: "from-sky-400/20 to-teal-400/10",
  },
  {
    title: "Guided clarity",
    description: "Line-by-line explainers and visuals keep you unblocked while you build.",
    icon: ShieldCheck,
    accent: "from-amber-400/20 to-orange-500/10",
  },
  {
    title: "Ready to launch",
    description: "Prebuilt templates, playground routing, and Solana-native shortcuts.",
    icon: Rocket,
    accent: "from-emerald-400/15 to-cyan-500/10",
  },
];

const steps = [
  {
    title: "Pick a template",
    detail: "Start from curated Solana patterns, contracts, and examples.",
    icon: Boxes,
  },
  {
    title: "Learn by running",
    detail: "Execute code, inspect accounts, and watch diffs without leaving the view.",
    icon: Gauge,
  },
  {
    title: "Ship with confidence",
    detail: "Iterate faster with timelines, visual flows, and quick playground relaunch.",
    icon: LineChart,
  },
];

const quotes = [
  {
    name: "Builder Velocity",
    quote: "The fastest way we've found to grok Solana programs and ship experiments.",
    role: "DevRel, Ecosystem",
  },
  {
    name: "Onchain Educator",
    quote: "The animations and visuals make explaining onchain concepts feel effortless.",
    role: "Instructor",
  },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLElement | null>(null);
  const featureRef = useRef<HTMLElement | null>(null);
  const stepsRef = useRef<HTMLElement | null>(null);
  const socialRef = useRef<HTMLElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const cleanups = [
      fadeInStagger(heroRef.current),
      parallaxY(
        [featureRef.current, stepsRef.current, socialRef.current],
        48,
        "top 75%"
      ),
      floatingGlow(glowRef.current, 10),
    ];

    return () => cleanups.forEach((cleanup) => cleanup?.());
  }, []);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#0b1116] via-[#0f1b24] to-background text-foreground overflow-hidden">
      <Decor />

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="group flex items-center gap-2 font-semibold">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/70 via-teal-400/70 to-amber-400/60 shadow-lg shadow-emerald-500/30 transition-all duration-200 group-hover:scale-105" />
            <div className="leading-tight">
              <p className="text-xs text-muted-foreground">Solana</p>
              <p className="text-base text-foreground">Playground</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a className="hover:text-primary transition-colors" href="#features">
              Features
            </a>
            <a className="hover:text-primary transition-colors" href="#how">
              How it works
            </a>
            <a className="hover:text-primary transition-colors" href="#social">
              Social proof
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-primary/50 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl focus-ring"
            >
              Launch playground
            </Link>
            <a
              href="https://beta.solpg.io"
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-ring sm:inline-flex"
            >
              Open Solana Playground
            </a>
          </div>
        </div>
      </header>

      <section
        ref={heroRef}
        className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-20 pt-16 md:pt-20"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            ref={glowRef}
            className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-emerald-400/40 via-teal-400/30 to-amber-300/20 blur-3xl"
          />
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Interactive Solana dev surface
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <h1
              data-reveal
              className="text-4xl font-semibold leading-tight text-foreground md:text-5xl"
            >
              Build Solana experiences with{" "}
              <span className="gradient-text">playground-grade motion</span>.
            </h1>
            <p
              data-reveal
              className="max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
              Crafted for speed, clarity, and flow. Motion-first UI, Solana-native
              visuals, and direct paths into the playground.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                data-reveal
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-xl focus-ring"
              >
                Start in the playground
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                data-reveal
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary/50 focus-ring"
              >
                See why it’s different
              </a>
            </div>
            <LoadingBeam />
          </div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 shadow-2xl backdrop-blur"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.12),transparent_30%)]" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-emerald-400" />
                    Playground session
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300">
                    Live
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Metric label="TPS" value="3,200+" accent="text-emerald-300" />
                  <Metric label="Latency" value="~400ms" accent="text-cyan-200" />
                  <Metric label="Templates" value="15+" accent="text-amber-200" />
                  <Metric label="Explainers" value="line-by-line" accent="text-emerald-200" />
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 shadow-inner">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Execution trace
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
                    <TraceRow label="Account init" value="✅ success" />
                    <TraceRow label="Compute units" value="32,000 / 200,000" />
                    <TraceRow label="State diff" value="+2 accounts, 1 token mint" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="features"
        ref={featureRef}
        className="mx-auto max-w-6xl px-4 py-16 md:py-20"
      >
        <SectionHeader
          eyebrow="Designed for Solana builders"
          title="Animations that guide, UI that accelerates"
          description="We merged GSAP nuance with Solana-native context so every motion reinforces learning and shipping."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section
        id="how"
        ref={stepsRef}
        className="mx-auto max-w-6xl px-4 py-16 md:py-20"
      >
        <SectionHeader
          eyebrow="How it works"
          title="Less friction, more launch"
          description="Choose, learn, and ship — with visuals and flows that stay in sync with your code."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <TimelineCard
              key={step.title}
              index={index + 1}
              title={step.title}
              detail={step.detail}
              icon={step.icon}
            />
          ))}
        </div>
      </section>

      <section
        id="social"
        ref={socialRef}
        className="mx-auto max-w-6xl px-4 pb-20 md:pb-24"
      >
        <SectionHeader
          eyebrow="Trusted vibes"
          title="Built for explainers, devrels, and fast movers"
          description="Teams teaching and shipping on Solana use the playground to keep context tight and momentum high."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {quotes.map((quote) => (
            <SocialProof key={quote.name} {...quote} />
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Solana Developer Playground — crafted for builders.
            </p>
            <p className="text-xs text-muted-foreground/80">
              Motion tuned by GSAP + Framer. Ready for your next ship.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 focus-ring"
            >
              Jump into playground
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://beta.solpg.io"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/50 focus-ring"
            >
              Solana Playground
              <Waves className="h-4 w-4 text-cyan-300" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8 space-y-3 text-left md:mb-12">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
        {title}
      </h2>
      <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
        {description}
      </p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  accent,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:border-primary/40">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`}
      />
      <div className="relative flex items-start gap-4">
        <div className="rounded-xl bg-black/40 p-3 text-primary ring-1 ring-white/10 shadow-inner">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function TimelineCard({
  index,
  title,
  detail,
  icon: Icon,
}: {
  index: number;
  title: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:border-primary/50">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-400/5 to-transparent" />
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-black/40 p-3 text-primary ring-1 ring-white/10 shadow-inner">
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              Step {index}
            </p>
          </div>
          <div className="h-8 w-8 rounded-full border border-white/10 bg-white/5 text-center text-sm font-semibold leading-8 text-primary shadow-inner">
            {index}
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function SocialProof({
  name,
  quote,
  role,
}: {
  name: string;
  quote: string;
  role: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 via-teal-400/10 to-amber-500/5" />
      <div className="relative space-y-3">
        <p className="text-lg leading-relaxed text-foreground">“{quote}”</p>
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-left shadow-inner">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`text-base font-semibold text-foreground ${accent ?? ""}`}>
        {value}
      </p>
    </div>
  );
}

function TraceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function LoadingBeam() {
  return (
    <div className="relative mt-2 h-2 w-full max-w-xl overflow-hidden rounded-full bg-white/5">
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-emerald-500/40 via-teal-400/60 to-amber-300/40"
      />
    </div>
  );
}

function Decor() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(16,185,129,0.12),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.14),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(60deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />
    </div>
  );
}
