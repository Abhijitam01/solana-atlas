"use client";

import { usePlaygroundStore } from "@/stores/playground";
import { useTemplate } from "@/hooks/use-templates";
import { useParams } from "next/navigation";
import { Map, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { HelpIcon } from "@/components/ui/HelpIcon";
import type { AccountDefinition, CpiCall, FlowStep } from "@solana-playground/types";
import { trackEvent } from "@/lib/analytics";
import { shallow } from "zustand/shallow";

export function MapPanel() {
  const params = useParams();
  const templateId = params.templateId as string;
  const { data: template } = useTemplate(templateId);
  const { selectedFlowStepId, setSelectedFlowStepId, setSelectedLine } =
    usePlaygroundStore(
      (state) => ({
        selectedFlowStepId: state.selectedFlowStepId,
        setSelectedFlowStepId: state.setSelectedFlowStepId,
        setSelectedLine: state.setSelectedLine,
      }),
      shallow
    );

  if (!template?.programMap) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel flex h-full flex-col"
      >
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Program Map</h2>
          </div>
        </div>
        <div className="flex-1 p-4 text-sm text-muted-foreground flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </motion.div>
    );
  }

  const flow: FlowStep[] = template.programMap.flow ?? [];
  const accounts: AccountDefinition[] = template.programMap.accounts;
  const cpiCalls: CpiCall[] | undefined = template.programMap.cpiCalls;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="panel flex min-h-[420px] flex-col"
    >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Map className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Program Map</h2>
        </div>
        <HelpIcon
          content="Explore the program structure. Click instructions to jump to code."
          side="left"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 tracking-wider">
            Semantic Flow
          </h3>
          <div className="space-y-3">
            {flow.length > 0 ? (
              flow.map((step: FlowStep, idx: number) => (
                <motion.button
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => {
                    setSelectedFlowStepId(step.id);
                    if (step.lineRange?.[0]) {
                      setSelectedLine(step.lineRange[0]);
                    }
                    void trackEvent({
                      event: "step_start",
                      templateId,
                      stepId: step.id,
                    });
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-fast ${
                    selectedFlowStepId === step.id
                      ? "bg-primary-light/60 border-primary shadow-md"
                      : "bg-muted/20 border-border hover:bg-muted/50 hover:border-primary/50 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-sm text-foreground">
                      {step.title}
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform duration-fast ${
                        selectedFlowStepId === step.id
                          ? "text-primary translate-x-0"
                          : "text-muted-foreground -translate-x-1 group-hover:translate-x-0"
                      }`}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {step.description}
                  </div>
                  {step.concepts && step.concepts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {step.concepts.map((concept: string) => (
                        <Badge key={concept} variant="info" size="sm">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.button>
              ))
            ) : (
              <div className="text-xs text-muted-foreground">
                Flow metadata is not available for this template yet.
              </div>
            )}
          </div>
        </section>

        {accounts.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 tracking-wider">
              Account Types
            </h3>
            <div className="space-y-2">
              {accounts.map((account: typeof accounts[number], idx: number) => (
                <motion.div
                  key={account.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-border bg-muted/30 p-3"
                >
                  <div className="font-semibold text-sm text-foreground font-mono mb-2">
                    {account.name}
                  </div>
                  <div className="space-y-1.5">
                    {account.fields.map((field: typeof account.fields[number]) => (
                      <div
                        key={field.name}
                        className="text-xs text-muted-foreground font-mono"
                      >
                        <span className="text-foreground">{field.name}</span>
                        <span className="mx-2 text-muted-foreground">:</span>
                        <span className="text-info">{field.type}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {cpiCalls && cpiCalls.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3 tracking-wider">
              CPI Calls
            </h3>
            <div className="space-y-2">
              {cpiCalls.map((cpi: typeof cpiCalls[number], idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-xl border border-border bg-muted/30 p-3"
                >
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="font-mono text-foreground">{cpi.program}</span>
                    <ChevronRight className="w-3 h-3 text-primary" />
                    <span className="font-mono text-foreground">{cpi.instruction}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}
