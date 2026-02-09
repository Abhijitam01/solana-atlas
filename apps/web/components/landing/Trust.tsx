"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Lock,
  Settings2,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

export function Trust() {
  const reduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  const items = [
    {
      key: "no-wallet",
      col: "lg:col-span-4 lg:row-span-2",
      pad: "p-6 md:p-7",
      icon: Lock,
      title: "No wallet required",
      desc: "Start coding immediately—no wallet connects, no private keys, no setup friction.",
      glow: "from-emerald-400/10 via-emerald-400/0 to-transparent",
    },
    {
      key: "stat-setup",
      col: "lg:col-span-3 lg:row-span-2",
      stat: "0",
      statLabel: "Setup time",
      statHint: "Open the Playground and go.",
      glow: "from-emerald-400/10 via-emerald-400/0 to-transparent",
    },
    {
      key: "stat-sandboxed",
      col: "lg:col-span-5 lg:row-span-2",
      stat: "100%",
      statLabel: "Sandboxed",
      statHint: "Safe, isolated execution.",
      glow: "from-emerald-400/10 via-emerald-400/0 to-transparent",
    },
    {
      key: "sandboxed",
      col: "lg:col-span-8 lg:row-span-3",
      icon: Zap,
      title: "100% sandboxed",
      desc: "Total isolation ensures your code can't touch mainnet or external systems. Test freely without unintended consequences.",
      glow: "from-purple-400/10 via-purple-400/0 to-transparent",
    },
    {
      key: "zero-config",
      col: "lg:col-span-4 lg:row-span-3",
      icon: Settings2,
      title: "Zero configuration",
      desc: "No installs, no dependencies, no local toolchains—just open and build.",
      glow: "from-blue-400/10 via-blue-400/0 to-transparent",
    },
    {
      key: "dev-features",
      col: "lg:col-span-6 lg:row-span-4",
      icon: Wrench,
      title: "Developer-friendly features",
      list: [
        "Deterministic execution for consistent testing",
        "No mainnet risk during development",
        "Real-time state visualization",
        "Instant program deployment",
        "Built-in debugging tools",
      ],
      glow: "from-emerald-400/10 via-emerald-400/0 to-transparent",
    },
    {
      key: "community",
      col: "lg:col-span-6 lg:row-span-4",
      pad: "p-6 md:p-7",
      badge: "OPEN SOURCE",
      icon: Users,
      title: "Community-powered",
      list: [
        "Active maintenance & updates",
        "Community-driven examples",
        "Issue tracking on GitHub",
        "Full documentation",
        "Discord community support",
      ],
      glow: "from-pink-400/10 via-pink-400/0 to-transparent",
    },
  ] as const;

  return (
    <section className="py-24 px-6 bg-[#0A0A0A] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[#262626] pb-8">
          <div>
            <h2 className="text-[40px] font-bold text-[#FAFAFA] leading-tight">
              Built for developers
            </h2>
            <p className="mt-4 text-sm text-[#737373] max-w-[560px]">
              Everything you need to build, test, and deploy Solana programs—no
              setup required.
            </p>
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.06 }}
          className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 lg:grid-flow-dense lg:auto-rows-[88px] lg:items-stretch"
        >
          {items.map((item) => {
            const Icon = "icon" in item ? item.icon : null;

            return (
              <motion.div
                key={item.key}
                variants={fadeUp}
                className={[
                  "group relative overflow-hidden rounded-lg border border-[#262626] bg-[#0A0A0A]",
                  "pad" in item ? item.pad : "p-7 md:p-8",
                  "h-full min-h-0",
                  "transition-[transform,background-color,border-color] duration-200",
                  reduceMotion
                    ? "hover:bg-[#111111]"
                    : "hover:-translate-y-1 hover:bg-[#111111]",
                  "hover:border-[#14F195]/30",
                  item.col,
                ].join(" ")}
              >
                {/* Glow + shine */}
                <div
                  aria-hidden="true"
                  className={[
                    "pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full blur-3xl opacity-0",
                    "bg-gradient-to-br",
                    item.glow,
                    "transition-opacity duration-200 group-hover:opacity-100",
                  ].join(" ")}
                />
                <div
                  aria-hidden="true"
                  className={[
                    "pointer-events-none absolute inset-0 opacity-0",
                    "bg-[radial-gradient(1200px_circle_at_80%_0%,rgba(20,241,149,0.10),transparent_45%)]",
                    "transition-opacity duration-200 group-hover:opacity-100",
                  ].join(" ")}
                />

                <div className={[
                  "relative z-10 h-full min-h-0",
                  "horizontal" in item && item.horizontal ? "flex flex-row gap-4" : "flex flex-col"
                ].join(" ")}>
                  {("badge" in item && !("horizontal" in item && item.horizontal)) ? (
                    <div className="mb-4">
                      <span className="px-2.5 py-1 text-[10px] font-mono text-[#14F195] border border-[#14F195]/20 bg-[#14F195]/5 rounded uppercase tracking-wider">
                        {item.badge}
                      </span>
                    </div>
                  ) : null}

                  {"stat" in item ? (
                    <div className="h-full flex flex-col justify-center">
                      <div className="text-[52px] leading-none font-bold tracking-tight text-[#14F195]">
                        {item.stat}
                      </div>
                      <div className="mt-3 text-[11px] font-mono uppercase tracking-wider text-[#737373]">
                        {item.statLabel}
                      </div>
                      {"statHint" in item ? (
                        <div className="mt-3 text-sm text-[#A3A3A3]">
                          {item.statHint}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      {Icon ? (
                        <div className="w-12 h-12 rounded bg-[#1A1A1A] border border-[#262626] flex items-center justify-center mb-6 text-[#FAFAFA] flex-shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                      ) : null}

                      <div>
                        <h3 className="text-xl font-semibold text-[#FAFAFA] mb-3 group-hover:text-[#14F195] transition-colors">
                          {"title" in item ? item.title : ""}
                        </h3>

                        {"desc" in item ? (
                          <p className="text-sm text-[#737373] leading-relaxed">
                            {item.desc}
                          </p>
                        ) : null}

                        {"list" in item ? (
                          <ul className="mt-4 space-y-2">
                            {item.list.map((t) => (
                              <li
                                key={t}
                                className={[
                                  "flex items-start gap-2 text-[#A3A3A3]",
                                  "text-base leading-snug"
                                ].join(" ")}
                              >
                                <Check className={[
                                  "flex-none text-[#14F195]",
                                  "w-5 h-4 mt-0.5"
                                ].join(" ")} />
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
