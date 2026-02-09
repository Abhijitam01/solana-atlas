"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section className="py-32 px-6 bg-[#0A0A0A] border-t border-[#262626] text-center bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]">
      <div className="max-w-[600px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-[40px] font-bold text-[#FAFAFA] mb-6">
            Start understanding Solana
          </h2>
          <p className="text-[16px] text-[#737373] mb-8">
            No setup. No risk. Just real programs and real execution.
          </p>
          
          <Link
            href="/signup"
            className="inline-block bg-[#14F195] text-[#0A0A0A] px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Open Solana Playground →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
