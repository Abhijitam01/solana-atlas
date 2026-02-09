"use client";

import React from "react";


export function Footer() {
  return (
    <footer className="py-12 px-6 bg-[#0A0A0A] border-t border-[#262626]">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="text-sm text-[#737373]">
            © 2026 Solana Atlas
          </p>
          <p className="text-sm text-[#737373] mt-1">
            Open Source {" "}
            <span className="font-medium text-[#FAFAFA]">Abhijitam Dubey</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-sm">
            <a
              href="https://github.com/Abhijitam01"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#737373] hover:text-[#FAFAFA] transition-colors underline-offset-2 hover:underline"
            >
              GitHub
            </a>
            <span className="text-[#404040]">•</span>
            <a
              href="https://x.com/Abhijitam_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#737373] hover:text-[#FAFAFA] transition-colors underline-offset-2 hover:underline"
            >
              Twitter
            </a>
            <span className="text-[#404040]">•</span>
            <a
              href="https://github.com/Abhijitam01/solana-playground"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#737373] hover:text-[#FAFAFA] transition-colors underline-offset-2 hover:underline"
            >
              Project codebase
            </a>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/solana-playground"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#525252] hover:text-[#FAFAFA] transition-colors text-sm"
          >
            Github
          </a>
          <a
            href="/docs"
            className="text-[#525252] hover:text-[#FAFAFA] transition-colors text-sm"
          >
            Documentation
          </a>
          <a
            href="https://discord.gg/solana"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#525252] hover:text-[#FAFAFA] transition-colors text-sm"
          >
            Discord
          </a>
          <a
            href="https://twitter.com/solana"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#525252] hover:text-[#FAFAFA] transition-colors text-sm"
          >
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}
