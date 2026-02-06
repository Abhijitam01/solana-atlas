"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2, Play, Copy, Check } from "lucide-react";
import { useTransactionStore } from "@/stores/transaction";
import { useTemplate } from "@/hooks/use-templates";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { HelpIcon } from "@/components/ui/HelpIcon";
import { Tooltip } from "@/components/ui/Tooltip";

export function TransactionBuilder() {
  const params = useParams();
  const templateId = params.templateId as string;
  const { data: template } = useTemplate(templateId);
  const {
    instructions,
    accounts,
    addInstruction,
    removeInstruction,
    removeAccount,
    reset,
  } = useTransactionStore();
  const [copied, setCopied] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<string | null>(null);

  const handleAddInstruction = () => {
    if (!template?.programMap?.instructions.length) return;

    const firstInstruction = template.programMap.instructions[0];
    const newInstruction = {
      id: `inst-${Date.now()}`,
      programId: "program",
      instructionName: firstInstruction.name,
      accounts: firstInstruction.accounts.map((acc: typeof firstInstruction.accounts[number], idx: number) => ({
        pubkey: `account-${idx}`,
        isSigner: acc.isSigner || false,
        isWritable: acc.isMut || false,
      })),
    };
    addInstruction(newInstruction);
    setSelectedInstruction(newInstruction.id);
  };

  const handleCopyTransaction = async () => {
    const txData = {
      instructions,
      accounts,
    };
    await navigator.clipboard.writeText(JSON.stringify(txData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = () => {
    // TODO: Execute transaction
    console.log("Executing transaction:", { instructions, accounts });
  };

  const estimatedFee = instructions.length * 5000; // Simplified fee calculation

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel flex h-full flex-col"
    >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Transaction Builder</h2>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip content="Copy transaction JSON">
            <button
              onClick={handleCopyTransaction}
              className="rounded-lg p-1.5 transition-colors hover:bg-muted/60"
              aria-label="Copy"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </Tooltip>
          <HelpIcon
            content="Build transactions visually by adding instructions and accounts. Drag to reorder."
            side="left"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Instructions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Instructions
            </h3>
            <button
              onClick={handleAddInstruction}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>

          <AnimatePresence>
            {instructions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 text-sm text-muted-foreground"
              >
                No instructions. Click Add to create an instruction.
              </motion.div>
            ) : (
              instructions.map((instruction, index) => (
                <motion.div
                  key={instruction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`p-3 rounded-lg border transition-all duration-fast ${
                    selectedInstruction === instruction.id
                      ? "bg-primary-light/50 border-primary"
                      : "bg-muted/30 border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="cursor-move mt-1">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-semibold text-foreground">
                            {instruction.instructionName}
                          </span>
                          <Badge variant="info" size="sm">
                            {index + 1}
                          </Badge>
                        </div>
                        <button
                          onClick={() => removeInstruction(instruction.id)}
                          className="p-1 rounded-lg hover:bg-destructive-light transition-colors"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Accounts:</div>
                        {instruction.accounts.map((acc: typeof instruction.accounts[number], accIdx: number) => (
                          <div
                            key={accIdx}
                            className="flex items-center gap-2 text-xs font-mono"
                          >
                            <span className="text-foreground">{acc.pubkey}</span>
                            <div className="flex gap-1">
                              {acc.isSigner && (
                                <Badge variant="success" size="sm">signer</Badge>
                              )}
                              {acc.isWritable && (
                                <Badge variant="warning" size="sm">writable</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Accounts */}
        {accounts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Accounts
            </h3>
            <div className="space-y-1">
              {accounts.map((account) => (
                <div
                  key={account.pubkey}
                  className="p-2 rounded-lg bg-muted/30 border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-foreground">{account.label}</span>
                    <div className="flex gap-1">
                      {account.isSigner && (
                        <Badge variant="success" size="sm">signer</Badge>
                      )}
                      {account.isWritable && (
                        <Badge variant="warning" size="sm">writable</Badge>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeAccount(account.pubkey)}
                    className="p-1 rounded-lg hover:bg-destructive-light transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction Summary */}
        {instructions.length > 0 && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <div className="text-xs font-semibold text-muted-foreground mb-2">
              Transaction Summary
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Instructions:</span>
                <span className="text-foreground">{instructions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Fee:</span>
                <span className="text-foreground">{estimatedFee} lamports</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
        <button
          onClick={reset}
          className="px-3 py-1.5 text-xs rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleExecute}
          disabled={instructions.length === 0}
          className="px-4 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Play className="w-3 h-3" />
          Execute
        </button>
      </div>
    </motion.div>
  );
}
