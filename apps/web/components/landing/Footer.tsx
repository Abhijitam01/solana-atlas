"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, ExternalLink } from "lucide-react";

function HoverText({ text }: { text: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const letters = text.split('');

  return (
    <div className="flex items-center justify-start w-full gap-1 md:gap-2">
      {letters.map((letter, index) => (
        <span
          key={index}
          className="relative inline-block cursor-default"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          style={{
            transform: 'scaleX(0.8)',
            transformOrigin: 'center',
            fontSize: 'clamp(7rem, 7.8vw, 18rem)',
            lineHeight: '0.9',
            fontWeight: '800',
            fontStretch: 'condensed',
            letterSpacing: '-0.03em',
          }}
        >
          <span 
            className={`transition-colors duration-200 ${hoveredIndex === index ? 'text-[#14F195]' : 'text-white/85'}`}
            style={{
              display: 'inline-block',
              width: letter === ' ' ? '0.3em' : 'auto',
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        </span>
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a] relative z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]">
      <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr] gap-8 lg:gap-10 mb-10">
          {/* Brand Section */}
          <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <Image
                src="/logo/Gemini_Generated_Image_3z7tl23z7tl23z7t-removebg-preview.png"
                alt="Solana Atlas"
                width={50}
                height={50}
                className="w-[50px] h-[50px] flex-shrink-0 object-contain"
                unoptimized
              />
              <h2 className="text-xl font-semibold tracking-[0.05em] text-white">
                SOLANA ATLAS
              </h2>
            </div>
            <p className="text-[#888] leading-relaxed text-[0.95rem] max-w-[320px]">
              Interactive playground for learning Solana development. Run real
              programs, visualize state, and understand execution—all in your
              browser.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/Abhijitam01"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg flex items-center justify-center text-[#888] hover:bg-[#2a2a2a] hover:border-[#3a3a3a] hover:text-white transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/Abhijitam_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg flex items-center justify-center text-[#888] hover:bg-[#2a2a2a] hover:border-[#3a3a3a] hover:text-white transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-[#666] mb-4">
              Product
            </h3>
            <ul className="flex flex-col gap-2.5 list-none">
              <li>
                <Link
                  href="/playground/hello-solana"
                  className="text-[#999] text-[0.95rem] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  Playground
                </Link>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-[#999] text-[0.95rem] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#examples"
                  className="text-[#999] text-[0.95rem] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  Examples
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-[#666] mb-4">
              Resources
            </h3>
            <ul className="flex flex-col gap-2.5 list-none">
              <li>
                <a
                  href="https://github.com/Abhijitam01/solana-playground"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#999] text-[0.95rem] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  Codebase{" "}
                  <span className="text-[0.75rem] opacity-50">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Abhijitam01/solana-playground"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#999] text-[0.95rem] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Abhijitam01"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#999] text-[0.95rem] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Community Column */}
          <div>
            <h3 className="text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-[#666] mb-4">
              Community
            </h3>
            <ul className="flex flex-col gap-2.5 list-none">
              <li>
                <a
                  href="https://x.com/Abhijitam_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#999] text-[0.95rem] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  Twitter{" "}
                  <span className="text-[0.75rem] opacity-50">↗</span>
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/solana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#999] text-[0.95rem] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  Discord
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-[0.75rem] font-semibold tracking-[0.1em] uppercase text-[#666] mb-4">
              Legal
            </h3>
            <ul className="flex flex-col gap-2.5 list-none">
              <li>
                <a
                  href="#"
                  className="text-[#999] text-[0.95rem] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-[#999] text-[0.95rem] hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#1a1a1a] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[#666] text-sm">
            © 2026 Solana Atlas. All rights reserved.
            <br />
            Open Source • Created by{" "}
            <a
              href="https://github.com/Abhijitam01"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#888] hover:text-white transition-colors"
            >
              Abhijitam Dubey
            </a>
          </div>
          <div className="flex gap-8 text-sm text-[#666]">
            <span>Built with Solana</span>
          </div>
        </div>
      </div>

      {/* Large SOLANA ATLAS Branding - Full Width */}
      <div className="w-full border-t border-[#1a1a1a] relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <HoverText text="SOLANA ATLAS" />
        </div>
      </div>
    </footer>
  );
}
