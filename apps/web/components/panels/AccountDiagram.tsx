"use client";

import { useTemplate } from "@/hooks/use-templates";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Network } from "lucide-react";
import { motion } from "framer-motion";
import { AccountGraph, AccountNode, AccountEdge } from "@/components/ui/AccountGraph";
import { HelpIcon } from "@/components/ui/HelpIcon";
import { Badge } from "@/components/ui/Badge";

export function AccountDiagram() {
  const params = useParams();
  const templateId = params.templateId as string;
  const { data: template } = useTemplate(templateId);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    if (!template?.programMap) {
      return { nodes: [], edges: [] };
    }

    const accountNodes: AccountNode[] = [];
    const accountEdges: AccountEdge[] = [];

    // Add program node
    accountNodes.push({
      id: "program",
      label: template.metadata.name,
      type: "program",
      x: 200,
      y: 100,
    });

    // Add system program
    accountNodes.push({
      id: "system-program",
      label: "System Program",
      type: "system",
      x: 400,
      y: 100,
    });

    // Process instructions and their accounts
    template.programMap.instructions.forEach((instruction: typeof template.programMap.instructions[number], instIndex: number) => {
      instruction.accounts.forEach((account: typeof instruction.accounts[number], accIndex: number) => {
        const nodeId = `${instruction.name}-${account.name}`;
        const x = 100 + (instIndex % 2) * 300;
        const y = 200 + accIndex * 80;

        // Check if account is a PDA
        const isPDA = account.isPda || false;

        accountNodes.push({
          id: nodeId,
          label: account.name,
          type: isPDA ? "pda" : "account",
          owner: account.owner,
          isMut: account.isMut,
          isSigner: account.isSigner,
          x,
          y,
        });

        // Connect account to program
        accountEdges.push({
          from: "program",
          to: nodeId,
          type: "references",
          label: instruction.name,
        });

        // If account has owner, connect to owner
        if (account.owner && account.owner !== "program") {
          const ownerNode = accountNodes.find((n) => n.id === account.owner);
          if (!ownerNode && account.owner === "11111111111111111111111111111111") {
            // System program
            accountEdges.push({
              from: "system-program",
              to: nodeId,
              type: "owns",
            });
          }
        }

        // If PDA, show derivation relationship
        if (isPDA) {
          accountEdges.push({
            from: "program",
            to: nodeId,
            type: "derives",
            label: "PDA",
          });
        }
      });
    });

    // Add CPI program nodes
    if (template.programMap.cpiCalls) {
      template.programMap.cpiCalls.forEach((cpi: typeof template.programMap.cpiCalls[number], index: number) => {
        const cpiNodeId = `cpi-${cpi.program}`;
        const existingNode = accountNodes.find((n) => n.id === cpiNodeId);

        if (!existingNode) {
          accountNodes.push({
            id: cpiNodeId,
            label: cpi.program,
            type: "program",
            x: 500,
            y: 200 + index * 100,
          });

          accountEdges.push({
            from: "program",
            to: cpiNodeId,
            type: "calls",
            label: "CPI",
          });
        }
      });
    }

    return { nodes: accountNodes, edges: accountEdges };
  }, [template]);

  if (!template?.programMap) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel flex h-full flex-col"
      >
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Account Relationships</h2>
          </div>
        </div>
        <div className="flex-1 p-4 text-sm text-muted-foreground flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </motion.div>
    );
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel flex h-full flex-col"
    >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Account Relationships</h2>
        </div>
        <HelpIcon
          content="Visual representation of account relationships, ownership, and PDAs. Click nodes to explore."
          side="left"
        />
      </div>
      <div className="flex-1 overflow-hidden relative">
        {nodes.length > 0 ? (
          <AccountGraph
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId || undefined}
            onNodeClick={(node) => setSelectedNodeId(node.id)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No account data available
          </div>
        )}
      </div>
      {selectedNode && (
        <div className="px-4 py-3 border-t border-border bg-muted/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">{selectedNode.label}</span>
            <Badge
              variant={
                selectedNode.type === "pda"
                  ? "info"
                  : selectedNode.type === "program"
                  ? "default"
                  : "default"
              }
              size="sm"
            >
              {selectedNode.type}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedNode.isMut && (
              <Badge variant="warning" size="sm">Mutable</Badge>
            )}
            {selectedNode.isSigner && (
              <Badge variant="success" size="sm">Signer</Badge>
            )}
            {selectedNode.owner && (
              <div className="text-xs text-muted-foreground">
                Owner: <span className="font-mono">{selectedNode.owner}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
