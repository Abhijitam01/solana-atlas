"use client";


import { Check, Eye, Microscope, X } from "lucide-react";

const features = [
  {
    icon: Check,
    title: "Code with context",
    before: "Code without context",
    after: "Every line explained",
    description: "Inline explanations for instructions, accounts, and Anchor macros.",
    gradient: "from-blue-500/10 to-blue-500/5"
  },
  {
    icon: Eye,
    title: "Visual State",
    before: "Hidden state changes",
    after: "Watch accounts transform",
    description: "Real-time visualization of account data, PDAs, and lamport transfers.",
    gradient: "from-purple-500/10 to-purple-500/5"
  },
  {
    icon: Microscope,
    title: "Deep Understanding",
    before: "Trial and error",
    after: "Understand on first read",
    description: "Execution logs map to your code line-by-line. No guessing.",
    gradient: "from-green-500/10 to-green-500/5"
  }
];

export function WhySwitch() {
  return (
    <section className="py-24 px-6 bg-[#0A0A0A]">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-[#262626] pb-8">
          <h2 className="text-[32px] font-bold text-[#FAFAFA] leading-tight max-w-md">
            Why developers are switching
          </h2>
          <p className="text-[#737373] text-sm max-w-sm">
            Move beyond simple text editors. Experience a true Solana development environment.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#262626] border border-[#262626] rounded-lg overflow-hidden">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className="bg-[#0A0A0A] p-8 hover:bg-[#111111] transition-colors group relative"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded bg-[#1A1A1A] border border-[#262626] flex items-center justify-center mb-6 text-[#FAFAFA]">
                  <feature.icon className="w-5 h-5" />
                </div>
                
                <h3 className="text-lg font-semibold text-[#FAFAFA] mb-4">{feature.title}</h3>
                
                <div className="space-y-2 mb-6 text-sm">
                  <div className="flex items-center gap-2 text-[#525252] line-through">
                    <X className="w-3 h-3" /> {feature.before}
                  </div>
                  <div className="flex items-center gap-2 text-[#14F195] font-medium">
                    <Check className="w-3 h-3" /> {feature.after}
                  </div>
                </div>
                
                <p className="text-[#737373] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
