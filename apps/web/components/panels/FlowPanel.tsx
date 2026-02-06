"use client";

import { useTemplate } from "@/hooks/use-templates";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { GitBranch, Network } from "lucide-react";
import { motion } from "framer-motion";
import { FlowChart, FlowNode, FlowEdge } from "@/components/ui/FlowChart";
import { HelpIcon } from "@/components/ui/HelpIcon";

export function FlowPanel() {
  const params = useParams();
  const templateId = params.templateId as string;
  const { data: template } = useTemplate(templateId);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"control" | "data">("control");

  const { nodes, edges } = useMemo(() => {
    if (!template?.programMap) {
      return { nodes: [], edges: [] };
    }

    const flowNodes: FlowNode[] = [];
    const flowEdges: FlowEdge[] = [];

    // Add start node
    flowNodes.push({
      id: "start",
      label: "Start",
      type: "start",
      x: 100,
      y: 50,
    });

    // Add instruction nodes
    const instructions = template.programMap.instructions;
    instructions.forEach((instruction: typeof instructions[number], index: number) => {
      const x = 100 + (index % 3) * 200;
      const y = 150 + Math.floor(index / 3) * 150;

      flowNodes.push({
        id: instruction.name,
        label: instruction.name,
        type: "instruction",
        line: instruction.lineStart,
        x,
        y,
      });

      // Connect to previous instruction or start
      if (index === 0) {
        flowEdges.push({
          from: "start",
          to: instruction.name,
        });
      } else {
        flowEdges.push({
          from: instructions[index - 1].name,
          to: instruction.name,
        });
      }

      // Add account nodes for this instruction
      instruction.accounts.forEach((account: typeof instruction.accounts[number], accIndex: number) => {
        const accX = x + 150;
        const accY = y - 60 + accIndex * 40;
        const accId = `${instruction.name}-${account.name}`;

        flowNodes.push({
          id: accId,
          label: account.name,
          type: "account",
          x: accX,
          y: accY,
        });

        flowEdges.push({
          from: instruction.name,
          to: accId,
          label: account.isMut ? "mut" : account.isSigner ? "signer" : undefined,
        });
      });
    });

    // Add CPI call nodes
    if (template.programMap.cpiCalls) {
      template.programMap.cpiCalls.forEach((cpi: typeof template.programMap.cpiCalls[number], index: number) => {
        const cpiX = 700;
        const cpiY = 150 + index * 100;

        flowNodes.push({
          id: `cpi-${index}`,
          label: `${cpi.program} → ${cpi.instruction}`,
          type: "cpi",
          x: cpiX,
          y: cpiY,
        });

        // Connect to relevant instruction (simplified - would need actual mapping)
        if (instructions.length > 0) {
          flowEdges.push({
            from: instructions[instructions.length - 1].name,
            to: `cpi-${index}`,
            label: "CPI",
          });
        }
      });
    }

    // Add end node
    const lastInstruction = instructions[instructions.length - 1];
    if (lastInstruction) {
      const endX = 100 + ((instructions.length - 1) % 3) * 200;
      const endY = 150 + Math.floor((instructions.length - 1) / 3) * 150 + 100;

      flowNodes.push({
        id: "end",
        label: "End",
        type: "end",
        x: endX,
        y: endY,
      });

      flowEdges.push({
        from: lastInstruction.name,
        to: "end",
      });
    }

    return { nodes: flowNodes, edges: flowEdges };
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
            <h2 className="text-sm font-semibold text-foreground">Program Flow</h2>
          </div>
        </div>
        <div className="flex-1 p-4 text-sm text-muted-foreground flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel flex h-full flex-col"
    >
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Program Flow</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
            <button
              onClick={() => setViewMode("control")}
              className={`rounded px-2 py-1 text-xs transition-colors ${
                viewMode === "control"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GitBranch className="w-3 h-3 inline mr-1" />
              Control
            </button>
            <button
              onClick={() => setViewMode("data")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                viewMode === "data"
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Network className="w-3 h-3 inline mr-1" />
              Data
            </button>
          </div>
          <HelpIcon
            content="Visual representation of program execution flow. Click nodes to jump to code."
            side="left"
          />
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        {nodes.length > 0 ? (
          <FlowChart
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNodeId || undefined}
            onNodeClick={(node) => setSelectedNodeId(node.id)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No flow data available
          </div>
        )}
      </div>
      {selectedNodeId && (
        <div className="px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
          Selected: {selectedNodeId}
        </div>
      )}
    </motion.div>
  );
}
