"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Github, Twitter, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#0A0A0A] border-t border-[#262626]">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none opacity-30" />
      
      <div className="relative max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-4">
            <Logo height={56} useFullLogo={true} className="mb-6" />
            <p className="text-sm text-[#737373] leading-relaxed mb-6 max-w-sm">
              Interactive playground for learning Solana development. 
              Run real programs, visualize state, and understand execution—all in your browser.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Abhijitam01"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#1A1A1A] border border-[#262626] flex items-center justify-center text-[#737373] hover:text-[#FAFAFA] hover:border-[#404040] transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/Abhijitam_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-[#1A1A1A] border border-[#262626] flex items-center justify-center text-[#737373] hover:text-[#FAFAFA] hover:border-[#404040] transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-[#FAFAFA] mb-4 uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/playground/hello-solana"
                  className="text-sm text-[#737373] hover:text-[#FAFAFA] transition-colors"
                >
                  Playground
                </Link>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-sm text-[#737373] hover:text-[#FAFAFA] transition-colors"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#examples"
                  className="text-sm text-[#737373] hover:text-[#FAFAFA] transition-colors"
                >
                  Examples
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-[#FAFAFA] mb-4 uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/Abhijitam01/solana-playground"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#737373] hover:text-[#FAFAFA] transition-colors flex items-center gap-1"
                >
                  Codebase
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Abhijitam01/solana-playground"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#737373] hover:text-[#FAFAFA] transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Abhijitam01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#737373] hover:text-[#FAFAFA] transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Community Links */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-[#FAFAFA] mb-4 uppercase tracking-wider">
              Community
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://x.com/Abhijitam_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#737373] hover:text-[#FAFAFA] transition-colors flex items-center gap-1"
                >
                  Twitter
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/solana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#737373] hover:text-[#FAFAFA] transition-colors"
                >
                  Discord
                </a>
              </li>
            </ul>
          </div>

          {/* Legal/Info */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-[#FAFAFA] mb-4 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-[#737373] hover:text-[#FAFAFA] transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-[#737373] hover:text-[#FAFAFA] transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#262626] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-[#737373]">
              © 2026 Solana Atlas. All rights reserved.
            </p>
            <p className="text-xs text-[#525252] mt-1">
              Open Source • Created by{" "}
              <span className="font-medium text-[#FAFAFA]">Abhijitam Dubey</span>
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs text-[#525252]">
            <span>MIT License</span>
            <span className="text-[#262626]">•</span>
            <span>Built with Solana</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
