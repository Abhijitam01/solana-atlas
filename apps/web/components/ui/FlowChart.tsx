"use client";

import { motion } from "framer-motion";
import { usePlaygroundStore } from "@/stores/playground";
import { shallow } from "zustand/shallow";

export interface FlowNode {
  id: string;
  label: string;
  type: "instruction" | "account" | "cpi" | "start" | "end";
  line?: number;
  x: number;
  y: number;
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

interface FlowChartProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onNodeClick?: (node: FlowNode) => void;
  selectedNodeId?: string;
}

export function FlowChart({
  nodes,
  edges,
  onNodeClick,
  selectedNodeId,
}: FlowChartProps) {
  const { setSelectedLine, setSelectedInstruction } = usePlaygroundStore(
    (state) => ({
      setSelectedLine: state.setSelectedLine,
      setSelectedInstruction: state.setSelectedInstruction,
    }),
    shallow
  );

  const handleNodeClick = (node: FlowNode) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
    if (node.line) {
      setSelectedLine(node.line);
    }
    if (node.type === "instruction") {
      setSelectedInstruction(node.id);
    }
  };

  const nodeColors = {
    instruction: "bg-primary text-primary-foreground",
    account: "bg-info text-info-foreground",
    cpi: "bg-warning text-warning-foreground",
    start: "bg-success text-success-foreground",
    end: "bg-destructive text-destructive-foreground",
  };

  const nodeShapes = {
    instruction: "rounded-lg",
    account: "rounded-full",
    cpi: "rounded-lg",
    start: "rounded-full",
    end: "rounded-full",
  };

  return (
    <div className="relative w-full h-full overflow-auto bg-muted/20 p-8">
      <svg className="absolute inset-0 w-full h-full">
        {/* Draw edges */}
        {edges.map((edge: FlowEdge, index: number) => {
          const fromNode = nodes.find((n: FlowNode) => n.id === edge.from);
          const toNode = nodes.find((n: FlowNode) => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          // Calculate edge position
          // const dx = toNode.x - fromNode.x;
          // const dy = toNode.y - fromNode.y;

          return (
            <g key={index}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="hsl(var(--border))"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
                className="transition-opacity duration-fast"
              />
              {edge.label && (
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 5}
                  textAnchor="middle"
                  className="text-xs fill-muted-foreground"
                  fontSize="10"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill="hsl(var(--border))"
            />
          </marker>
        </defs>
      </svg>

      {/* Render nodes */}
      {nodes.map((node) => {
        const isSelected = selectedNodeId === node.id;
        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: nodes.indexOf(node) * 0.1 }}
            onClick={() => handleNodeClick(node)}
            className={`absolute cursor-pointer transition-all duration-fast ${
              nodeColors[node.type]
            } ${nodeShapes[node.type]} ${
              isSelected
                ? "ring-2 ring-primary ring-offset-2 scale-110"
                : "hover:scale-105"
            }`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="px-3 py-2 text-xs font-medium whitespace-nowrap">
              {node.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
