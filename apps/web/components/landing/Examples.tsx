"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Accounts",
    color: "#3B82F6",
    items: ["Account Initialization", "Account Validation", "Cross-Program Invocation"]
  },
  {
    title: "PDAs",
    color: "#8B5CF6",
    items: ["PDA Vault", "PDA Seeds", "Finding PDAs"]
  },
  {
    title: "Tokens",
    color: "#10B981",
    items: ["Token Creation", "Token Minting", "Token Transfers"]
  },
  {
    title: "NFTs",
    color: "#F59E0B",
    items: ["NFT Basics", "Metadata Standard", "Collection Management"]
  },
  {
    title: "DeFi",
    color: "#EF4444",
    items: ["AMM Basics", "Staking Pool", "Escrow Pattern"]
  }
];

export function Examples() {
  return (
    <section id="examples" className="py-24 px-6 bg-[#0A0A0A] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-[#262626] pb-8">
           <div>
             <span className="text-[#14F195] font-mono text-xs uppercase tracking-wider mb-2 block">Library</span>
             <h2 className="text-[32px] font-bold text-[#FAFAFA] leading-tight">
               Start from an example
             </h2>
           </div>
           <Link href="/examples" className="text-[#A3A3A3] text-sm hover:text-[#FAFAFA] flex items-center gap-2 group">
             View all examples <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#262626] border border-[#262626] rounded-lg overflow-hidden">
          {categories.map((category, idx) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-[#0A0A0A] p-6 hover:bg-[#111111] transition-colors group"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                <h3 className="text-sm font-bold text-[#FAFAFA] uppercase tracking-wide">{category.title}</h3>
              </div>
              
              <ul className="space-y-3">
                {category.items.map((item) => (
                  <li key={item}>
                    <Link 
                      href="/signup" 
                      className="block text-sm text-[#737373] hover:text-[#FAFAFA] transition-colors py-1 group-hover/link"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
          {/* Empty cell filler if needed for perfect grid */}
           <div className="bg-[#0A0A0A] p-6 flex items-center justify-center text-[#262626]">
              <span className="text-xs font-mono uppercase">More coming soon</span>
           </div>
        </div>
      </div>
    </section>
  );
}
