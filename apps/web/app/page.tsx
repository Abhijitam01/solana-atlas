"use client";

import React, { useState } from "react";
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
import { useAuth } from "@/components/providers/AuthProvider";
import { Menu, X } from "lucide-react";

export default function SolanaAtlasLanding() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] font-sans selection:bg-[#14F195] selection:text-[#0A0A0A] relative">
      {/* Global Grid Background - Always behind all content */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none z-0" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/90 border-b border-[#262626] backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-20 sm:h-24 flex items-center justify-between">
          <Logo height={72} className="text-[#FAFAFA] sm:h-[88px]" />

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
            {user && (
              <Link
                href="/dashboard"
                className="text-base font-medium text-[#737373] hover:text-[#FAFAFA] transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <AuthButton />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#FAFAFA] hover:text-[#14F195] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="hidden md:block">
              <AuthButton />
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#262626] bg-[#0A0A0A]">
            <div className="max-w-[1200px] mx-auto px-4 py-4 flex flex-col gap-4">
              <Link
                href="/playground/hello-solana"
                className="text-base font-semibold text-[#FAFAFA] hover:text-[#14F195] transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Open Playground
              </Link>
              <a
                href="#how-it-works"
                className="text-base font-medium text-[#737373] hover:text-[#FAFAFA] transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it works
              </a>
              <a
                href="#examples"
                className="text-base font-medium text-[#737373] hover:text-[#FAFAFA] transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Examples
              </a>
              {user && (
                <Link
                  href="/dashboard"
                  className="text-base font-medium text-[#737373] hover:text-[#FAFAFA] transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="divide-y divide-[#262626] relative z-10">
        <Hero />
        <ProductDemo />
        <div className="hidden md:block">
          <WhySwitch />
        </div>
        <HowItWorks />
        <Examples />
        <Trust />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}