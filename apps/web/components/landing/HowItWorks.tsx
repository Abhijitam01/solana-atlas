"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "STEP 01",
    title: "Open an example",
    subtitle: "Start with PDAs, tokens, or account management"
  },
  {
    number: "STEP 02",
    title: "Read code with context",
    subtitle: "Hover over instructions for inline explanations"
  },
  {
    number: "STEP 03",
    title: "Run and inspect state",
    subtitle: "See accounts, balances, and logs in real-time"
  },
  {
    number: "STEP 04",
    title: "Modify and rerun",
    subtitle: "Experiment safely in a sandboxed environment"
  }
] as const;

export function HowItWorks() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    const sections = sectionRefs.current.filter(
      (el): el is HTMLDivElement => el !== null
    );

    if (!sections.length) return;

    // Function to find the section closest to the center of the viewport
    const findActiveSection = () => {
      const viewportCenter = window.innerHeight / 2;
      let closestSection = activeIndexRef.current;
      let minDistance = Infinity;

      sections.forEach((section, index) => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(viewportCenter - sectionCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestSection = index;
        }
      });

      if (closestSection !== activeIndexRef.current) {
        activeIndexRef.current = closestSection;
        setActiveIndex(closestSection);
      }
    };

    // Track intersection ratios for all sections
    const intersectionRatios = new Map<number, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const indexAttr = entry.target.getAttribute("data-section-index");
          if (indexAttr) {
            const index = Number(indexAttr);
            if (!Number.isNaN(index)) {
              intersectionRatios.set(index, entry.intersectionRatio);
            }
          }
        });

        // Find the section with the highest intersection ratio
        let maxRatio = 0;
        let activeSectionIndex = activeIndexRef.current;

        intersectionRatios.forEach((ratio, index) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            activeSectionIndex = index;
          }
        });

        // Update active index if we have a visible section
        if (maxRatio > 0.1 && activeSectionIndex !== activeIndexRef.current) {
          activeIndexRef.current = activeSectionIndex;
          setActiveIndex(activeSectionIndex);
        }
      },
      {
        root: null,
        rootMargin: "-10% 0px -10% 0px",
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
      }
    );

    sections.forEach((section) => observer.observe(section));

    // Also use scroll event as a fallback for more reliable tracking
    const handleScroll = () => {
      findActiveSection();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    findActiveSection();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="bg-[#0a0a0a] text-white py-28 px-6 md:px-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]">
      <div className="max-w-[1600px] mx-auto pl-0 md:pl-[200px]">
        <div className="grid gap-10 lg:grid-cols-[400px,1fr] lg:gap-24 relative">
          {/* Left: Steps sidebar with heading */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="relative lg:pl-10">
              {/* How it works heading */}
              <div className="pb-6 pt-4 mb-10">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.02em]">
                  How it works
                </h2>
              </div>
              
              {/* Vertical line (desktop) */}
              <div className="hidden lg:block absolute left-[18px] top-[140px] bottom-8 w-px bg-white/10" />

              <div className="flex lg:block gap-4 overflow-x-auto pb-4 lg:pb-0 lg:overflow-visible">
                {steps.map((step, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={step.number}
                      type="button"
                      className={[
                        "group relative flex-shrink-0 lg:flex-shrink text-left transition-all duration-300",
                        "lg:py-6 lg:pl-6 lg:pr-2",
                        "lg:block rounded-lg lg:rounded-none border border-transparent",
                        isActive
                          ? "bg-[rgba(0,255,163,0.05)] border-[rgba(0,255,163,0.2)]"
                          : "bg-[rgba(255,255,255,0.02)] lg:bg-transparent"
                      ].join(" ")}
                      onClick={() => {
                        const target = sectionRefs.current[index];
                        if (target) {
                          target.scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                          });
                        }
                      }}
                    >
                      {/* Bullet (desktop) */}
                      <div className="hidden lg:block absolute left-[-5px] top-7">
                        <div
                          className={[
                            "rounded-full transition-all duration-300",
                            isActive
                              ? "w-3 h-3 bg-[#00ffa3] shadow-[0_0_12px_rgba(0,255,163,0.5)]"
                              : "w-2 h-2 bg-white/20"
                          ].join(" ")}
                        />
                      </div>

                      <div className="px-4 py-3 lg:px-0 lg:py-0">
                        <div
                          className={[
                            "text-xs font-semibold tracking-[0.2em] mb-1 transition-colors",
                            isActive ? "text-[#00ffa3]" : "text-[#666666]"
                          ].join(" ")}
                        >
                          {step.number}
                        </div>
                        <div
                          className={[
                            "text-base md:text-lg font-semibold transition-colors",
                            isActive ? "text-white" : "text-[#999999]"
                          ].join(" ")}
                        >
                          {step.title}
                        </div>
                        <p className="mt-1 text-xs md:text-sm text-[#737373] hidden lg:block">
                          {step.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Scroll sections */}
          <div className="flex flex-col">
            {/* Section 1 */}
            <div
              ref={(el) => {
                sectionRefs.current[0] = el;
              }}
              data-section-index={0}
              className="min-h-[70vh] flex items-center py-10 md:py-16"
            >
              <div
                className={[
                  "w-full transition-all duration-200 ease-out",
                  activeIndex === 0
                    ? "opacity-100 translate-y-0"
                    : "opacity-20 translate-y-10"
                ].join(" ")}
              >
                <div className="mb-8">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3 tracking-[-0.01em]">
                    Open an example
                  </h3>
                  <p className="text-base md:text-lg text-[#999999]">
                    Start with PDAs, tokens, or account management
                  </p>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-5">
                    {[
                      "Choose from 20+ curated examples covering common Solana patterns",
                      "Examples include token creation, NFTs, staking, and DeFi protocols",
                      "Every example comes with complete working code and documentation"
                    ].map((text) => (
                      <div
                        key={text}
                        className="flex items-start gap-4 p-5 bg-white/5/10 border-l-2 border-l-transparent rounded-lg transition-all duration-300 hover:bg-white/[0.04] hover:border-l-[#00ffa3] hover:translate-x-1"
                      >
                        <div className="mt-1 w-6 h-6 flex items-center justify-center">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="w-5 h-5 stroke-[#00ffa3] stroke-2"
                          >
                            <path
                              d="M5 13l4 4L19 7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="text-sm md:text-[15px] text-[#cccccc] leading-relaxed">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 md:p-8 mt-1 max-w-[580px]">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[#666666] font-semibold mb-4">
                      Example Preview
                    </div>
                    <div className="font-mono text-[13px] md:text-[14px] leading-relaxed text-[#888888]">
                      <div className="py-0.5 text-[#6272a4]">// Available Examples</div>
                      <div className="py-0.5">
                        <span className="text-[#ff79c6]">const</span> examples = [
                      </div>
                      <div className="py-0.5 pl-4 text-[#f1fa8c]">"Token Program",</div>
                      <div className="py-0.5 pl-4 text-[#f1fa8c]">"NFT Minting",</div>
                      <div className="py-0.5 pl-4 text-[#f1fa8c]">"PDA Accounts",</div>
                      <div className="py-0.5 pl-4 text-[#f1fa8c]">"Staking Protocol",</div>
                      <div className="py-0.5 pl-4 text-[#f1fa8c]">"AMM Swap"</div>
                      <div className="py-0.5">];</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div
              ref={(el) => {
                sectionRefs.current[1] = el;
              }}
              data-section-index={1}
              className="min-h-[70vh] flex items-center py-10 md:py-16"
            >
              <div
                className={[
                  "w-full transition-all duration-200 ease-out",
                  activeIndex === 1
                    ? "opacity-100 translate-y-0"
                    : "opacity-20 translate-y-10"
                ].join(" ")}
              >
                <div className="mb-8">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3 tracking-[-0.01em]">
                    Read code with context
                  </h3>
                  <p className="text-base md:text-lg text-[#999999]">
                    Hover over instructions for inline explanations
                  </p>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-5">
                    {[
                      "Intelligent tooltips explain Solana-specific concepts as you read",
                      "Syntax highlighting and code structure visualization",
                      "Learn about accounts, instructions, and program architecture"
                    ].map((text) => (
                      <div
                        key={text}
                        className="flex items-start gap-4 p-5 bg-white/5/10 border-l-2 border-l-transparent rounded-lg transition-all duration-300 hover:bg-white/[0.04] hover:border-l-[#00ffa3] hover:translate-x-1"
                      >
                        <div className="mt-1 w-6 h-6 flex items-center justify-center">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="w-5 h-5 stroke-[#00ffa3] stroke-2"
                          >
                            <path
                              d="M5 13l4 4L19 7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="text-sm md:text-[15px] text-[#cccccc] leading-relaxed">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 md:p-8 mt-1 max-w-[580px]">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[#666666] font-semibold mb-4">
                      Code with Context
                    </div>
                    <div className="font-mono text-[13px] md:text-[14px] leading-relaxed text-[#888888]">
                      <div className="py-0.5">
                        <span className="text-[#ff79c6]">pub fn</span>{" "}
                        <span className="text-[#50fa7b]">initialize</span>
                        (ctx: Context&lt;Initialize&gt;) &#123;
                      </div>
                      <div className="py-0.5 pl-4 text-[#6272a4]">
                        // Context provides account access &larr;
                      </div>
                      <div className="py-0.5 pl-4">
                        <span className="text-[#ff79c6]">let</span> vault = &amp;
                        <span className="text-[#ff79c6]">mut</span> ctx.accounts.vault;
                      </div>
                      <div className="py-0.5 pl-4">
                        vault.authority = ctx.accounts.user.key();
                      </div>
                      <div className="py-0.5 pl-4">
                        <span className="text-[#50fa7b]">Ok</span>(())
                      </div>
                      <div className="py-0.5">&#125;</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div
              ref={(el) => {
                sectionRefs.current[2] = el;
              }}
              data-section-index={2}
              className="min-h-[70vh] flex items-center py-10 md:py-16"
            >
              <div
                className={[
                  "w-full transition-all duration-200 ease-out",
                  activeIndex === 2
                    ? "opacity-100 translate-y-0"
                    : "opacity-20 translate-y-10"
                ].join(" ")}
              >
                <div className="mb-8">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3 tracking-[-0.01em]">
                    Run and inspect state
                  </h3>
                  <p className="text-base md:text-lg text-[#999999]">
                    See accounts, balances, and logs in real-time
                  </p>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-5">
                    {[
                      "Watch your program execute step-by-step in real-time",
                      "Visualize account state changes with clear data displays",
                      "Monitor SOL balances, token amounts, and all data fields"
                    ].map((text) => (
                      <div
                        key={text}
                        className="flex items-start gap-4 p-5 bg-white/5/10 border-l-2 border-l-transparent rounded-lg transition-all duration-300 hover:bg-white/[0.04] hover:border-l-[#00ffa3] hover:translate-x-1"
                      >
                        <div className="mt-1 w-6 h-6 flex items-center justify-center">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="w-5 h-5 stroke-[#00ffa3] stroke-2"
                          >
                            <path
                              d="M5 13l4 4L19 7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="text-sm md:text-[15px] text-[#cccccc] leading-relaxed">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 md:p-8 mt-1 max-w-[580px]">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[#666666] font-semibold mb-4">
                      State Inspector
                    </div>
                    <div className="font-mono text-[13px] md:text-[14px] leading-relaxed text-[#888888]">
                      <div className="py-0.5">
                        Vault Account: <span className="text-[#f1fa8c]">"7xKXt..."</span>
                      </div>
                      <div className="py-0.5">
                        ├─ Balance: <span className="text-[#50fa7b]">10.5 SOL</span>
                      </div>
                      <div className="py-0.5">
                        ├─ Authority:{" "}
                        <span className="text-[#f1fa8c]">"ABC123..."</span>
                      </div>
                      <div className="py-0.5">
                        ├─ Status: <span className="text-[#50fa7b]">Initialized ✓</span>
                      </div>
                      <div className="py-0.5">
                        └─ Last Updated:{" "}
                        <span className="text-[#f1fa8c]">2 seconds ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div
              ref={(el) => {
                sectionRefs.current[3] = el;
              }}
              data-section-index={3}
              className="min-h-[70vh] flex items-center py-10 md:py-16"
            >
              <div
                className={[
                  "w-full transition-all duration-200 ease-out",
                  activeIndex === 3
                    ? "opacity-100 translate-y-0"
                    : "opacity-20 translate-y-10"
                ].join(" ")}
              >
                <div className="mb-8">
                  <h3 className="text-2xl md:text-3xl font-semibold mb-3 tracking-[-0.01em]">
                    Modify and rerun
                  </h3>
                  <p className="text-base md:text-lg text-[#999999]">
                    Experiment safely in a sandboxed environment
                  </p>
                </div>

                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-5">
                    {[
                      "Make changes and instantly see the results—no deploy needed",
                      "Test edge cases and error handling without consequences",
                      "Reset state with one click to start fresh anytime"
                    ].map((text) => (
                      <div
                        key={text}
                        className="flex items-start gap-4 p-5 bg-white/5/10 border-l-2 border-l-transparent rounded-lg transition-all duration-300 hover:bg-white/[0.04] hover:border-l-[#00ffa3] hover:translate-x-1"
                      >
                        <div className="mt-1 w-6 h-6 flex items-center justify-center">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="w-5 h-5 stroke-[#00ffa3] stroke-2"
                          >
                            <path
                              d="M5 13l4 4L19 7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="text-sm md:text-[15px] text-[#cccccc] leading-relaxed">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 md:p-8 mt-1 max-w-[580px]">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[#666666] font-semibold mb-4">
                      Live Editing
                    </div>
                    <div className="font-mono text-[13px] md:text-[14px] leading-relaxed text-[#888888]">
                      <div className="py-0.5 text-[#6272a4]">
                        // Modify values and rerun
                      </div>
                      <div className="py-0.5">
                        <span className="text-[#ff79c6]">let</span> amount ={" "}
                        <span className="text-[#f1fa8c]">100</span>;{" "}
                        <span className="text-[#6272a4]">
                          // &larr; Try different amounts
                        </span>
                      </div>
                      <div className="py-0.5">
                        <span className="text-[#50fa7b]">transfer</span>(amount)?;
                      </div>
                      <div className="py-0.5" />
                      <div className="py-0.5 text-[#6272a4]">
                        // Press Run to see changes instantly
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


