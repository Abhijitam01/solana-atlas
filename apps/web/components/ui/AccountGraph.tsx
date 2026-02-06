"use client";

import { motion } from "framer-motion";
import { Database, Key, Link2 } from "lucide-react";

export interface AccountNode {
  id: string;
  label: string;
  type: "account" | "pda" | "program" | "system";
  owner?: string;
  isMut?: boolean;
  isSigner?: boolean;
  x: number;
  y: number;
  data?: Record<string, unknown>;
}

export interface AccountEdge {
  from: string;
  to: string;
  type: "owns" | "references" | "derives" | "calls";
  label?: string;
}

interface AccountGraphProps {
  nodes: AccountNode[];
  edges: AccountEdge[];
  onNodeClick?: (node: AccountNode) => void;
  selectedNodeId?: string;
}

export function AccountGraph({
  nodes,
  edges,
  onNodeClick,
  selectedNodeId,
}: AccountGraphProps) {

  const handleNodeClick = (node: AccountNode) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const getNodeIcon = (type: AccountNode["type"]) => {
    switch (type) {
      case "pda":
        return <Key className="w-4 h-4" />;
      case "program":
        return <Link2 className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getNodeColor = (type: AccountNode["type"]) => {
    switch (type) {
      case "pda":
        return "bg-info text-info-foreground border-info";
      case "program":
        return "bg-primary text-primary-foreground border-primary";
      case "system":
        return "bg-success text-success-foreground border-success";
      default:
        return "bg-muted text-foreground border-border";
    }
  };

  const getEdgeColor = (type: AccountEdge["type"]) => {
    switch (type) {
      case "owns":
        return "stroke-success";
      case "derives":
        return "stroke-info";
      case "calls":
        return "stroke-warning";
      default:
        return "stroke-border";
    }
  };

  return (
    <div className="relative w-full h-full overflow-auto bg-muted/20 p-8">
      <svg className="absolute inset-0 w-full h-full">
        {/* Draw edges */}
        {edges.map((edge: AccountEdge, index: number) => {
          const fromNode = nodes.find((n: AccountNode) => n.id === edge.from);
          const toNode = nodes.find((n: AccountNode) => n.id === edge.to);
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
                className={`${getEdgeColor(edge.type)} transition-opacity duration-fast`}
                markerEnd="url(#arrowhead)"
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
            className={`absolute cursor-pointer transition-all duration-fast border-2 ${getNodeColor(
              node.type
            )} ${
              isSelected
                ? "ring-2 ring-primary ring-offset-2 scale-110"
                : "hover:scale-105"
            } rounded-lg shadow-lg`}
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="px-3 py-2 flex items-center gap-2 min-w-[120px]">
              {getNodeIcon(node.type)}
              <div className="flex-1">
                <div className="text-xs font-semibold whitespace-nowrap">
                  {node.label}
                </div>
                <div className="flex gap-1 mt-1">
                  {node.isMut && (
                    <span className="text-[10px] px-1 py-0.5 rounded bg-background/50">
                      mut
                    </span>
                  )}
                  {node.isSigner && (
                    <span className="text-[10px] px-1 py-0.5 rounded bg-background/50">
                      signer
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

