"use client";

import React from "react";
import { AuthButton } from "@/components/auth/AuthButton";
import { Hero } from "@/components/landing/Hero";
import { ProductDemo } from "@/components/landing/ProductDemo";
import { WhySwitch } from "@/components/landing/WhySwitch";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Examples } from "@/components/landing/Examples";
import { Trust } from "@/components/landing/Trust";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function SolanaAtlasLanding() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] font-sans selection:bg-[#14F195] selection:text-[#0A0A0A] relative">
      {/* Global Grid Background - Always behind all content */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none z-0" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 border-b border-[#262626] backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-24 flex items-center justify-between">
          <Logo height={88} className="text-[#FAFAFA]" />

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/playground/hello-solana"
              className="text-base font-semibold text-[#FAFAFA] hover:text-[#14F195] transition-colors"
            >
              Open Playground
            </Link>
            <a
              href="#how-it-works"
              className="text-base font-medium text-[#737373] hover:text-[#FAFAFA] transition-colors"
            >
              How it works
            </a>
            <a
              href="#examples"
              className="text-base font-medium text-[#737373] hover:text-[#FAFAFA] transition-colors"
            >
              Examples
            </a>
          </div>

          <AuthButton />
        </div>
      </nav>

      <main className="divide-y divide-[#262626] relative z-10">
        <Hero />
        <ProductDemo />
        <WhySwitch />
        <HowItWorks />
        <Examples />
        <Trust />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}