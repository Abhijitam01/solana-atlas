"use client";

import { motion } from "framer-motion";

export function ProductDemo() {
  return (
    <section className="py-24 px-6 bg-[#0A0A0A] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-center mb-12">
           <span className="px-3 py-1 rounded-full border border-[#262626] bg-[#111111] text-xs font-mono text-[#737373] uppercase tracking-wider">
            Interactive Environment
           </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-lg border border-[#262626] bg-[#0A0A0A] shadow-2xl overflow-hidden"
        >
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#262626] bg-[#111111]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#262626]" />
              <div className="w-3 h-3 rounded-full bg-[#262626]" />
              <div className="w-3 h-3 rounded-full bg-[#262626]" />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#525252] uppercase tracking-wide">
              <span>lib.rs</span>
              <span className="text-[#262626]">/</span>
              <span>state.rs</span>
              <span className="text-[#262626]">/</span>
              <span className="text-[#FAFAFA]">main</span>
            </div>
            <div className="w-16" /> 
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] divide-x divide-[#262626]">
            {/* Left: Code Editor */}
            <div className="p-6 font-mono text-xs sm:text-sm leading-relaxed bg-[#0A0A0A]">
              <div className="text-[#525252] mb-4">Solana Program Logic</div>
              <div className="space-y-1 text-[#D4D4D4]">
                <div><span className="text-[#C586C0]">use</span> anchor_lang::prelude::*;</div>
                <br />
                <div>#[program]</div>
                <div><span className="text-[#C586C0]">pub mod</span> vault &#123;</div>
                <div className="pl-4"><span className="text-[#C586C0]">pub fn</span> <span className="text-[#DCDCAA]">initialize</span>(ctx: Context&lt;Initialize&gt;) -&gt; Result&lt;()&gt; &#123;</div>
                <div className="pl-8"><span className="text-[#569CD6]">let</span> vault = &amp;<span className="text-[#C586C0]">mut</span> ctx.accounts.vault;</div>
                <div className="pl-8">vault.authority = ctx.accounts.authority.key();</div>
                <div className="pl-8">vault.balance = <span className="text-[#B5CEA8]">0</span>;</div>
                <br />
                <div className="pl-8"><span className="text-[#4EC9B0]">msg!</span>(&quot;Vault initialized&quot;);</div>
                <div className="pl-8"><span className="text-[#C586C0]">Ok</span>(())</div>
                <div className="pl-4">&#125;</div>
                <div>&#125;</div>
                <br />
                <div>#[derive(Accounts)]</div>
                <div><span className="text-[#C586C0]">pub struct</span> Initialize&lt;&apos;info&gt; &#123;</div>
                <div className="pl-4">#[account(init, payer = authority, space = 8 + 32 + 8)]</div>
                <div className="pl-4"><span className="text-[#C586C0]">pub</span> vault: Account&lt;&apos;info, Vault&gt;,</div>
                <div className="pl-4">...</div>
                <div>&#125;</div>
              </div>
            </div>

            {/* Right: State & Logs */}
            <div className="flex flex-col h-full bg-[#0A0A0A] divide-y divide-[#262626]">
              {/* State Panel */}
              <div className="flex-1 p-6 bg-[#0B0B0B]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-[#525252] uppercase tracking-wider">Account State</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#14F195]/10 text-[#14F195] border border-[#14F195]/20 font-mono">Running</span>
                </div>
                <div className="font-mono text-xs sm:text-sm space-y-3">
                  <div className="p-3 bg-[#111111] border border-[#262626] rounded">
                    <div className="text-[#A3A3A3] text-xs mb-1">Address</div>
                    <div className="text-[#FAFAFA]">vault_account</div>
                  </div>
                  <div className="p-3 bg-[#111111] border border-[#262626] rounded">
                     <div className="flex justify-between">
                        <span className="text-[#A3A3A3]">authority</span>
                        <span className="text-[#14F195]">Fg6P...n4Zq</span>
                     </div>
                     <div className="flex justify-between mt-2">
                        <span className="text-[#A3A3A3]">balance</span>
                        <span className="text-[#FAFAFA]">0 SOL</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Execution Log */}
              <div className="flex-1 p-6 bg-[#0A0A0A]">
                <div className="text-[10px] font-bold text-[#525252] uppercase tracking-wider mb-4">Terminal Output</div>
                <div className="font-mono text-xs space-y-2">
                  <div className="flex gap-3 text-[#525252]">
                    <span className="select-none text-[#333]">$</span>
                    <span>solana program deploy target/deploy/vault.so</span>
                  </div>
                  <div className="flex gap-3 text-[#A3A3A3]">
                    <span className="opacity-50">14:20:01</span>
                    <span>→ Program invoked</span>
                  </div>
                  <div className="flex gap-3 text-[#A3A3A3]">
                    <span className="opacity-50">14:20:01</span>
                    <span>→ Account created (vault)</span>
                  </div>
                  <div className="flex gap-3 text-[#14F195]">
                    <span className="opacity-50">14:20:02</span>
                    <span>✓ Vault initialized</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
