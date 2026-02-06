"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Wallet, Layers, Shield, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTemplate } from "@/hooks/use-templates";
import { usePlaygroundStore } from "@/stores/playground";
import { Badge } from "@/components/ui/Badge";
import { HelpIcon } from "@/components/ui/HelpIcon";
import type { AccountState, AccountStateAfter, ExecutionScenario, Instruction } from "@solana-playground/types";
import { shallow } from "zustand/shallow";

export function AccountInspectorPanel() {
  const params = useParams();
  const templateId = params.templateId as string;
  const { data: template, isLoading } = useTemplate(templateId);
  const { executionMode, currentScenario, executionResult } = usePlaygroundStore(
    (state) => ({
      executionMode: state.executionMode,
      currentScenario: state.currentScenario,
      executionResult: state.executionResult,
    }),
    shallow
  );
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const scenarios: ExecutionScenario[] = useMemo(
    () => template?.precomputedState?.scenarios ?? [],
    [template?.precomputedState?.scenarios]
  );

  const scenario = useMemo(() => {
    if (executionMode !== "precomputed") return null;
    if (scenarios.length === 0) return null;
    return scenarios.find((s) => s.name === currentScenario) ?? scenarios[0] ?? null;
  }, [executionMode, scenarios, currentScenario]);

  const accountsBefore: AccountState[] = useMemo(
    () => executionResult?.accountsBefore || scenario?.accountsBefore || [],
    [executionResult, scenario]
  );

  const accountsAfter: AccountStateAfter[] = useMemo(
    () => executionResult?.accountsAfter || scenario?.accountsAfter || [],
    [executionResult, scenario]
  );

  const accounts = useMemo(() => {
    return accountsAfter.map((after) => {
      const before = accountsBefore.find((item) => item.address === after.address);
      const delta = before ? after.lamports - before.lamports : after.lamports;
      return {
        after,
        before,
        delta,
      };
    });
  }, [accountsAfter, accountsBefore]);

  const pdaSeeds = useMemo(() => {
    const instructions: Instruction[] = template?.programMap?.instructions ?? [];
    const seedMap = new Map<string, string[]>();
    instructions.forEach((instruction) => {
      instruction.accounts.forEach((account) => {
        if (account.isPda && account.seeds?.length) {
          seedMap.set(account.name, account.seeds);
        }
      });
    });
    return seedMap;
  }, [template?.programMap?.instructions]);

  const owners = useMemo(() => {
    const map = new Map<string, AccountStateAfter[]>();
    accountsAfter.forEach((account) => {
      const owner = account.owner || "Unknown";
      const existing = map.get(owner) ?? [];
      existing.push(account);
      map.set(owner, existing);
    });
    return Array.from(map.entries()).map(([owner, list]) => ({ owner, list }));
  }, [accountsAfter]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel flex h-full flex-col"
      >
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Account Inspector</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="panel flex min-h-[420px] flex-col"
    >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Account Inspector</h2>
        </div>
        <HelpIcon content="Inspect account ownership, PDA seeds, and lamport changes." side="left" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        <section className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Accounts
          </div>
          {accounts.length === 0 && (
            <div className="text-xs text-muted-foreground">No account data available.</div>
          )}
          <div className="space-y-2">
            {accounts.map(({ after, before, delta }) => {
              const label = after.label || after.address;
              const seeds = pdaSeeds.get(label);
              const isSelected = selectedAccount === after.address;
              return (
                <button
                  key={after.address}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  isSelected
                      ? "border-primary bg-primary-light/50 shadow-md"
                      : "border-border bg-muted/20 hover:border-primary/60 hover:bg-muted/40"
                }`}
                  onClick={() => setSelectedAccount(after.address)}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-foreground font-mono">
                      {label}
                    </div>
                    <Badge variant={delta >= 0 ? "success" : "destructive"} size="sm">
                      {delta >= 0 ? "+" : ""}{delta} lamports
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground font-mono">
                    {after.address}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <Badge variant="default" size="sm">
                      Owner: {after.owner || "Unknown"}
                    </Badge>
                    <Badge variant="info" size="sm">
                      Data: {after.dataSize} bytes
                    </Badge>
                    {before && (
                      <Badge variant="default" size="sm">
                        Prev: {before.lamports} lamports
                      </Badge>
                    )}
                  </div>
                  {seeds && seeds.length > 0 && (
                    <div className="mt-3 rounded-lg border border-border bg-background/60 p-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Shield className="h-3 w-3 text-info" />
                        PDA Seeds
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {seeds.map((seed) => (
                          <span
                            key={seed}
                            className="rounded-md bg-muted px-2 py-0.5 font-mono text-foreground"
                          >
                            {seed}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Ownership Graph
          </div>
          {owners.length === 0 && (
            <div className="text-xs text-muted-foreground">No ownership data.</div>
          )}
          <div className="space-y-2">
            {owners.map((owner) => (
              <div key={owner.owner} className="rounded-xl border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-foreground font-mono">
                    {owner.owner}
                  </div>
                  <Badge variant="info" size="sm">
                    {owner.list.length} accounts
                  </Badge>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {owner.list.slice(0, 4).map((account) => (
                    <div key={account.address} className="flex items-center gap-2">
                      <Wallet className="h-3 w-3 text-primary" />
                      <span className="font-mono text-foreground">{account.label}</span>
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                      <span>{account.lamports} lamports</span>
                    </div>
                  ))}
                  {owner.list.length > 4 && (
                    <div className="text-xs text-muted-foreground">
                      +{owner.list.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
